# Transcribe Worker

This worker uses [OpenAI Whisper](https://github.com/openai/whisper) to transcribe audio to text.

# Getting started

Follow the [setup](https://github.com/openai/whisper?tab=readme-ov-file#setup) on the whisper repository.

## Dependencies

Install needed dependencies manually:

```shell
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

Run it manually with `python worker.py` or use the `Dockerfile` start it as container.
When starting it manually the prisma client needs to be intantiated first. For that do the following:

```shell
prisma db push # This pushes the current `prisma.schema` to db
prisma generate # Generate client incl. types
```
