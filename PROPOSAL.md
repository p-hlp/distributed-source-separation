# Proposal - Distributed Platform for Intelligent Music Library Management and Audio Processing

## Motivation

- Intelligent music / sample management for music producers & audio engineers
- Interesting architectural challenges of building a distributed system for audio processing
- Using asynchronous task processing in a scalable way (e.g. task queues)
- Deploying trained neural networks and making use of parallel processing with GPUs
- (Building / training) Neural Networks for Audio (Classification task)
- From a non-technical standpoint, sampling has been at the core of genre innovation
  - Having access to individual musical parts aids in the creative process of re-envisioning an original piece of music
  - Not only in terms of remixing/bootlegging, but also when mixing entire genres it expands the creative possibilities

## Features and Project-Scope

### Music / Sample Collection

- Users can upload music
- Users can manage uploaded library
- Users can manage extracted stems and samples
- Users can export collection for local usage, e.g. DAW
- Users are able to play back music, extracted stems and samples

### Source Separation / Stemming

- Users can separate uploaded music into individual stems
- Using [Demucs v4](https://github.com/adefossez/demucs) (Facebook/Meta Research - Defossez)

### Sample Slicing / Classification

- Users can slice extracted stems further into individual samples (drum hits, vocal chops, synth hits etc.)
- Sliced samples are classified/tagged automatically
- What network/pre-trained model will be used is still tbd, either build/train own, or use transfer-learning with existing models

### Audio to Midi (Vocals/Bass/Melodic)

- Users can convert extracted stems to midi
- Using [Basic Pitch](https://github.com/spotify/basic-pitch) (Spotify)

### Audio to Text (Vocals)

- Users can extract lyrics / text from vocals
- Using [OpenAI Whisper](https://github.com/openai/whisper) or one of the several other open-source models

## Implementation Strategy

- Perform further experiments (in browser inference vs. separate service)
- Decide which tasks need longer processing / more GPU utalization
  - Tasks that take longer will be run asynchronous in a service
  - Tasks that don't need a lot of resources can be run in browser
- Collect architectural requirements and decide on a system architecture
- (Probably Microservice-based backend, where each task)

## Prelimnary Architecture

### Architecture requirements

- Must be containerized, easy start-up with docker compose for example
- Must be able to process multiple incoming tasks
- Must be able to take advantage of parallel processing (GPU)

### Proposed Architecture

- Web-based Frontend
- Service-based backend architecture
  - API gateway
  - Processing Services for handling audio processing
    - Separation Service
    - Classification / Tagging Service
    - Slice Prediction Service
    - Audio to Midi Service
    - Audio to Text Service
  - Services should be containerized and have access to GPU for accelerated processing
  - Some form of a task queue for the services (Kafka / Celery)
    - Async processing of incoming tasks
- Authentication/Authorization
  - Any managed service (Auth0/Supabase/Firebase)

## Future Work / Outlook

- Extend platform capabilities (e.g. more MIR tasks or vst/clap front-end)
- Exploring scalability
- Ground-work for masters thesis - e.g.:
  - optimizing distributed systems for audio processing
  - novel deep learning models for various audio use-cases
  - etc.
