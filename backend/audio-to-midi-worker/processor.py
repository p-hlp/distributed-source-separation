from prisma import Prisma
from minio import Minio
import os
from dotenv import load_dotenv
from bullmq import Job
from tensorflow.python.trackable.autotrackable import AutoTrackable
import tensorflow as tf
from basic_pitch import ICASSP_2022_MODEL_PATH
import io
import soundfile as sf
from datetime import timedelta
from utils import soundfile_to_librosa
import librosa
from basic_pitch.inference import predict_and_save
import uuid
import shutil


load_dotenv()


class Processor:
    def __init__(self):
        self.prisma = Prisma()
        self.minio_client = None
        self.initialize_minio_client()
        self.model = self.load_model()

    async def connect_to_db(self):
        await self.prisma.connect()

    async def disconnect_from_db(self):
        await self.prisma.disconnect()

    def initialize_minio_client(self):
        self.minio_access_key = os.getenv("MINIO_ACCESS_KEY")
        self.minio_secret_key = os.getenv("MINIO_SECRET_KEY")
        self.minio_endpoint = os.getenv("MINIO_ENDPOINT")
        self.minio_port = int(os.getenv("MINIO_PORT", 9000))
        self.minio_default_bucket = os.getenv("MINIO_DEFAULT_BUCKET")

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

    def load_model(self) -> AutoTrackable | None:
        saved_model = tf.saved_model.load(str(ICASSP_2022_MODEL_PATH))
        return saved_model

    async def process(self, job: Job, jobToken: str):
        await self.connect_to_db()
        try:
            audioFileId = job.data["audioFileId"]
            userId = job.data["userId"]

            audio_file = await self.prisma.audiofile.find_first(
                where={"id": audioFileId, "userId": userId}
            )

            print(f"Found audio file: {audio_file.name}, processing...")

            if audio_file is None:
                print("Audio file not found")
                raise Exception("Audio file not found")

            # Get the audio file from Minio
            file_path = audio_file.filePath
            file_type = audio_file.fileType
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
            data, sample_rate = sf.read(audio_buffer)
            print(f"Sample rate: {sample_rate}, data shape: {data.shape}")
            duration = len(data) / sample_rate
            print(f"Duration: {timedelta(seconds=round(duration))} seconds")

            # Convert to librosa format
            audio_data = soundfile_to_librosa(data)
            mono_audio_data = librosa.to_mono(audio_data)
            estimated_tempo = librosa.beat.beat_track(y=mono_audio_data, sr=sample_rate)
            tempo = round(estimated_tempo[0])
            print(f"Estimated tempo: {tempo}bpm")

            # Temporarily save the audio file to disk
            # TODO - Remove this and use the audio buffer directly

            # Check if userId dir exists
            if not os.path.exists(userId):
                os.makedirs(userId)

            file = f"{userId}/{audio_file.name}.{file_type}"
            sf.write(
                file=file,
                data=data,
                samplerate=sample_rate,
                format=file_type,
            )

            # Predict and save the midi file
            # TODO - Use predict with pre-loaded model, use audio buffer instead of file
            # Check if output dir exists
            if not os.path.exists("output"):
                os.makedirs("output")

            predict_and_save(
                [file],
                "output",
                save_midi=True,
                sonify_midi=False,
                save_model_outputs=False,
                save_notes=False,
                midi_tempo=tempo,
            )

            # Find *.mid file in output directory
            midi_file = None
            for file in os.listdir("output"):
                if file.endswith(".mid"):
                    midi_file = file
                    break

            if midi_file is None:
                print("Midi file not found")
                raise Exception("Midi file not found")
            else:
                print(f"Midi file found: {midi_file}")

            # Save the midi file to Minio
            midi_path = f"output/{midi_file}"
            object_name = f"{userId}/{uuid.uuid4()}.mid"
            self.minio_client.fput_object(
                bucket_name=self.minio_default_bucket,
                object_name=object_name,
                file_path=midi_path,
                metadata={"mimeType": "audio/midi", "name": midi_file, "tempo": tempo},
            )

            # Create MidiFile record in database and update MidiFile on AudioFile
            midi_file = await self.prisma.midifile.create(
                {
                    "userId": userId,
                    "name": midi_file,
                    "filePath": object_name,
                    "audioFileId": audioFileId,
                }
            )

            print(f"Created midi file: {midi_file.id}")

            shutil.rmtree("output/")
            shutil.rmtree(userId)
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
            shutil.rmtree("output/")
            shutil.rmtree(userId)
            result = {
                "userId": userId,
                "audioFileId": audioFileId,
                "status": "failed",
                "error": str(e),
            }
            raise RuntimeError(result)
