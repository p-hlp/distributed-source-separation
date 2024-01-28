import torch

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
