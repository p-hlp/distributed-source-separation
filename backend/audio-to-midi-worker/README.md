# Audio to Midi Worker

Uses [Basic-Pitch](https://github.com/spotify/basic-pitch) to convert audio to midi files.

# Using doker

tbd

# Running locally

Install conda/miniconda if you haven't already.

### Using conda environment file

Install needed dependencies with the provided conda `environment.yml` file.

```bash
conda env create -f environment
conda activate tf-audio
```

### Manually installing dependencies

Create and activate a new conda environment with `python=3.10`, see basic-pitch [docs](https://github.com/spotify/basic-pitch?tab=readme-ov-file#installation) for supported python version.

```bash
conda create --name tf-audio python=3.10
conda activate tf-audio
```

Install `basic-pitch` and needed dependencies, tensorflow should be pulled automatically.

```bash
pip install basic-pitch minio prisma asyncio PySoundFile numpy
```

## First start

### Generating the prisma client

Generate prisma client, api-gateway should've been started by now and a db should exist:

```bash
prisma db pull
prisma generate
```

Then copy `.env.template` to `.env` and fill out the needed env vars with your secrets.

Start the worker with `python worker.py`, you will see whether any GPU is for accelerated computing is available and the model downloading from meta's public file registry.

Once thats done, the worker is ready process jobs.

### Configuring basic-pitch

Check line 134 in `processor.py` to further configure the models input

```python
predict_and_save(
    [file],
    "output",
    save_midi=True,
    sonify_midi=False,
    save_model_outputs=False,
    save_notes=False,
    midi_tempo=tempo,
)
```

For possible function parameters for the python api see basic-pitch [docs](https://github.com/spotify/basic-pitch/blob/main/basic_pitch/inference.py#L344).
