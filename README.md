# Distributed Source Separation & Sampling

This projects aims to provide a platform to manage music, stems and samples by providing the following features:

- Source Separation / Stemming (Vocals/Melodic/Bass/Drums)
- Automatic Sample Slicing
- Automatic Sample Classification / Tagging
- Audio to Midi
- Export to separate VST3/CLAP plugin for easier sample browsing within your DAW

# Used Technologies

## Frontend

- React / Vite / Typescript
- ShadCN & Tailwind.css for styling

## Backend

### Authentication / Authorization

Auth0 is used with a OAuth2 PKCE Authorization Flow.

### API

- Node.js / Express API

### Audio Processing Service

- Python with Rust interop.
