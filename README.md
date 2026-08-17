# AI Meeting Notes & Action Tracker

## Quick Docker Run (recommended)

Make sure Docker (or Docker Desktop) is installed and running on your machine.

If you have a `docker-compose.yml` in the repo root, start the whole stack with:

```bash
docker compose up --build
```

If you want to run the application using individual Docker images (no compose), you can build and run the server image like this:

```bash
# Build the server image (run from repo root)
docker build -f server/Dockerfile -t ai-transcript-server ./server

# Run the server container (example - map port 5000 and supply env file)
docker run --env-file server/.env -p 5000:5000 --name ai-transcript-server ai-transcript-server

# For the client, build and serve a production build (if you have a client Dockerfile)
docker build -f client/Dockerfile -t ai-transcript-client ./client
docker run -p 3000:3000 --name ai-transcript-client ai-transcript-client
```

Notes:
- The project is written as two separate services: `client/` (React + Tailwind) and `server/` (Express + Mongoose). A Compose file typically builds both and wires environment variables.
- By default the frontend is exposed at http://localhost:3000 and the backend at http://localhost:5000 (or the port set in `server/.env`).

### Using the included docker-compose.yml

This repository already includes a `docker-compose.yml` at the project root that builds a unified image (frontend + backend) and exposes it as a single `app` service on port `3000`.

Quick commands (run from repository root):

```bash
# Build and start in foreground (rebuild images)
docker compose up --build

# Build and start detached
docker compose up -d --build

# Follow service logs
docker compose logs -f app

# Stop and remove containers (preserve images)
docker compose down

# Exec into running container (shell)
docker compose exec app sh
```

What the included compose file does:
- Builds the image from the repository `Dockerfile` (multi-stage: builds React with Vite, copies production `dist` into Express `public`).
- Exposes the app on host port `3000` (container port `3000`).
- Loads environment variables from `./server/.env` and additionally sets `PORT=3000`, `NODE_ENV=production`, and `CLIENT_URL=http://localhost:3000` in the container runtime.
- Performs a basic healthcheck against `http://localhost:3000/api/health` inside the container.

Important notes before running `docker compose up`:
- Ensure `server/.env` exists and contains at minimum `MONGODB_URI` and `JWT_SECRET`. The compose file uses `server/.env` as the env_file source; missing required variables will prevent the server from starting correctly.
- The container runs both frontend (served as static files) and backend on the same port. The backend honors the `PORT` env var; the compose file forces this to `3000` so the frontend and backend share the same origin.
- The app's healthcheck is configured to hit `/api/health`. If you customize the server port or health endpoint, update `docker-compose.yml` accordingly.

If you prefer separate containers for client and server (for example to run the client in dev mode with Vite), I can add a `docker-compose.dev.yml` that mounts volumes and starts the client and server independently.

---

## Overview

AI Meeting Notes & Action Tracker is a small SaaS-style application to:
- Create and manage meeting records and transcripts
- Run AI analysis over transcripts to extract action items, meeting metadata, and summaries
- Track action items (create, inline-edit, mark Done)
- Authenticate users and persist data in MongoDB

Key features:
- Persistent light/dark theme with an animated sun/moon toggle
- Top header navigation with active-tab highlighting and page transitions
- In-app toasts and modal confirmations via a `UiContext` (replaces native alert/confirm)
- Promise-based AI analysis integration with fallback/mock provider
- ErrorBoundary to catch runtime errors and show a friendly UI

---

## Architecture & Important Files

- Frontend (React + Tailwind): [client](client)
	- App entry: [client/src/main.jsx](client/src/main.jsx)
	- Global styles and theme variables: [client/src/index.css](client/src/index.css)
	- Layout and nav: [client/src/components/layout/SidebarLayout.jsx](client/src/components/layout/SidebarLayout.jsx)
	- UI primitives: [client/src/components/ui/Button.jsx](client/src/components/ui/Button.jsx), [client/src/components/ui/ThemeToggle.jsx](client/src/components/ui/ThemeToggle.jsx), [client/src/components/ui/ErrorBoundary.jsx](client/src/components/ui/ErrorBoundary.jsx)
	- Contexts: [client/src/context/ThemeContext.jsx](client/src/context/ThemeContext.jsx), [client/src/context/AuthContext.jsx](client/src/context/AuthContext.jsx), [client/src/context/UiContext.jsx](client/src/context/UiContext.jsx)

