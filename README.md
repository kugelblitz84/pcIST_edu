# Proctored Exam Backend

Express + MongoDB + Socket.IO backend for a proctored exam platform (soft proctoring: tab/focus tracking, screenshot requests, event logging).

## Setup
- Install deps: `npm install`
- `.env` required: `MONGO_URI`, `JWT_SECRET`; optional `PORT` (default 5000), `JWT_EXPIRES_IN` (default 7d)
- Run: `node server.js`
- Health: `GET /` → `API running`

## Auth & Roles
- Roles: student, teacher, proctor, admin
- Key endpoints (send `Authorization: Bearer <token>` when protected):
   - `POST /api/auth/registerStudent` – `{ name, email, password }`
   - `POST /api/auth/registerTeacher` – admin only – `{ name, email, password }`
   - `POST /api/auth/login` – `{ email, password }` → `{ token }`
   - `POST /api/auth/setUserRole` – admin only – `{ userId, role }`

## Users
- `GET /api/users/teacher/getUserData` – teacher
- `GET /api/users/student/getUserData` – student
- `GET /api/users/proctor/getUserData` – proctor
- `GET /api/users/admin/getUserData` – admin
- `GET /api/users/getStudentList` – admin|teacher
- `GET /api/users/getTeacherList` – admin

## Exams and Attempts
- `POST /api/exams/create` – teacher|admin – `{ title, description?, proctoredBy, startTime, endTime, questions? }`
- `GET /api/exams/getAll` – teacher|admin
- `GET /api/exams/proctored/:userId` – teacher|admin|proctor
- `GET /api/exams/student/:userId` – student|teacher|admin|proctor (self-checks for student/proctor enforced)
- `POST /api/exams/startAttempt/:examId` – student
- `GET /api/exams/questions/:examId` – student
- `POST /api/exams/attempt/:attemptId/submit` – student – `{ answers: [...] }`

## Results
- `GET /api/results/student/:userId` – student|teacher|admin|proctor – returns attempts for the student

## Proctoring
- `GET /api/proctoring/events` – teacher|admin – query: `attemptId?`, `eventType?`, `limit?`, `skip?`
- Socket events: `user_online`, `tabSwitch`, `windowFocusChange`, `examStarted`, `examEnded`, `proctoringAlert`, `screenshot-upload`; server emits `request-screenshot` and marks attempts `terminated` on tab/focus violations

## Examples
Create exam (teacher/admin):
```bash
curl -X POST http://localhost:5000/api/exams/create \
   -H "Authorization: Bearer <teacherToken>" \
   -H "Content-Type: application/json" \
   -d '{"title":"Midterm","proctoredBy":"<proctorId>","startTime":"2025-01-10T09:00:00Z","endTime":"2025-01-10T11:00:00Z"}'
```

Start attempt (student):
```bash
curl -X POST http://localhost:5000/api/exams/startAttempt/<examId> \
   -H "Authorization: Bearer <studentToken>"
```

Fetch proctor events (teacher/admin):
```bash
curl -H "Authorization: Bearer <adminToken>" \
   "http://localhost:5000/api/proctoring/events?attemptId=<attemptId>&limit=20"
```

## Notes
- Screenshots served statically from `/screenshots/<examId>/...`; secure in production.
- CORS is permissive; tighten for production.
- No automated tests yet; add coverage before deployment.
