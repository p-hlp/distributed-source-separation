# Architecture and Data Flow

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
