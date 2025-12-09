# Project Documentation

## Overview
- Web-based proctored exam platform (soft proctoring: tab/focus/fullscreen detection, webcam snapshots, event logging).
- Stack: Node.js/Express backend with MongoDB (Mongoose ODM) and Socket.IO for real-time signals. Frontend is expected (not present in this repo) to consume REST and Socket.IO endpoints per README.
- Current codebase status: models are defined; server wiring is partially stubbed (routes not imported; HTTP listener not started; DB path reference needs adjustment). Use this doc to understand data contracts and integration points.

## Project Structure (backend)
- `app.js` – Express app setup, JSON/CORS, route mounts (placeholders: `authRoutes`, `examRoutes`, `resultRoutes`, `attemptRoutes`, `userRoutes`, `proctorRoutes`).
- `server.js` – HTTP + Socket.IO setup, dotenv load, DB connect; missing `server.listen` and correct DB import path.
- `confgis/db.js` – Mongo connection helper (uses `MONGO_URI` and appends `/pcistEdu`).
- `models/` – Mongoose models: `User`, `Exam`, `Question`, `Attempt`, `ProctorEvent`, `WebcamSnapshot`.
- `README.md` – High-level product spec and setup guidance.

## Environment
- Env var: `MONGO_URI` (base connection string; code appends `/pcistEdu`).
- Optional: `PORT` (server fallback 5000).
- Add typical vars for auth/security (e.g., `JWT_SECRET`, token TTL) when wiring controllers.

## Models (Mongoose)
### User (`models/User.js`)
- Fields: `name`, `email` (unique, lowercase), `password` (stored as provided; hash in controllers), `role` (`student|teacher|proctor|admin`).
- Indexes: unique `email`, index on `role`.

### Exam (`models/Exam.js`)
- Fields: `title`, `description`, `startTime`, `endTime`, `durationMinutes`, `createdBy` (ref User), `totalPoints`, `isPublished`.
- Indexes: compound `{ startTime, endTime }` for window queries; `createdBy`; `isPublished`.

### Question (`models/Question.js`)
- Fields: `exam` (ref Exam), `type` (`mcq|short|long`), `text`, `options` (array for MCQ), `correctAnswer` (mixed), `points`, `order`, `explanation`.
- Indexes: `{ exam, order }` for ordered fetch per exam.

### Attempt (`models/Attempt.js`)
- Fields: `exam` (ref Exam), `student` (ref User), `answers` (embedded: `question`, `response`, `isCorrect`, `score`), `score`, `status` (`in-progress|submitted|auto-submitted|graded`), `startedAt`, `submittedAt`, `durationSeconds`, `proctoringSummary` (`alerts`, `snapshots`).
- Indexes: unique `{ exam, student }` to enforce single attempt per student per exam; indexes on `exam`, `student`, `status`.

### ProctorEvent (`models/ProctorEvent.js`)
- Fields: `attempt` (ref Attempt), `eventType` (`tab-switch|window-blur|fullscreen-exit|webcam-capture|warning|info`), `message`, `metadata`, `createdAt` (default now).
- Index: `{ attempt, createdAt: -1 }` for recent-first timelines.

### WebcamSnapshot (`models/WebcamSnapshot.js`)
- Fields: `attempt` (ref Attempt), `imageData` (base64 string), `mimeType` (default `image/png`), `capturedAt`.
- Index: `{ attempt, capturedAt: -1 }` for recent-first galleries.

## Routes & APIs (intended from `app.js` and README)
- `GET /` – health check: "API running".
- Placeholder mounts (implement controllers/routes accordingly):
  - `/api/auth` – register/login/me, JWT issuance.
  - `/api/users` – user management (roles: admin/teacher/proctor).
  - `/api/exams` – CRUD exams, add questions.
  - `/api/attempts` – start/submit attempts; fetch my attempts; teacher/proctor views.
  - `/api/results` – scoring/grades (not yet implemented).
  - `/api/proctoring` – log events, fetch events/snapshots.

## Socket.IO Events (current logging only)
- Listeners set up in `server.js` (no persistence yet):
  - `tabSwitch`, `examStarted`, `examEnded`, `proctoringAlert`, `windowFocusChange` – currently log payloads; extend to emit/broadcast or persist.
- CORS: allows all origins/methods (tighten for production).

## Frontend Integration Notes
- REST base URL: `http://<backend-host>:<PORT>`; CORS enabled globally.
- Authentication: plan JWT in `Authorization: Bearer <token>`; ensure controllers issue and verify tokens; add role-based guards server-side.
- Exams flow: frontend creates exams (teacher/admin), adds questions, lists exams, starts attempt (`/attempts`), submits with answers array; backend should validate duration and window (`startTime`/`endTime`), auto-submit on timeout.
- Proctoring: frontend emits Socket.IO events for tab/focus/fullscreen changes; posts proctor events via REST; captures webcam snapshots (base64) to `/api/proctoring` (implement storage using `WebcamSnapshot`).
- Ordering: fetch questions using `{ exam, order }` index; frontend should sort by `order` if backend does not.

## Current Gaps / TODOs
- `server.js` lacks `server.listen(PORT, ...)`; add to start HTTP server.
- `connectDB` import path should be `./confgis/db.js` (or relocate to `/config/db.js`).
- Route modules (`authRoutes`, etc.) not defined/imported; implement controllers/services, then wire imports.
- Password hashing/verification not in models; perform hashing in auth controller (e.g., bcrypt) before save/update.
- Add validation/middleware (auth, roles, request schemas), logging, error handling, and tests.
- Consider moving `MONGO_URI` handling to include db name explicitly (avoid concatenation surprises).

## Setup (backend)
1) Install deps: `npm install` (ensure `mongoose`, `express`, `cors`, `dotenv`, `socket.io`, plus `bcryptjs` for auth controllers).
2) Env: create `.env` with `MONGO_URI`, `PORT`, `JWT_SECRET`, etc.
3) Start server (after adding `server.listen`): `node server.js` or with nodemon.
4) Verify `GET /` returns "API running" and Mongo connects.

## Data Handling Conventions
- IDs: Mongo ObjectIds; references align with model names above.
- Time: stored as ISO dates; frontend should send ISO strings or timestamps.
- Snapshots: `imageData` stored as base64 string; consider external storage for production and store URLs instead.
- Scoring: `Attempt.answers[].score`/`isCorrect` to be computed server-side; maintain `Attempt.score` aggregate.

## Security Notes
- Add rate limiting, CORS origin allowlist, helmet, and proper token handling before production.
- Enforce role checks on all protected routes.

## Testing
- No tests present. Add unit/integration tests for routes/controllers and model hooks; include e2e for exam flows and proctoring events.

## Change Log (current state)
- Added Mongoose models: User, Exam, Question, Attempt (with embedded answers), ProctorEvent, WebcamSnapshot.
- Removed model-level password hashing per request; controllers must handle hashing.
- Socket.IO event logging scaffold present.
