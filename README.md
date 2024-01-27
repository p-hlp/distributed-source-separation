# Distributed Source Separation & Sampling

This projects aims to provide a platform to manage music, stems and samples by providing the following features:

- Library management (upload/export)
- Source Separation / Stemming into Vocals/Bass/Drums/Other (Meta/Defossez DemucsHT)
- Playback / Sample Slicing
- (Automatic Sample Classification)
- Audio to Midi (Spotify Basic-Pitch)
- Audio to Text for Vocal (OpenAI Whisper)

## Architecture / Technologies Used

- Frontend
  - Web-Client (React)
- Platform
  - Identity-Provider / Authentication (Auth0)
  - Updates Server => Client
    - Server-Sent Events (SSE) / WebSockets
- Backend
  - Information Flow: Client -> HTTP -> Gateway -> MQ -> Worker -> MQ -> Gateway -> SSE -> Client
  - API Gateway: NodeJs + Express / Python + Django / NestJs
  - Message Broker: Redis
  - Services / Workers:
    - Separation-Service (Demucs)
    - Audio-To-Midi-Service (Basic-Pitch)
    - Transcription-Service (OpenAI Whsiper)
    - Sample-Split-Service (Librosa)
  - Object-Storage: Minio / S3
  - Database: Postgres + ORM (Prisma/Drizzle)
