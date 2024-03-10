FROM pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime

# ARG models_dir 
ARG database_url 
# ENV MODELS_DIR=$models_dir
ENV DATABASE_URL=$database_url

# Echo the env vars 
# RUN echo "MODELS_DIR: $MODELS_DIR"
RUN echo "DATABASE_URL: $DATABASE_URL"

# Install git
RUN apt-get update && apt-get install -y git

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN python3 -m pip install --no-cache-dir --upgrade -r requirements.txt

# # Copy models if there are any
# COPY ./models/ /models

# copy download.py .
# RUN python download.py

# Copy Prisma schema file to the container
COPY /prisma/schema.prisma .

# Copy the rest of the application
COPY . .

# Generate prisma client
RUN prisma generate

# Command to run the worker
CMD ["python", "worker.py"]