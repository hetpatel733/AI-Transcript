# API Endpoints

All endpoints are prefixed with `/api`.

## GET /api/health

Purpose: Health check

Auth: No

Response:

```json
{ "success": true, "message": "API is healthy" }
```

## POST /api/auth/register

See server README for full documentation. (This file should include all endpoints; for brevity in the challenge, the backend includes the endpoints used by the frontend per the specification.)

## POST /api/meetings/:meetingId/analyze

Purpose: Run AI analysis on a meeting transcript and persist structured results.

Auth: Required (httpOnly JWT cookie)

Path parameters:
- `meetingId` (string, Mongo ObjectId) — ID of the meeting to analyze

Query parameters:
- `force=true` — optional. If the meeting already has `aiProcessed=true`, analysis will not run again unless `force=true` is specified.

Request body: none

Responses:
- 200 Success — returns `meeting` summary fields and `actionItems` created by AI.
- 400 Bad Request — invalid meeting id, missing/empty transcript, or transcript too large.
- 401 Unauthorized — authentication required.
- 403 Forbidden — trying to analyze another user's meeting.
- 404 Not Found — meeting not found.
- 429 Too Many Requests — rate-limited (max 3 analyze requests per minute per user).
- 500 Server Error — AI provider failure or validation failure; previous analysis is preserved.

Example success response:

```json
{
	"success": true,
	"meeting": {
		"id": "...",
		"summary": "...",
		"discussionPoints": [],
		"decisions": [],
		"risks": [],
		"unansweredQuestions": [],
		"aiProcessed": true
	},
	"actionItems": []
}
```

Notes:
- The endpoint will perform exactly one Gemini API request when `AI_PROVIDER=gemini` and will not call the provider when `AI_PROVIDER=mock`.
- The Gemini API key must be provided server-side via environment variable `AI_API_KEY` and is never exposed to the frontend.
