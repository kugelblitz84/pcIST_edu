# Frontend Integration Guide

REST and Socket.IO endpoints available today, with sample payloads for quick wiring.

## Base URLs
- REST: `http://<host>:<PORT>` (default 5000)
- Socket.IO: same host/port (namespace `/`)
- Screenshots: `http://<host>:<PORT>/screenshots/<examId>/<filename>` (served statically)

## Authentication
- JWT-based; send `Authorization: Bearer <token>` on protected REST calls
- Sockets are currently unauthenticated; add token verification if you need it

### Auth REST
- `POST /api/auth/registerStudent` – `{ name, email, password }`
- `POST /api/auth/registerTeacher` – admin only – `{ name, email, password }`
- `POST /api/auth/login` – `{ email, password }` → `{ token }`
- `POST /api/auth/setUserRole` – admin only – `{ userId, role }`

Example (login):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

## Users REST
- `GET /api/users/teacher/getUserData` – role teacher
- `GET /api/users/student/getUserData` – role student
- `GET /api/users/proctor/getUserData` – role proctor
- `GET /api/users/admin/getUserData` – role admin
- `GET /api/users/getStudentList` – roles admin|teacher
- `GET /api/users/getTeacherList` – role admin

Example:
```bash
curl -H "Authorization: Bearer <teacherToken>" \
  http://localhost:5000/api/users/getStudentList
```

## Exams REST
- `POST /api/exams/create` – teachers/admins – `{ title, description?, proctoredBy, startTime, endTime, questions? }`
- `GET /api/exams/getAll` – teachers/admins
- `GET /api/exams/proctored/:userId` – roles teacher|admin|proctor
- `GET /api/exams/student/:userId` – roles student|teacher|admin|proctor (controller enforces self-access for students/proctors)
- `POST /api/exams/startAttempt/:examId` – students start an attempt
- `GET /api/exams/questions/:examId` – students fetch questions
- `POST /api/exams/attempt/:attemptId/submit` – students submit answers `{ answers: [...] }`

Example (start attempt):
```bash
curl -X POST http://localhost:5000/api/exams/startAttempt/<examId> \
  -H "Authorization: Bearer <studentToken>"
```

Example (submit answers):
```bash
curl -X POST http://localhost:5000/api/exams/attempt/<attemptId>/submit \
  -H "Authorization: Bearer <studentToken>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question":"<questionId>","response":"B"}]}'
```

## Results REST
- `GET /api/results/student/:userId` – roles student|teacher|admin|proctor; returns attempts for the student

Example:
```bash
curl -H "Authorization: Bearer <adminToken>" \
  http://localhost:5000/api/results/student/<studentId>
```

## Proctoring REST
- `GET /api/proctoring/events` – roles teacher|admin – query: `attemptId?`, `eventType?`, `limit?`, `skip?`

Example:
```bash
curl -H "Authorization: Bearer <teacherToken>" \
  "http://localhost:5000/api/proctoring/events?attemptId=<attemptId>&limit=20"
```

## Socket.IO Events
- Server emits `request-screenshot { reason, requestedAt, examId?, attemptId? }` every 5 minutes and after tab/focus violations
- Client should emit: `user_online`, `tabSwitch`, `windowFocusChange`, `examStarted`, `examEnded`, `proctoringAlert`, `screenshot-upload { examId, studentId, attemptId|attempt, imageData, mimeType }`
- On `tabSwitch`/`windowFocusChange`, server logs a proctor event, marks attempt `terminated`, and re-requests a screenshot

## Frontend flow tips
- On login, store token and attach to all REST calls
- On exam start: POST startAttempt, receive/track attemptId, emit `examStarted`, listen for `request-screenshot`
- On focus/tab loss: emit `tabSwitch`/`windowFocusChange` with examId + attemptId; expect an immediate `request-screenshot`
- On `request-screenshot`: capture and emit `screenshot-upload`
- On submit: POST answers, emit `examEnded`

## Security and hardening
- Add socket auth (JWT in connection params) if you need secure realtime
- Restrict CORS origins for production
- Static screenshots are public; protect or sign URLs as needed

## Known gaps
- Question CRUD beyond the exam payload is minimal; extend if the frontend needs richer editing
- No automated tests; add before production
