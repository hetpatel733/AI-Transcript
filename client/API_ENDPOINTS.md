# API Endpoints

This file documents every endpoint expected by the frontend.

## POST /api/auth/register

Purpose

Register a new user.

Authentication Required

No

Request Body

```json
{
  "name": "Het Patel",
  "email": "het@example.com",
  "password": "password"
}
```

Success Response

```json
{
  "success": true,
  "message": "Registration successful",
  "user": { "id":"user-id","name":"Het Patel","email":"het@example.com" }
}
```

Error Response

```json
{ "success": false, "message": "Human readable error message" }
```

Frontend Function

`authApi.register()`

---

## POST /api/auth/login

Purpose: Authenticate user

Auth: No

Request Body

```json
{ "email": "het@example.com", "password": "password" }
```

Success Response

```json
{
  "success": true,
  "user": {"id":"user-id","name":"Het Patel","email":"het@example.com"}
}
```

Error Response

```json
{ "success": false, "message": "Invalid credentials" }
```

Frontend Function: `authApi.login()`

---

## POST /api/auth/logout

Purpose: Logout current user

Auth: Yes (cookie/session)

Request Body: none

Success Response

```json
{ "success": true }
```

Frontend Function: `authApi.logout()`

---

## GET /api/auth/me

Purpose: Return current authenticated user

Auth: Yes

Success Response

```json
{ "success": true, "user": {"id":"user-id","name":"Het Patel","email":"het@example.com"} }
```

Frontend Function: `authApi.me()`

---

## GET /api/meetings

Purpose: List meetings

Auth: Yes

Query parameters: optional filters

Success Response

```json
{ "success": true, "meetings": [] }
```

Frontend Function: `meetingApi.listMeetings()`

---

## GET /api/meetings/:meetingId

Purpose: Get meeting details

Auth: Yes

Path parameter: `meetingId`

Success Response

```json
{ "success": true, "meeting": { /* meeting object as documented in README */ } }
```

Frontend Function: `meetingApi.getMeeting(meetingId)`

---

## POST /api/meetings

Purpose: Create a meeting

Auth: Yes

Request Body

```json
{
  "title":"...",
  "date":"YYYY-MM-DD",
  "type":"Project Meeting",
  "participants":["Alice","Bob"],
  "transcript":"Full transcript..."
}
```

Success Response

```json
{ "success": true, "meeting": { /* created meeting */ } }
```

Frontend Function: `meetingApi.createMeeting(body)`

---

## PUT /api/meetings/:meetingId

Purpose: Update meeting

Auth: Yes

Request Body: same as create

Success Response

```json
{ "success": true, "meeting": { /* updated meeting */ } }
```

Frontend Function: `meetingApi.updateMeeting(meetingId, body)`

---

## DELETE /api/meetings/:meetingId

Purpose: Delete meeting

Auth: Yes

Success Response

```json
{ "success": true, "message": "Meeting deleted" }
```

Frontend Function: `meetingApi.deleteMeeting(meetingId)`

---

## POST /api/meetings/:meetingId/analyze

Purpose: Trigger AI analysis for stored transcript

Auth: Yes

Request Body: none (backend uses stored transcript)

Success Response

```json
{
  "success": true,
  "analysis": {
    "summary":"...",
    "discussionPoints":[],
    "decisions":[],
    "actionItems":[],
    "risks":[],
    "unansweredQuestions":[]
  }
}
```

Frontend Function: `meetingApi.analyzeMeeting(meetingId)`

---

## GET /api/actions

Purpose: List action items across meetings

Auth: Yes

Query params: `status`, `priority`, `owner`, `search`

Success Response

```json
{ "success": true, "actionItems": [] }
```

Frontend Function: `actionApi.listActions(params)`

---

## POST /api/actions

Purpose: Create new action

Auth: Yes

Request Body

```json
{
  "meetingId":"meeting-id",
  "task":"Prepare deployment documentation",
  "owner":"Alice",
  "dueDate":"2026-08-20",
  "priority":"High",
  "status":"Open"
}
```

Success Response

```json
{ "success": true, "action": { /* created action */ } }
```

Frontend Function: `actionApi.createAction(body)`

---

## PUT /api/actions/:actionId

Purpose: Update action

Auth: Yes

Request Body: fields to update

Success Response

```json
{ "success": true, "action": { /* updated action */ } }
```

Frontend Function: `actionApi.updateAction(actionId, body)`

---

## DELETE /api/actions/:actionId

Purpose: Delete action item

Auth: Yes

Success Response

```json
{ "success": true, "message": "Action item deleted" }
```

Frontend Function: `actionApi.deleteAction(actionId)`

---

## GET /api/dashboard

Purpose: Get dashboard stats and recent meetings

Auth: Yes

Success Response

```json
{
  "success": true,
  "stats": {
    "totalMeetings": 10,
    "totalActionItems": 25,
    "openActionItems": 10,
    "completedActionItems": 12,
    "overdueActionItems": 3
  },
  "recentMeetings": []
}
```

Frontend Function: `dashboardApi.getDashboard()`

---

All error responses are expected in the form:

```json
{ "success": false, "message": "Human readable message" }
```

If the API changes, update this document accordingly.
