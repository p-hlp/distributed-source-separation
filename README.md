# Distributed Source Separation & Sampling

This projects aims to provide a platform to manage music, stems and samples by providing the following features:

- Library management (upload/export)
- Source Separation / Stemming (Vocals/Melodic/Bass/Drums)
- Playback / Sample Slicing
- Automatic Sample Classification
- Audio to Midi
- Audio to Text (Vocals)

## Architecture / Technologies Used

- Frontend
  - Web-Client (React)
- Platform
  - Identity-Provider / Authentication (Auth0)
  - Updates Server => Client
    - Server-Sent Events (SSE) / WebSockets
- Backend
  - API Gateway: NodeJs + Express / Python + Django / NestJs
  - Message Broker: Redis
  - Services / Workers:
    - Separation-Service (Demucs)
    - Audio-To-Midi-Service (Basic-Pitch)
    - Transcription-Service (OpenAI Whsiper)
    - Sample-Split-Service (Librosa)
  - Object-Storage: Minio / S3
  - Database: Postgres + ORM (Prisma/Drizzle)
