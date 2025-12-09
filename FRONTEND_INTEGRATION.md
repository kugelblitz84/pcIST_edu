# Frontend Integration Guide

This backend exposes REST and Socket.IO interfaces for the proctored exam system. Use this guide to wire a frontend client (e.g., React/Vite) to the existing server.

## Base URLs
- REST base: `http://<host>:<PORT>` (default `PORT=5000`).
- Socket.IO: connect to the same host/port (namespace `/`).
- Static screenshots: `http://<host>:<PORT>/screenshots/<examId>/<filename>`.

## Authentication
- JWT-based. After login/registration, store the token client-side (memory/localStorage as you prefer) and send `Authorization: Bearer <token>` on protected REST calls and when opening the Socket.IO connection (if you choose to include token in connection params/query). Current code checks JWT only in REST middleware; sockets are unauthenticated—add server-side checks if desired.

### Auth REST endpoints
- `POST /api/auth/registerStudent` – body: `{ name, email, password }`.
- `POST /api/auth/registerTeacher` – admin-only (JWT) – body: `{ name, email, password }`.
- `POST /api/auth/login` – body: `{ email, password }` – returns `{ token }`.

### User REST endpoints
- `GET /api/users/teacher/getUserData` – role teacher (JWT required).
- `GET /api/users/student/getUserData` – role student (JWT required).
- `GET /api/users/proctor/getUserData` – role proctor (JWT required).
- `GET /api/users/admin/getUserData` – role admin (JWT required).
- `GET /api/users/getStudentList` – roles admin|teacher.
- `GET /api/users/getTeacherList` – role admin.

## Proctoring REST
- `GET /api/proctoring/events` (roles teacher|admin) – query: `attemptId`, `eventType`, `limit`, `skip`. Returns `{ events }` sorted newest-first.

## Exams / Attempts / Results (current state: placeholders)
- `GET /api/exams` – placeholder route returns stub message; real CRUD not implemented yet.
- `GET /api/results` – placeholder route returns stub message; scoring/results endpoints not implemented yet.
- Attempts routes are not yet created; plan to add:
  - `POST /api/attempts/exams/:examId/start`
  - `POST /api/attempts/exams/:examId/submit`
  - `GET /api/attempts/mine`, `GET /api/attempts`, `GET /api/attempts/:id`
  Implement these before wiring the frontend exam flow.

## Socket.IO Events
Client should connect and handle/emit the following:

Emitted by server
- `request-screenshot` – payload `{ reason, requestedAt, examId?, attemptId? }`. Respond with a screenshot upload.
- (Console logs exist for other events; no other server->client emits currently.)

Emit from client to server
- `user_online`: payload `userId` – marks user active.
- `tabSwitch`: payload should include `{ examId, attemptId (or attempt), studentId?, ... }`.
- `windowFocusChange`: payload similar to `tabSwitch`.
- `examStarted`: payload `{ examId, attemptId?, studentId?, ... }`.
- `examEnded`: payload `{ examId, attemptId?, studentId?, ... }`.
- `proctoringAlert`: payload `{ examId, attemptId?, studentId?, alertType, message? }`.
- `screenshot-upload`: payload `{ examId, studentId, attemptId (or attempt), imageData, mimeType }` where `imageData` is a data URL or base64 string. Server replies with `screenshot-uploaded` `{ status: 'ok' | 'error', message? }`.

### Behaviors on tab/window events
- When `tabSwitch` or `windowFocusChange` is received, server will:
  - Log a proctor event.
  - Mark the related attempt as `terminated: true` (Attempt model has this field).
  - Immediately emit `request-screenshot` back to that socket to capture evidence.

## Attempts model (for frontend awareness)
- `terminated` (boolean) indicates disqualification on proctoring violations.
- `status` can be `in-progress`, `submitted`, `auto-submitted`, `graded`.
- Answers are stored per question with `response`, `isCorrect`, `score`; aggregate `score` on attempt.

## Screenshot storage
- Screenshots are saved to `storage/screenshots/<examId>/<studentId>-<timestamp>.<ext>` (ext inferred from `mimeType`).
- Accessible via `/screenshots/...` static path. Protect or sign URLs if exposing publicly in production.

## Cron-based screenshot requests
- Server emits `request-screenshot` to all connected clients every 5 minutes.

## Expectations for frontend flows
- On exam start: emit `examStarted`, include `attemptId` once known; start listening for `request-screenshot`.
- On tab switch / focus loss: emit `tabSwitch` / `windowFocusChange` with `examId` and `attemptId`; expect immediate screenshot request.
- On receiving `request-screenshot`: capture the screen (subject to browser permissions) and emit `screenshot-upload` with required fields.
- On exam end/submit: emit `examEnded` and submit answers via REST (routes for attempts/exams/results are stubbed; implement as needed).

## Security notes
- Current sockets are unauthenticated. Consider adding token validation on connection and per-event if you need tighter control.
- Static screenshot serving is open; add auth middleware or signed URLs for protected access in production.
- CORS is `*`; narrow it for production.

## Setup reminders
- `.env`: set `MONGO_URI`, `JWT_SECRET`, `PORT` (optional), `JWT_EXPIRES_IN` (optional).
- Start server: `node server.js` (ensure `server.listen` is present – it is).
- Dependencies include `express`, `mongoose`, `socket.io`, `cron`, `dotenv`, `cors`, `bcryptjs`, `slugify`, `validator`.

## TODOs / Gaps
- Exam/attempt/result REST routes are placeholders; implement CRUD, submission, grading flows, and wire to frontend.
- Add role-protected retrieval of screenshots or signed URLs.
- Add socket authentication and better error handling/ack flows if needed.
- Add rate limits and input validation for uploads.
