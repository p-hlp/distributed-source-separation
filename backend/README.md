# Intelligent Sampling and Source Separation - Backend

NeuraLib's backend is designed to handle distributed sample management and processing efficiently, leveraging modern technologies and frameworks to ensure scalability and performance. More detailed informations for each component can be found in the related docs, just click the links.

### [API-Gateway](./api-gateway/README.md)

- Technology: Node.js with Express framework.
- Functionality: Serves as the primary entry point for web clients, facilitating interactions with the backend services.
- Features:
  - Hosts multiple endpoints for various service interactions.
  - Manages Server-Sent Events (SSE) connections for real-time communication.
  - Handles job initiation and management for tasks requested by web clients.

### Message Broker

- Technology: [Redis](https://redis.io/)
- Role: Acts as a central hub for message queuing, enabling communication between different backend services and workers.

### Task Queue

- Technology: [BullMQ](https://docs.bullmq.io/)
- Purpose: Manages and orchestrates the execution of background tasks, ensuring efficient processing and resource allocation. Uses redis for as a persistance layer for the queue.

### Workers

- [Separation Worker (Demucs)](./separation-worker/README.md): Processes audio separation tasks, extracting individual components like vocals and instruments from audio tracks.
- [Audio-To-Midi Worker (Basic-Pitch)](./audio-to-midi-worker/README.md): Converts audio files into MIDI format, allowing for their use in digital audio workstations.
- [Transcription Worker (OpenAI Whisper)](./transcription-worker/README.md): Transcribes audio content into text, utilizing OpenAI's Whisper model for accurate voice recognition.

### Data Persistence

- Object Storage: [Minio](https://min.io/) (drop-in replacement for Amazon S3), used for storing large audio files and other binary data.
- Database: [PostgreSQL](https://www.postgresql.org/), ensures reliable storage and management of application data. [Prisma](https://www.prisma.io/) ORM for easy interfacing with postgres.

## Getting started

For the api-gateway and the workers to be able to access/persist data we need to setup redis, minio and postgres. A docker compose setup is provided to easily do this.

1. Go to `backend/docker/local`
2. Copy `env.local.template` to `.env.local` and fill out the env vars with your secrets
3. If you are on unix systems, set permission for the `localUp.sh` shell script with `sudo chmod +x ./localUp.sh`
4. Run `./localUp.sh` to pull up the containers
