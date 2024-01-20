from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from uuid import uuid4
import tensorflow as tf
from pydantic import BaseModel
from basic_pitch.inference import predict_and_save, predict
from basic_pitch import ICASSP_2022_MODEL_PATH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

print("-------------------")
print("TF Version: ", tf.__version__)
print("TF CUDA available: ", tf.test.is_built_with_cuda())
print("TF GPU available: ", tf.config.list_physical_devices())
print("-------------------")

basic_pitch_model = tf.saved_model.load(str(ICASSP_2022_MODEL_PATH))


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health", status_code=200)
async def read_health():
    return {"status": "OK", "cuda_available": tf.test.is_built_with_cuda()}


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


def getFileFromFileDb(id: str, name: str):
    base_path = os.path.join("..", "file-db")
    file_path = os.path.join(base_path, id, name)

    if not os.path.isdir(os.path.join(base_path, id)):
        raise HTTPException(
            status_code=404, detail=f"Directory with ID {id} does not exist"
        )

    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=404, detail=f"File '{name}' not found in directory with ID {id}"
        )
    return file_path


class ToMidiRequest(BaseModel):
    id: str
    name: str


@app.post("/convert")
async def convert(request: ToMidiRequest):
    try:
        print("Converting file to MIDI")
        file_path = getFileFromFileDb(request.id, request.name)
        print(f"File path: {file_path}")
        output_dir = os.path.join("..", "file-db", request.id)

        predict_and_save(
            audio_path_list=[file_path],
            output_directory=output_dir,
            save_midi=True,
            sonify_midi=True,
            save_model_outputs=False,
            save_notes=False,
            debug_file=False,
        )

        return
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/files/{id}")
async def get_files(id: str):
    try:
        print("Getting files")
        base_path = os.path.join("..", "file-db")
        files = os.listdir(os.path.join(base_path, id))
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
