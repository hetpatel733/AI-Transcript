# ── Stage 1: build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --silent

COPY client/ ./

# VITE_API_BASE_URL is intentionally empty so the browser hits /api on the
# same origin as the Express server (no separate port needed).
ENV VITE_API_BASE_URL=
RUN npm run build

# ── Stage 2: production Express backend ──────────────────────────────────────
FROM node:20-alpine AS backend

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev --silent

COPY server/ ./

# Copy the built React app into a folder Express will serve as static files
COPY --from=frontend-build /app/client/dist ./public

EXPOSE 3000

CMD ["node", "server.js"]
