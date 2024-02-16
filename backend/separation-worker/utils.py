import torch
import asyncio
import os
import json
from prisma import fields

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


def check_device():
    if torch.backends.mps.is_available():
        print("MPS available!")
        mps_device = torch.device("mps")
        # x = torch.ones(1, device=mps_device)
    elif torch.cuda.is_available():
        print("CUDA available!")
        cuda_device = torch.device("cuda")
        # x = torch.ones(1, device=cuda_device)
    else:
        print("No GPU Device available, defaulting to CPU")


async def generate_waveform_json(file_path: str) -> fields.Json | None:
    out_path = file_path.split(".")[0] + ".json"

    cmd = [
        "audiowaveform",
        "-i",
        file_path,
        "-o",
        out_path,
        "--pixels-per-second",
        "20",
        "--bits",
        "8",
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )

    await process.communicate()

    if process.returncode == 0:
        try:
            with open(out_path, mode="r", encoding="utf-8") as f:
                json_content = json.load(f)
            os.remove(out_path)
            return fields.Json(json_content)
        except Exception as e:
            print(f"Error reading or removing waveform JSON: {e}")
            raise RuntimeError(f"Error reading or removing waveform JSON: {e}")
    else:
        print("Error generating waveform.")
        raise RuntimeError("Error generating waveform.")
