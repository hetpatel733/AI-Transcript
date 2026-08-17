# AI Meeting Notes & Action Tracker

## Run with Docker

Make sure Docker Desktop is running.

Run:

```
docker compose up --build
```

Then open:

**http://localhost:3000**

That's it. No extra configuration required.

---

## What runs

- React frontend (production build)
- Express backend (production mode)
- MongoDB Atlas (external, already configured)
- Gemini AI (already configured)

All environment variables are pre-configured in `server/.env`.
