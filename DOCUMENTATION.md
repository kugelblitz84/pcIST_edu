# Project Documentation

Updated for the current backend (Express + MongoDB + Socket.IO) with implemented routes and controllers.

## Quick Start
- Install deps: `npm install`
- Env: `.env` with `MONGO_URI`, `JWT_SECRET`, optional `PORT` (default 5000) and `JWT_EXPIRES_IN` (default 7d)
- Run: `node server.js` (already calls `server.listen`)
- Health: `GET /` → `API running`

## Project Structure (backend)
- `app.js` – Express setup, mounts `/api/auth`, `/api/exams`, `/api/results`, `/api/users`, `/api/proctoring`
- `server.js` – HTTP + Socket.IO, cron for periodic screenshot requests, static `/screenshots` serving, DB connect via `confgis/db.js`
- `confgis/db.js` – Mongo connection helper (uses `MONGO_URI` as-is)
- `controllers/` – auth, exam, proctoring, user logic
- `routes/` – Express routers wired to controllers
- `models/` – `User`, `Exam`, `Question`, `Attempt`, `ProctorEvent`, `WebcamSnapshot`

## Models (high level)
- `User`: `name`, `email`, `password` (hash in controllers), `role` in `student|teacher|proctor|admin`, `isActive`
- `Exam`: `title`, `description`, `proctoredBy` (User), `startTime`, `endTime`, `durationMinutes`, `createdBy`, optional `questions` array placeholder
- `Question`: belongs to `Exam`, supports `mcq|short|long`, `options`, `correctAnswer`, `points`, `order`
- `Attempt`: `exam`, `student`, `answers[]` (question/response/isCorrect/score), `status`, `startedAt`, `submittedAt`, `durationSeconds`, `proctoringSummary`, `terminated`
- `ProctorEvent`: `attempt`, `eventType`, `message`, `metadata`, timestamps
- `WebcamSnapshot`: `attempt`, `imageData` (base64), `mimeType`, `capturedAt`

## REST API
Base URL: `http://<host>:<port>` (default 5000). Send `Authorization: Bearer <JWT>` for protected routes.

### Auth (`/api/auth`)
- `POST /registerStudent` – `{ name, email, password }`
- `POST /registerTeacher` – admin only – `{ name, email, password }`
- `POST /login` – `{ email, password }` → `{ token }`
- `POST /setUserRole` – admin only – `{ userId, role }` (role in student|teacher|proctor|admin)

Example (set role):
```bash
curl -X POST http://localhost:5000/api/auth/setUserRole \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uid>","role":"proctor"}'
```

### Users (`/api/users`)
- `GET /teacher/getUserData` – role teacher
- `GET /student/getUserData` – role student
- `GET /proctor/getUserData` – role proctor
- `GET /admin/getUserData` – role admin
- `GET /getStudentList` – roles admin|teacher
- `GET /getTeacherList` – role admin

Example (student profile):
```bash
curl -H "Authorization: Bearer <studentToken>" \
  http://localhost:5000/api/users/student/getUserData
```

### Exams (`/api/exams`)
- `POST /create` – teachers/admins – body: `{ title, description?, proctoredBy, startTime, endTime, questions? }`
- `GET /getAll` – teachers/admins – list exams
- `GET /proctored/:userId` – roles teacher|admin|proctor – exams proctored by user
- `GET /student/:userId` – roles student|teacher|admin|proctor – attempts for a student (permissions enforced in controller)
- `POST /startAttempt/:examId` – students – start attempt
- `GET /questions/:examId` – students – fetch questions for exam
- `POST /attempt/:attemptId/submit` – students – submit answers `{ answers: [...] }`

Example (create exam with question payload):
```bash
curl -X POST http://localhost:5000/api/exams/create \
  -H "Authorization: Bearer <teacherToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Midterm",
    "description":"Chapters 1-3",
    "proctoredBy":"<proctorUserId>",
    "startTime":"2025-01-10T09:00:00Z",
    "endTime":"2025-01-10T11:00:00Z",
    "questions":[
      {
        "type":"mcq",
        "text":"What is 2 + 2?",
        "options":["1","2","3","4"],
        "correctAnswer":"4",
        "points":2,
        "order":1
      },
      {
        "type":"short",
        "text":"Name the sorting algorithm with average O(n log n) complexity used by V8.",
        "correctAnswer":"Timsort",
        "points":3,
        "order":2
      }
    ]
  }'
```

Controller behavior notes (accuracy):
- `createExam` validates role (teacher/admin), title, startTime/endTime, proctoredBy; computes durationMinutes; saves `Exam` with provided fields. The `Exam` schema currently does **not** define a `questions` array, so any `questions` sent are ignored by Mongoose unless the schema is extended. Create question documents separately against `Question` if you need persistence.
- `startExamAttempt` (student only) prevents duplicate attempts per exam/student and creates an `Attempt` with status default `in-progress` and `startTime` now.
- `getQuestionsForExam` fetches questions from `Question` collection by `exam` id; it does not time-gate delivery yet (stub for start/end window check).
- `submitAnswers` (student only) forbids submits after exam end time, requires ownership of the attempt, sets `answers`, marks status `submitted`, and stamps `submittedAt`.

Example (submit answers):
```bash
curl -X POST http://localhost:5000/api/exams/attempt/<attemptId>/submit \
  -H "Authorization: Bearer <studentToken>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question":"<questionId>","response":"B"}]}'
```

### Results (`/api/results`)
- `GET /student/:userId` – roles student|teacher|admin|proctor – delegates to exam attempts lookup

Example:
```bash
curl -H "Authorization: Bearer <teacherToken>" \
  http://localhost:5000/api/results/student/<studentId>
```

### Proctoring (`/api/proctoring`)
- `GET /events` – roles teacher|admin – query: `attemptId?`, `eventType?`, `limit?`, `skip?`

Example:
```bash
curl -H "Authorization: Bearer <adminToken>" \
  "http://localhost:5000/api/proctoring/events?attemptId=<attemptId>&limit=20"
```

## Socket.IO (server.js)
- Emits `request-screenshot { reason, requestedAt, examId?, attemptId? }` every 5 minutes and when tab/focus events occur.
- Client emits supported: `user_online`, `tabSwitch`, `windowFocusChange`, `examStarted`, `examEnded`, `proctoringAlert`, `screenshot-upload` ({ examId, studentId, attemptId|attempt, imageData, mimeType }).
- Server stores proctor events and screenshots to `storage/screenshots/<examId>/...` and marks attempts `terminated` on tab/focus violations.

## Data Conventions
- Time: ISO strings; server converts to Date
- IDs: Mongo ObjectIds
- Auth: JWT Bearer header checked by `authenticate` middleware with role guards

## Notes / Gaps
- Questions array in `Exam` is currently stored as provided; detailed question CRUD not yet wired beyond `getQuestionsForExam` lookup.
- Add validation, rate limiting, stricter CORS, and socket auth for production.
- No automated tests present; add coverage for auth, exams, attempts, and proctoring flows.
