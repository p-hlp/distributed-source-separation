import torch
import numpy as np


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


def soundfile_to_librosa(audiodata: np.ndarray) -> np.ndarray:
    """
    Converts an audio data array from soundfile format (N_samples, N_channels)
    to librosa format (N_channels, N_samples).
    Accessing the resulting array with audiodata[0] will give the first channel.

    Parameters:
    audiodata (numpy.ndarray): Audio data array from soundfile.read.

    Returns:
    numpy.ndarray: Transposed audio data array suitable for librosa.
    """
    # Check if audiodata is already two-dimensional
    if audiodata.ndim == 1:
        # Convert from (N_samples,) to (1, N_samples) for mono files
        audiodata = audiodata[np.newaxis, :]
    # Transpose to change shape from (N_samples, N_channels) to (N_channels, N_samples)
    return audiodata.transpose()


def librosa_to_soundfile(audiodata: np.ndarray) -> np.ndarray:
    """
    Converts an audio data array from librosa format (N_channels, N_samples)
    to soundfile format (N_samples, N_channels).

    Parameters:
    audiodata (numpy.ndarray): Audio data array in librosa format.

    Returns:
    numpy.ndarray: Transposed audio data array suitable for soundfile.write.
    """
    # Transpose to change shape from (N_channels, N_samples) to (N_samples, N_channels)
    return audiodata.transpose()
