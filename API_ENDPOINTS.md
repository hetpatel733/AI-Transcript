# API Endpoints

## POST /api/meetings/:meetingId/analyze

- Authentication: Required (cookie / JWT as existing app uses)
- Path params:
  - `meetingId` (string): MongoDB ObjectId of the meeting
- Query params:
  - `force=true` to force re-analysis even if `meeting.aiProcessed` is true
- Body: none
- Response (200):
  ```json
  {
    "analysis": {
      "id": "<meetingId>",
      "summary": "...",
      "discussionPoints": ["..."],
      "decisions": ["..."],
      "risks": ["..."],
      "unansweredQuestions": ["..."],
      "aiProcessed": true,
      "aiProcessedAt": "2026-08-17T..."
    },
    "actionItems": [ /* list of action items created by AI */ ]
  }
  ```

- Errors: Returns safe errors without exposing API keys.

### Notes about Gemini / GenAI migration
- The backend now uses `@google/genai` SDK and the Interactions-like `chats.create` path to call Gemini models when `AI_PROVIDER=gemini` and `AI_API_KEY` (or `GEMINI_API_KEY`) is set.
- The SDK model used is taken from `AI_MODEL` in environment.
- In development, set `AI_PROVIDER=mock` to avoid calling Gemini and preserve free quota.
