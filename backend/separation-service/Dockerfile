# Start from the NVIDIA CUDA base image
FROM nvidia/cuda:12.2.2-base-ubuntu22.04

# Set any environment variables
ENV TEST=TEST123

RUN apt-get update && \
    apt-get install -y \
        git \
        python3-pip \
        python3-dev \
        libglib2.0-0

COPY requirements.txt requirements.txt

RUN python3 -m pip install -r requirements.txt

RUN python3 -m pip install --upgrade pip

RUN pip3 install torch torchvision torchaudio -f https://download.pytorch.org/whl/cu111/torch_stable.html

WORKDIR /app

ENTRYPOINT [ "python3" ]
