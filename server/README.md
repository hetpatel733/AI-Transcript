# AI Meeting Notes & Action Tracker - Backend

Backend implementation for the AI Meeting Notes & Action Tracker.

Stack: Node.js, Express.js, MongoDB, Mongoose

Run locally:

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies: `npm install`
3. Start in dev: `npm run dev`

The backend exposes the API endpoints documented in `API_ENDPOINTS.md`.

Gemini AI integration
---------------------

To enable Google Gemini for analysis set the following in your `.env`:

- `AI_PROVIDER=gemini`
- `AI_API_KEY=` (your Gemini API key — keep this secret and do NOT commit it)
- `AI_MODEL=gemini-2.5-flash`

The analyze endpoint is `POST /api/meetings/:meetingId/analyze`. The server will
only make one Gemini request per analysis and protects free-tier quota via rate
limiting and by not re-running analysis for meetings already processed unless
you explicitly pass `?force=true`.

For local development use `AI_PROVIDER=mock` which returns deterministic test data and does not call Gemini.
