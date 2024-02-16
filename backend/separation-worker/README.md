# Separation Worker

Uses [DemucsV4](https://github.com/facebookresearch/demucs) for separating audio files.

# Using docker

tbd

# Running locally

One of the dependencies is [audiowaveform](https://github.com/bbc/audiowaveform), which handles calculating a downsampled representation of an uploaded audio file. For installation refer to their [installation guide](https://github.com/bbc/audiowaveform?tab=readme-ov-file#installation) or if using ubuntu do:

```bash
sudo add-apt-repository ppa:chris-needham/ppa
sudo apt-get update
sudo apt-get install audiowaveform
```

Further, on MacOs install [soundstretch/soundtouch](https://www.surina.net/soundtouch/soundstretch.html) with:

```bash
brew install sound-touch
```

For Linux you can install `PySoundFile` as torchaudio backend later.

Install conda/miniconda if you haven't already.

Create a new conda environment with `python=3.10` or version of you liking.

```bash
conda create --name separation python=3.10
```

Activate the environment with:

```bash
conda activate separation
```

Install pytorch and dependencies using conda/miniconda:

```bash
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
```

A detailed guide how to get started with PyTorch for your environment / system can be found [here](https://pytorch.org/get-started/locally/).

Other needed dependencies:

```bash
pip install git+https://github.com/CarlGao4/demucs.git@4.1.0-update
pip install bullmq prisma minio asyncio ffmpeg
```

Additionally for linux:

```bash
pip install PySoundFile
```

Generate prisma client, api-gateway should've been started by now and a db should exist:

```bash
prisma db pull
prisma generate
```

## First start

Start the worker with `python worker.py`, you will see whether any GPU is for accelerated computing is available and the model downloading from meta's public file registry.

Once thats done, the worker is ready process jobs.

## Configuring demucs models

In `worker.py` where the `SeparationProcessor` is instantiated, you can pass the `model` parameter.

- `htdemucs` Demucs V3
- `htdemucs_ft` Demucs V4 (Hybrid Transformer)
