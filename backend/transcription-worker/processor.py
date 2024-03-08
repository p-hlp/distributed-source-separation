from prisma import Prisma
from minio import Minio
import os
from dotenv import load_dotenv
from bullmq import Job
import io
import whisper
import soundfile as sf
from utils import soundfile_to_librosa, librosa_to_soundfile
import librosa
import numpy as np

load_dotenv()


class Processor:
    def __init__(self, model: str):
        """
        Initialize the processor with the specified whisper model.

        Available models:
        - "tiny.en" (english only) or "tiny"
        - "small.en" (english only) or "small"
        - "medium.en" (english only) or "medium"
        - "large"
        """
        self.prisma = Prisma()
        self.minio_client = None
        self.initialize_minio_client()
        if model not in whisper.available_models():
            raise ValueError(f"Model {model} is not available")
        self.model = whisper.load_model(model)

    async def connect_to_db(self):
        await self.prisma.connect()

    async def disconnect_from_db(self):
        await self.prisma.disconnect()

    def initialize_minio_client(self):
        self.minio_access_key = os.getenv("MINIO_ACCESS_KEY", "")
        self.minio_secret_key = os.getenv("MINIO_SECRET_KEY", "")
        self.minio_endpoint = os.getenv("MINIO_ENDPOINT", "")
        self.minio_port = int(os.getenv("MINIO_PORT", 9000))
        self.minio_default_bucket = os.getenv("MINIO_DEFAULT_BUCKET", "audio")

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

    async def process(self, job: Job, jobToken: str):
        await self.connect_to_db()
        try:
            audioFileId = job.data["audioFileId"]
            userId = job.data["userId"]

            print(f"Processing audio file: {audioFileId} for user: {userId}")

            audio_file = await self.prisma.audiofile.find_first(
                where={"id": audioFileId, "userId": userId}
            )

            print(f"Found audio file: {audio_file.name}, processing...")

            if audio_file is None:
                print("Audio file not found")
                raise Exception("Audio file not found")

            # Get the audio file from Minio
            file_path = audio_file.filePath
            print(f"Downloading file from Minio: {file_path}")

            response = self.minio_client.get_object(
                self.minio_default_bucket, file_path
            )

            try:
                file_data = response.read()
            finally:
                response.close()
                response.release_conn()

            audio_buffer = io.BytesIO(file_data)
            data, sample_rate = sf.read(audio_buffer, dtype="float32")

            # Convert the audio buffer to mono
            print(f"Converting audio to mono...")
            audio_data = soundfile_to_librosa(data)

            audio_mono = librosa.to_mono(audio_data)
            temp_path = "temp.wav"

            # TODO - Directly use the audio buffer instead of saving to a file
            sf.write(
                temp_path,
                librosa_to_soundfile(audio_mono),
                samplerate=sample_rate,
            )

            print(
                f"Audio converted to mono, data type: {audio_mono.dtype} - shape: {audio_mono.shape}"
            )

            # Transcsribe the audio buffer
            print(f"Transcribing audio...", "data type of audio_mono", audio_mono.dtype)
            # TODO - Use the audio buffer directly instead of saving to a file
            whisper_audio = whisper.load_audio(temp_path)
            result = self.model.transcribe(audio=whisper_audio)

            os.remove("temp.wav")

            current_transcription = await self.prisma.transcription.find_first(
                where={"audioFileId": audioFileId}
            )
            if current_transcription:
                print("Transcription already exists, removing...")
                await self.prisma.transcription.delete(
                    where={"audioFileId": audioFileId}
                )

            # Save the transcription to the database
            print(f"Saving transcription to the database...")
            await self.prisma.transcription.create(
                {
                    "audioFileId": audioFileId,
                    "userId": userId,
                    "text": result["text"],
                }
            )

            await self.disconnect_from_db()
            result = {
                "userId": userId,
                "audioFileId": audioFileId,
                "status": "done",
            }
            return result
        except Exception as e:
            print(e)
            await self.disconnect_from_db()
            result = {
                "userId": userId,
                "audioFileId": audioFileId,
                "status": "failed",
                "error": str(e),
            }
            raise RuntimeError(result)
