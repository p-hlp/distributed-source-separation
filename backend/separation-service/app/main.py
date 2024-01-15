from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import torch as th
import demucs.api
import io
import torchaudio as ta
import os
from uuid import uuid4


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

        stem_urls = []
        stem_folder = f"stems/{str(uuid4())}"  # Unique folder for each request
        os.makedirs(stem_folder, exist_ok=True)

        for stem, source in separated.items():
            stem_path = f"{stem_folder}/{stem}.{file_ending}"
            demucs.api.save_audio(source, stem_path, samplerate=sample_rate)
            print(f"File saved at: {stem_path}")
            stem_urls.append(f"/{stem_path}")

        return {"stems": stem_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stems/{file_path:path}")
async def get_stem(file_path: str):
    full_path = os.path.join("stems", file_path)
    print(f"Attempting to serve file at: {full_path}")  # Log the path
    if not os.path.exists(full_path):
        print("File does not exist")  # Log if file doesn't exist
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)
