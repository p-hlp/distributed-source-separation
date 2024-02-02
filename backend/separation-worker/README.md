# Separation Worker

Uses [DemucsV4](https://github.com/facebookresearch/demucs) for separating audio files.

On MacOs install [soundstretch/soundtouch](https://www.surina.net/soundtouch/soundstretch.html) with `brew install sound-touch`

For Linux you can install `PySoundFile` as torchaudio backend later.

Install pytorch and dependencies using conda/miniconda:

`conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia`

A detailed guide how to get started with PyTorch for your environment / system can be found [here](https://pytorch.org/get-started/locally/).

Other needed dependencies:

- `pip install git+https://github.com/CarlGao4/demucs.git@4.1.0-update`
- `pip install bullmq prisma minio asyncio ffmpeg`
- Linux only: `pip install PySoundFile`

## First start

Start the worker with `python worker.py`, you will see whether any GPU is for accelerated computing is available and the model downloading from meta's public file registry.

Once thats done, the worker is ready process jobs.

## Configuring demucs models

In `worker.py` where the `SeparationProcessor` is instantiated, you can pass the `model` parameter.

- `htdemucs` Demucs V3
- `htdemucs_ft` Demucs V4 (Hybrid Transformer)
