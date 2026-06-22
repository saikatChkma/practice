# Rural Healthcare Triage Assistant Backend

Express backend scaffold for the AI-powered rural healthcare triage workflow.

## Run

1. Copy `.env.example` to `.env` and fill in API credentials.
2. Install dependencies with `npm install`.
3. Start the API with `npm start`.

## Endpoints

- `GET /api/health`
- `POST /api/transcribe` with `audio`
- `POST /api/translate`
- `POST /api/ocr` with `image`
- `POST /api/analyze`
- `POST /api/vitals`
- `POST /api/tts`
- `POST /api/report`