- Backend (Express + Mongoose): [server](server)
	- Server entry: [server/server.js](server/server.js)
	- App setup: [server/app.js](server/app.js)
	- DB connection: [server/config/db.js](server/config/db.js)
	- Models: [server/models/User.js](server/models/User.js), [server/models/Meeting.js](server/models/Meeting.js), [server/models/ActionItem.js](server/models/ActionItem.js)
	- Controllers: [server/controllers/meetingController.js](server/controllers/meetingController.js), [server/controllers/aiController.js](server/controllers/aiController.js)
	- Services: [server/services/aiService.js](server/services/aiService.js) (wraps AI provider + mock fallback)
	- Utilities: [server/utils/generateToken.js](server/utils/generateToken.js), [server/utils/apiResponse.js](server/utils/apiResponse.js)

---

## Development (run locally)

Prerequisites:
- Node.js (16+ recommended) and npm or pnpm
- Optional: MongoDB (local) or a MongoDB Atlas connection string

Install dependencies:

```bash
# From repository root
cd client && npm install
cd ../server && npm install
```

Run server (development):

```bash
# from /server
npm run dev
# server uses PORT (default 5000) and environment variables in server/.env
```

Run client (development):

```bash
# from /client
npm run dev
# open http://localhost:3000 (or the port printed by Vite)
```

API base URL: The client expects the backend base URL to be configured (see `client/src/services/api.js`) or proxied by Vite in development.

---

## Environment Variables

The server expects these environment variables (set `server/.env` or pass via Docker `--env-file`):

- `MONGODB_URI` — MongoDB connection string (required)
- `PORT` — port server listens on (default `5000`)
- `JWT_SECRET` — secret used to sign JWT tokens (required)
- `JWT_EXPIRES_IN` — token expiry (e.g. `1d`) (optional)
- `CLIENT_URL` — allowed CORS origin for the frontend (default `http://localhost:5173`)
- `AI_API_KEY` — API key for the AI provider (if using a cloud provider)
- `AI_MODEL` — model id to use (provider-specific)
- `AI_PROVIDER` — `mock` or `openai`/`gemini` etc. (defaults to `mock`)
- `AI_FALLBACK_TO_MOCK` — when `true`, uses local mock analyzer on failures (default `true`)
- `MAX_TRANSCRIPT_LENGTH` — limit on transcript length parsed by the AI (optional)
- `AI_RATE_LIMIT_DISABLED` — set to `true` during development to disable analyze rate limiting
- `ANALYZE_RATE_LIMIT_WINDOW_MS` — rate limit window (ms)
- `ANALYZE_RATE_LIMIT_MAX` — max requests per window for analyze endpoint

Make sure at minimum `MONGODB_URI` and `JWT_SECRET` are set before starting the server.

---

## How the Application Works (Detailed)

1) Authentication
- Users register/login via endpoints in [server/routes/authRoutes.js](server/routes/authRoutes.js). Authentication issues a JWT stored as an `HttpOnly` cookie by default.
- `AuthContext` on the client reads the current user and provides `login`, `register`, and `logout` helpers.

2) Meetings and Transcripts
- Meetings are stored in MongoDB (`Meeting` model). A meeting has fields like `title`, `date`, `participants`, `transcript`, and `analysis`.
- The Meetings list page loads meetings for the authenticated user and supports search and filters.
- Meeting creation accepts a title-only submission; once created, the AI analysis endpoint can be invoked to enrich metadata (type, participants, summary) based on the transcript or placeholder content.

3) AI Analysis
- The AI analysis flow is implemented in [server/services/aiService.js](server/services/aiService.js) and invoked from [server/controllers/aiController.js](server/controllers/aiController.js).
- The service supports multiple providers; environment variables determine which provider is used. If configured as `mock`, a deterministic mock analyzer returns structured JSON.
- Analyze operations are rate-limited and can fall back to the mock provider when the remote API fails (configurable via env flags).

