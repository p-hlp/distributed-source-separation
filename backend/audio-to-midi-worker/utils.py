import numpy as np
import tensorflow as tf


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


def setup_gpu():
    """
    Checks if a GPU is available.
    """
    physical_devices = tf.config.list_physical_devices("GPU")
    available_gpus = len(physical_devices)
    if not physical_devices:
        print("No GPU available.")
    else:
        print(f"{available_gpus} GPUs available.")
        for device in physical_devices:
            print(f"Device name: {device.name}, Device type: {device.device_type}")
        if available_gpus > 1:
            print("Multiple GPUs available.")
        else:
            try:
                target_gpu = physical_devices[0]
                # Set memory limit for GPU
                tf.config.set_logical_device_configuration(
                    target_gpu,
                    [tf.config.LogicalDeviceConfiguration(memory_limit=12288)],
                )
            except RuntimeError as e:
                print(f"Error: {e}")
                print("Failed to set memory limit for GPU.")
