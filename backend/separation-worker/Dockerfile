FROM pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime

# Install git
RUN apt-get update && apt-get install -y git

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN python3 -m pip install --no-cache-dir --upgrade -r requirements.txt

# Download models
ENV MODELS_DIR=/models
RUN mkdir -p /models
copy download.py .
RUN python download.py

# Copy Prisma schema file to the container
COPY schema.prisma .

# Copy the rest of the application
COPY . .

# Generate prisma client
RUN prisma generate

# Command to run the worker
CMD ["python", "worker.py"]