4) Action Items
- AI analysis may return action items; `analyzeAndPersist` (meetingAnalysisService) normalizes and saves action items (see [server/services/meetingAnalysisService.js](server/services/meetingAnalysisService.js)).
- Actions are displayed in the Actions page. Inline-edit allows changing the text or owner and marking items as Done. Deleting or marking Done uses modal confirmations via `UiContext.confirm`.

5) UI & Theming
- The frontend uses a CSS variables approach (in [client/src/index.css](client/src/index.css)) to define a restrained SaaS palette: neutrals, one primary color, green success, amber warning, red danger.
- `ThemeContext` persists the user's choice to `localStorage` and sets a `data-theme` attribute on the document element to allow theme-specific CSS.
- `ThemeToggle` is an animated sun/moon control where the sun is on the left (light) and moon on the right (dark). The toggle is accessible (keyboard focusable) and uses `currentColor` on SVGs for automatic contrast.

6) Global UI helpers
- `UiContext` exposes `toast({ type, message })` and `confirm(options)`. `confirm` returns a Promise so callers can `await ui.confirm(...)` instead of using `window.confirm`.
- When a modal confirm is shown, the header blurs and the page beneath is inert to avoid interaction confusion.

7) Error handling
- An `ErrorBoundary` component catches render-time exceptions and shows a user-friendly message with an option to reload or view details (in dev). API errors are returned as structured JSON by `apiResponse` utilities.

---

## API Endpoints (high level)

See the route files under [server/routes](server/routes):

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive cookie
- `POST /api/auth/logout` — clear cookie
- `GET /api/meetings` — list meetings (auth required)
- `POST /api/meetings` — create meeting
- `GET /api/meetings/:id` — get meeting details
- `PUT /api/meetings/:id` — update meeting
- `DELETE /api/meetings/:id` — delete meeting
- `POST /api/meetings/:id/analyze` — trigger AI analysis for a meeting (rate-limited)
- `GET /api/actions` — list action items
- `PUT /api/actions/:id` — update action item (inline edit / mark done)
- `DELETE /api/actions/:id` — delete action item

Refer to the server route files for exact request/response shapes: [server/routes](server/routes)

---

## Testing

- There are dev scripts in `server/scripts/` that help validate AI integration and analysis flows. Some scripts print debug output; we've recently trimmed non-error console logs to keep test runs clean.
- You can run the test scripts directly with Node, for example:

```bash
node server/scripts/testGemini.js
```

---

## Deployment notes

- The app can be containerized and deployed to any container platform (AWS ECS, GCP Cloud Run with a sidecar, or Kubernetes). Ensure environment variables are set in the deployment environment (especially `MONGODB_URI` and `JWT_SECRET`).
- For production, use a managed MongoDB (Atlas) or a secure, backed-up Mongo service. If using a local Mongo container, expose it only on an internal network.

---

## Troubleshooting

- If you see authentication issues, verify `JWT_SECRET` is the same for server instances and not changed between restarts.
- If AI analysis fails, check `AI_API_KEY` and provider settings. The service will fallback to the mock provider if enabled.
- If the frontend can't reach the backend in development, check `CLIENT_URL` and CORS configuration in [server/app.js](server/app.js).

---

## Contributing

- Fork the repo, create a feature branch, and open a PR with tests and a short description of changes.
- We prefer small, focused changes. Use the existing `Button` and `Input` components to maintain visual consistency.

---

## Where to look next

- To modify the AI logic: [server/services/aiService.js](server/services/aiService.js)
- To change the UI theme: [client/src/index.css](client/src/index.css) and [client/src/context/ThemeContext.jsx](client/src/context/ThemeContext.jsx)
- To change routing and layout: [client/src/components/layout/SidebarLayout.jsx](client/src/components/layout/SidebarLayout.jsx)

If you'd like, I can also:
- Add a `docker-compose.yml` example into the repo
- Add a small `Makefile` with `make dev`, `make build`, `make up` targets
- Generate a concise `server/.env.example` file listing required env vars

---

Thanks — if you want a shorter printed reference or a `docker-compose.yml` + `Makefile` added to the repo, tell me which option you prefer and I'll add them.
