# Backend

- API Gateway: NodeJs + Express
  - Acts as an entry-point for the web-clients
  - Multiple endpoints
  - Manages SSE connections
  - Manages jobs initiated by web-clients
- Message Broker: Redis
- Task Queue: BullMQ
- Services / Workers:
  - Separation-Worker(Demucs)
  - Audio-To-Midi-Worker (Basic-Pitch)
  - Transcription-Worker(OpenAI Whsiper)
- Object-Storage: Minio / S3
- Database: Postgre
