# How the hell do I run this?

## Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node](https://nodejs.org/en) - If you use a node version manager like [nvm](https://github.com/nvm-sh/nvm) / [fnm](https://github.com/Schniz/fnm) you should be prompted with the correct version through the provided `.node-versions` file
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
- [Conda](https://docs.conda.io/projects/conda/en/stable/user-guide/getting-started.html)/[Miniconda](https://docs.anaconda.com/free/miniconda/index.html) - Miniconda is prefered due to it's small footprint
- An [Auth0](https://auth0.com/) account
- [Docker Engine](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

## A few pointers

- You will need to setup an [Auth0](https://auth0.com/) account, create an application and an API
- You will only be able to access the web-client and the api endpoints as an authenticated user
- There are several `.env` files that you need to add secrets (your own) to, they are ignored by default and shoulder never be committed to your remote repository
  - `frontend/.env`
  - `backend/api-gateway/.env`
  - `backend/audio-to-midi-worker/.env`
  - `backend/docker/local/.env.local`
  - `backend/separation-worker/.env`
  - `backend/transcription-worker/.env`
- Use the `.env.template`/`.env.local.template` files as a templates
- The setup-files for conda and pip are currently only tested for CUDA devices, in theory if no GPU is detected the CPU should be used as fallback

### Running workers with GPU acceleration (CUDA)

**Direct** - Install dependencies locally (using conda or pip) and start the workers directly.

**Containerized**

- [NVIDIA GPU Drivers](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/index.html)
- [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit)

### Running workers with GPU acceleration (MacOs - Metal API)

**Direct** - Install dependencies locally (using conda or pip) and start the workers directly.

**Containerized** - TBD - Currently no setup files available to run this application containerized with GPU acceleration on arm macs.

### Running workers on CPU

**Direct** - Install dependencies locally (using conda or pip) and start the workers directly.

**Containerized** - TBD - Currently no setup files available to run this application CPU only.

## Continuing on

Check out the documentation for the individual system components:

- [Web-Client](frontend/README.md)
- [Backend](backend/README.md)
  - [API-Gateway](backend/api-gateway/README.md)
  - [Separation Worker](backend/separation-worker/README.md)
  - [Audio To Midi Worker](backend/audio-to-midi-worker/README.md)
  - [Transcription Worker](backend/transcription-worker/README.md)
