import tensorflow as tf
from basic_pitch.inference import predict, predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import os
from dotenv import load_dotenv
from minio import Minio
from prisma import Prisma
import asyncio
import soundfile as sf
import io
import datetime
from utils import soundfile_to_librosa
import librosa

load_dotenv()


def init_minio_client() -> Minio:
    """
    Initialize a Minio client and ensure the default bucket exists
    """
    minio_access_key = os.getenv("MINIO_ACCESS_KEY")
    minio_secret_key = os.getenv("MINIO_SECRET_KEY")
    minio_endpoint = os.getenv("MINIO_ENDPOINT")
    minio_port = int(os.getenv("MINIO_PORT", 9000))
    minio_default_bucket = os.getenv("MINIO_DEFAULT_BUCKET", "audio")

    minio_client = Minio(
        f"{minio_endpoint}:{minio_port}",
        access_key=minio_access_key,
        secret_key=minio_secret_key,
        secure=False,  # Set to True for HTTPS
    )

    # Ensure the default bucket exists
    print(f"Ensuring bucket {minio_default_bucket} exists...")
    if not minio_client.bucket_exists(minio_default_bucket):
        minio_client.make_bucket(minio_default_bucket)

    return minio_client


# main function
async def main():
    print(f"TF Version {tf.__version__}")
    print(f"GPU is enabled: {tf.config.list_physical_devices('GPU')}")

    # UserId
    userId = "4225bbcd-9472-40de-837d-f2964e739d13"
    model = tf.saved_model.load(str(ICASSP_2022_MODEL_PATH))

    # Init Prisma client
    prisma = Prisma()
    await prisma.connect()

    # Init Minio client
    minio_client = init_minio_client()

    # Get first audio file
    audio_file = await prisma.audiofile.find_first(where={"userId": userId})

    if audio_file == None:
        print("No audio file found")
        return

    # Download audio file from Minio, open stream with soundfile dont save to disk
    file_path = audio_file.filePath
    print(f"Downloading file from Minio: {file_path}")
    response = minio_client.get_object(
        os.getenv("MINIO_DEFAULT_BUCKET", "audio"), file_path
    )
    try:
        file_data = response.read()
    finally:
        response.close()
        response.release_conn()

    audio_buffer = io.BytesIO(file_data)

    # Read audio file
    # Data is of shape (samples, channels)
    data, samplerate = sf.read(audio_buffer)
    print(f"Samplerate: {samplerate} - Data Datashape {data.shape}")

    # Calculate duration of audio file
    duration = len(data) / samplerate
    print(f"Duration: {datetime.timedelta(seconds=round(duration))}")

    # Convert audio data to librosa format
    audio_data = soundfile_to_librosa(data)
    print(f"Audio data type {type(audio_data)}")
    print(f"Audio Data Shape: {audio_data.shape}")
    tempo = round(
        librosa.beat.beat_track(y=librosa.to_mono(audio_data), sr=samplerate)[0]
    )
    print(f"Estimated tempo: {round(tempo)}bpm")
    # Check if output dir exists
    if not os.path.exists("output"):
        os.makedirs("output")

    # _, model_output, _ = predict(
    #     audio_path_or_array=audio_data,
    #     model_or_model_path=model,
    #     sample_rate=samplerate,
    # )

    # model_output.write("output.mid")

    predict_and_save(
        ["test.wav"],
        "output",
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
        model=model,
    )

    # Disconnect Prisma client
    await prisma.disconnect()


if __name__ == "__main__":
    # use asyncio to run the main function
    asyncio.run(main())
