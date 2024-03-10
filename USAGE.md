# How the hell do I run this?

### Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Conda](https://docs.conda.io/projects/conda/en/stable/user-guide/getting-started.html)/[Miniconda](https://docs.anaconda.com/free/miniconda/index.html) - Miniconda is prefered due to it's small footprint
- [Docker Engine](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running workers with GPU acceleration (CUDA)

Direct:

Run locally by starting workers directly.

Containerized:

- [NVIDIA GPU Drivers](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/index.html)
- [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit)

### Running workers with GPU acceleration (MacOs - Metal API)

Direct:

Run locally by starting workers directly.

Containerized:

There's currently no way to run this application containerized with GPU acceleration on arm macs.

### Running workers on CPU
