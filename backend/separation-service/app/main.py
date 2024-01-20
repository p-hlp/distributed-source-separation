from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import torch as th
import demucs.api
import io
import torchaudio as ta
import os
from uuid import uuid4
from pydantic import BaseModel
from librosa import beat
import librosa

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

separator = demucs.api.Separator(device="cuda", model="htdemucs_ft")


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health", status_code=200)
async def read_health():
    return {"status": "OK", "cuda_available": th.cuda.is_available()}


@app.post("/upload", status_code=200)
async def upload_file(file: UploadFile):
    return {"filename": file.filename, "content_type": file.content_type}


# content type mappings to file endings

content_type_to_file_type = {
    "audio/wav": "wav",
    "audio/flac": "flac",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/x-wav": "wav",
    "audio/x-flac": "flac",
    "audio/x-mp3": "mp3",
    "audio/x-ogg": "ogg",
    "audio/x-mpeg": "mp3",
}


@app.post("/separate")
async def separate(file: UploadFile):
    try:
        contents = await file.read()
        file_like_object = io.BytesIO(contents)
        file_format = file.content_type.split("/")[-1]
        file_ending = content_type_to_file_type.get(file.content_type)
        print(f"File format: {file_format}")
        print(f"File ending: {file_ending}")
        waveform, sample_rate = ta.load(file_like_object, format=file_format)

        print(f"Sample rate: {sample_rate}")

        print(f"Model: {separator._name}")

        _, separated = separator.separate_tensor(waveform, sr=sample_rate)

        # stems count
        print(f"Stems count: {len(separated)}")

        id = str(uuid4())
        request_path = os.path.join("../file-db", id)
        os.makedirs(request_path, exist_ok=True)
        print(f"Request path: {request_path}")

        # save full mix
        full_mix_path = os.path.join(request_path, f"full.{file_ending}")
        demucs.api.save_audio(waveform, full_mix_path, samplerate=sample_rate)
        print(f"Full mix saved at: {full_mix_path}")

        # save stems
        for stem, source in separated.items():
            file_path = f"{stem}.{file_ending}"
            save_path = os.path.join(request_path, file_path)
            demucs.api.save_audio(source, save_path, samplerate=sample_rate)
            print(f"File saved at: {save_path}")

        # detect bpm from drum track
        y, sr = librosa.load(full_mix_path, sr=sample_rate)
        beat_times = beat.beat_track(y=y, sr=sr)[0]
        print(f"Beat times: {beat_times}")

        return {"id": id, "metaData": {"bpm": beat_times}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class GetStemRequest(BaseModel):
    id: str
    name: str


@app.get("/stems/{id}/{fileName}")
async def get_stem(id: str, fileName: str):
    file_path = os.path.join(id, fileName)
    full_path = os.path.join("../file-db", file_path)
    print(f"Attempting to serve file at: {full_path}")  # Log the path
    if not os.path.exists(full_path):
        print("File does not exist")  # Log if file doesn't exist
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)
