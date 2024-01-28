import os
from prisma import Prisma
from bullmq import Job
from minio import Minio
from dotenv import load_dotenv
from demucs.api import Separator, save_audio
import torchaudio
import torch as th
import io
import uuid

# Load environment variables
load_dotenv()


class SeparationProcessor:
    def __init__(
        self,
        device: str = "cuda"
        if th.cuda.is_available()
        else "mps"
        if th.backends.mps.is_available()
        else "cpu",
        model: str = "htdemucs_ft",
    ):
        self.prisma = Prisma()
        self.minio_client = None
        self.initialize_minio_client()
        print(f"Using device: {device}")
        self.separator = Separator(model=model, device=device)

    async def connect_to_db(self):
        await self.prisma.connect()

    async def disconnect_from_db(self):
        await self.prisma.disconnect()

    def initialize_minio_client(self):
        minio_access_key = os.getenv("MINIO_ACCESS_KEY")
        minio_secret_key = os.getenv("MINIO_SECRET_KEY")
        minio_endpoint = os.getenv("MINIO_ENDPOINT")
        minio_port = int(os.getenv("MINIO_PORT", 9000))
        minio_default_bucket = os.getenv("MINIO_DEFAULT_BUCKET")

        self.minio_client = Minio(
            f"{minio_endpoint}:{minio_port}",
            access_key=minio_access_key,
            secret_key=minio_secret_key,
            secure=False,  # Set to True for HTTPS
        )

        # Ensure the default bucket exists
        if not self.minio_client.bucket_exists(minio_default_bucket):
            self.minio_client.make_bucket(minio_default_bucket)

        print("Minio client initialized.")

    async def process(self, job: Job, jobToken):
        await self.connect_to_db()
        try:
            id = job.data["audioFileId"]
            userId = job.data["userId"]
            audio_file = await self.prisma.audiofile.find_first(
                where={"id": id, "userId": userId}
            )

            print(f"Found audio file: {audio_file.name}, processing...")

            file_path = audio_file.filePath
            file_type = audio_file.fileType
            print(f"File path: {file_path}", f"File type: {file_type}")
            response = self.minio_client.get_object(
                os.getenv("MINIO_DEFAULT_BUCKET"), file_path
            )

            try:
                file_data = response.read()
            finally:
                response.close()
                response.release_conn()

            audio_buffer = io.BytesIO(file_data)
            waveform, sample_rate = torchaudio.load(audio_buffer, format=file_type)
            print(f"Sample rate: {sample_rate}")

            _, separated_stems = self.separator.separate_tensor(waveform)
            print(f"Stems count: {len(separated_stems)}")

            # Save to local file system for now
            # TODO Don't save to local file system, directly save to object storage from stream
            for stem, source in separated_stems.items():
                stem_name = uuid.uuid4()
                full_path = f"{userId}/{stem_name}.{file_type}"
                # check if userId folder exists
                if not os.path.exists(userId):
                    os.makedirs(userId)

                save_audio(source, full_path, samplerate=sample_rate)

                self.minio_client.fput_object(
                    os.getenv("MINIO_DEFAULT_BUCKET"),
                    full_path,
                    file_path=full_path,
                    metadata={"mimeType": f"audio/{file_type}", "name": stem},
                )
                print(f"Saved to object storage: {stem}")

                # Save to database
                response = await self.prisma.audiofile.create(
                    {
                        "name": stem,
                        "filePath": full_path,
                        "fileType": "wav",
                        "userId": userId,
                        "parentId": id,
                    }
                )
                print(f"Saved to db: {response.id}")
                os.remove(full_path)
                print(f"Removed local file: {full_path}")

            # Remove folder
            os.rmdir(userId)

            print("Done saving stems.")

            await self.disconnect_from_db()
            return "done"
        except Exception as e:
            print(e)
            await self.disconnect_from_db()
            return "error"
