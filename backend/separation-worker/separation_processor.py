import os
from prisma import Prisma
from bullmq import Job
from minio import Minio
from dotenv import load_dotenv
from demucs.api import Separator
from demucs.audio import save_audio
import torchaudio
import torch as th
import io
import uuid
import shutil
from utils import generate_waveform_json

# Load environment variables
load_dotenv()


class SeparationProcessor:
    def __init__(
        self,
        device: str = (
            "cuda"
            if th.cuda.is_available()
            else "mps" if th.backends.mps.is_available() else "cpu"
        ),
        model: str = "htdemucs_ft",
    ):
        self.prisma = Prisma()
        self.minio_client = None
        self.initialize_minio_client()
        print(f"Using device: {device}")
        th.hub.set_dir(os.getenv("MODELS_DIR"))
        print(f"TH Hub dir: {th.hub.get_dir()}")
        self.separator = Separator(model=model, device=device)

    async def connect_to_db(self):
        await self.prisma.connect()

    async def disconnect_from_db(self):
        await self.prisma.disconnect()

    def initialize_minio_client(self):
        self.minio_access_key = os.getenv("MINIO_ACCESS_KEY", "")
        self.minio_secret_key = os.getenv("MINIO_SECRET_KEY", "")
        self.minio_endpoint = os.getenv("MINIO_ENDPOINT", "")
        self.minio_port = int(os.getenv("MINIO_PORT", 9000))
        self.minio_default_bucket = os.getenv("MINIO_DEFAULT_BUCKET", "")

        self.minio_client = Minio(
            f"{self.minio_endpoint}:{self.minio_port}",
            access_key=self.minio_access_key,
            secret_key=self.minio_secret_key,
            secure=False,  # Set to True for HTTPS
        )

        # Ensure the default bucket exists
        print(f"Ensuring bucket {self.minio_default_bucket} exists...")
        if not self.minio_client.bucket_exists(self.minio_default_bucket):
            self.minio_client.make_bucket(self.minio_default_bucket)

        print("Minio client initialized.")

    async def process(self, job: Job, jobToken):
        await self.connect_to_db()
        id = None
        userId = None
        if not self.minio_client or not self.prisma:
            raise RuntimeError("Failed to connect to Minio or Prisma")

        try:
            print(f"Processing job: {job.id} with payload: {job.data}")
            id = str(job.data["audioFileId"])
            userId = str(job.data["userId"])
            libraryId = str(job.data["libraryId"])

            audio_file = await self.prisma.audiofile.find_first(
                where={"id": id, "userId": userId}
            )

            if not audio_file:
                raise RuntimeError(f"Audio file with id {id} not found")

            print(f"Found audio file: {audio_file.name}, processing...")

            file_path = audio_file.filePath
            file_type = audio_file.fileType
            print(f"File path: {file_path}", f"File type: {file_type}")
            response = self.minio_client.get_object(
                self.minio_default_bucket, file_path
            )

            try:
                file_data = response.read()
            finally:
                response.close()
                response.release_conn()

            audio_buffer = io.BytesIO(file_data)
            waveform, sample_rate = torchaudio.load(audio_buffer)
            print(f"Sample rate: {sample_rate}")
            print("Separating stems...")
            _, separated_stems = self.separator.separate_tensor(waveform)
            print(f"Stems count: {len(separated_stems)}")

            # TODO Don't save to local file system, directly save to object storage from stream
            for stem, source in separated_stems.items():
                stem_name = uuid.uuid4()
                full_name = f"{userId}/{stem_name}"
                full_path = f"{full_name}.{file_type}"
                # check if userId folder exists
                if not os.path.exists(userId):
                    os.makedirs(userId)

                # Temporary save to local file system TODO directly save from stream
                save_audio(source, full_path, samplerate=sample_rate)

                # Save to minio
                self.minio_client.fput_object(
                    os.getenv("MINIO_DEFAULT_BUCKET") or "audio",
                    full_path,
                    file_path=full_path,
                    metadata={"mimeType": f"audio/{file_type}", "name": stem},
                )

                waveform_json = await generate_waveform_json(full_path)
                isVocal = "vocal" in stem
                # Save to database
                response = await self.prisma.audiofile.create(
                    data={
                        "name": stem,
                        "filePath": full_path,
                        "userId": userId,
                        "parentId": id,
                        "libraryId": libraryId,
                        "fileType": file_type,
                        "waveform": waveform_json,
                        "isVocal": isVocal,
                        "isSeparated": True,
                    }
                )

            # Remove folder
            shutil.rmtree(userId)

            print("Done saving stems.")
            await self.disconnect_from_db()
            result = {
                "userId": userId,
                "audioFileId": id,
                "status": "done",
            }
            return result
        except Exception as e:
            print(e)
            await self.disconnect_from_db()
            if userId and os.path.exists(userId):
                shutil.rmtree(userId)
            result = {
                "userId": userId,
                "audioFileId": id,
                "status": "failed",
                "error": str(e),
            }
            raise RuntimeError(result)
