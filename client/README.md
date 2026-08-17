# AI Meeting Notes & Action Tracker (Frontend)

Frontend-only implementation for the hackathon project.

Stack:
- React (JSX)
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)

Installation

```bash
npm install
npm run dev
```

Environment

Copy `.env.example` to `.env` and update `VITE_API_BASE_URL` if needed.

Available routes

- `/login`
- `/register`
- `/dashboard`
- `/meetings`
- `/meetings/new`
- `/meetings/:meetingId`
- `/meetings/:meetingId/edit`
- `/actions`

Notes

- This is frontend-only. API contracts are documented in `API_ENDPOINTS.md`.
- No TypeScript is used.
