# Transcribe Worker

This worker uses [OpenAI Whisper](https://github.com/openai/whisper) to transcribe audio to text.

# Getting started

Follow the [setup](https://github.com/openai/whisper?tab=readme-ov-file#setup) on the whisper repository.

## Dependencies

Install conda/miniconda if you haven't already.

### Using conda environment file

You can use the provided `environment.yml` file to get started fast.

```bash
conda env create -f environment.yml
```

### Manually installing dependencies

```shell
conda env create --name transcription python=3.10
conda activate transcription
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
pip install -r requirements.txt
```

Or install from `environment.yml` file if using conda/mindiconda:

```shell
conda env create -f environment.yml
conda activate transcribe
```

## Secrets / Environment Variables

Copy the template from `.env.template` into `.env` and grab the needed secrets from Auth0. For the environment variables for minio, postgres and redis make sure they match whatever is configured in `backend/docker/local/docker-compose.yml` or its environment file.

## Running the Worker

Run it manually with `python worker.py` or use the `Dockerfile` (tbd) start it as container.
When starting it manually the prisma client needs to be intantiated first. For that do the following:

```shell
prisma db push # This pushes the current `prisma.schema` to db
prisma generate # Generate client incl. types
```

## Configuring OpenAI Whisper

In `processor.py` line 117 you can further configure whisper to your likings, simply modify the arguments passed to `transcribe`, see [docs](https://github.com/openai/whisper?tab=readme-ov-file#python-usage) for further comments on the usage.

```python
self.model.transcribe(audio=whisper_audio)
```
