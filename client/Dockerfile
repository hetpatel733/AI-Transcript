# ── Stage 1: build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY client/package*.json ./
RUN npm ci --silent

COPY client/ ./

# Allow passing a VITE_API_BASE_URL at build time
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: serve with nginx ───────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx content and copy new build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config for SPA fallback
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Optional: expose port 80 (mapped by compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
