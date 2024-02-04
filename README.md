# Distributed Source Separation & Sampling

This projects aims to provide a platform to manage music, stems and samples by providing the following features:

- Library management (upload/export)
- Source Separation / Stemming into Vocals/Bass/Drums/Other (Meta/Defossez DemucsHT)
- Playback / Sample Slicing
- (Automatic Sample Classification)
- Audio to Midi (Spotify Basic-Pitch)
- Audio to Text for Vocal (OpenAI Whisper)

## Architecture / Technologies Used

![Architecture Overview](docs/assets/Architecture.svg)

- Web-Client (React/Typescript)
- Identity-Provider / Authentication (Auth0)
- Backend
  - Information Flow: Client -> HTTP -> Gateway -> MQ -> Worker -> MQ -> Gateway -> SSE -> Client
  - API Gateway: NodeJs + Express
  - Message Broker: Redis
  - Services / Workers:
    - Separation-Worker (Demucs)
    - Audio-To-Midi-Worker (Basic-Pitch)
    - Transcription-Worker (OpenAI Whsiper)
  - Object-Storage: Minio / S3
  - Database: Postgres (+Prisma ORM)
