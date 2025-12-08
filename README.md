# Proctored Exam System

A complete web-based online proctored exam platform with soft proctoring features including tab detection, webcam monitoring, and real-time event logging.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Teacher, Proctor, Admin)
- Secure password hashing with bcrypt

### Exam Management (Teacher/Admin)
- Create exams with customizable duration and time windows
- Add multiple question types (MCQ, Short Answer, Long Answer)
- Manage exam questions with correct answers

### Exam Taking (Student)
- Real-time countdown timer with warnings
- Intuitive exam interface with question navigation
- Auto-submission when time expires
- Instant score calculation for MCQ questions

### Proctoring Features
- **Tab Detection**: Logs when student switches tabs or loses window focus
- **Webcam Monitoring**: Captures periodic snapshots (every 30 seconds)
- **Fullscreen Monitoring**: Detects fullscreen exits
- **Event Logging**: All proctoring events stored with timestamps

### Review Dashboard (Teacher/Proctor)
- View all exam attempts with filtering
- Event timeline with statistics
- Webcam snapshot gallery
- Detailed attempt analysis

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## 🛠️ Installation

### 1. Clone or Navigate to the Project

```bash
cd "e:\Proctored Exam"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your settings
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key (change from default!)
# - PORT: Backend port (default: 5000)
# - FRONTEND_URL: Frontend URL (default: http://localhost:5173)
```

**Example .env configuration:**

```env
MONGO_URI=mongodb://localhost:27017/proctored-exam
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start manually
mongod
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Create Initial Admin User

Before you can create exams, you need at least one admin user:

```bash
cd backend
npm run create-admin "Admin Name" admin@example.com password123
```

**Example:**

```bash
npm run create-admin "John Admin" john@admin.com admin123
```

## 👥 User Roles

### Student
- Self-register via the registration page
- Take exams during active time windows
- View their own exam attempts and scores

### Teacher
- Create and manage exams
- Add questions to exams
- View all exam attempts and proctoring data

### Proctor
- Review exam attempts
- View proctoring events and webcam snapshots
- Monitor student behavior during exams

### Admin
- Full access to all features
- Create teacher/proctor/admin accounts
- Manage all exams and users

## 📖 Usage Guide

### Creating an Exam (Teacher/Admin)

1. Login with a teacher or admin account
2. Click "Create New Exam" on the dashboard
3. Fill in exam details:
   - Title
   - Description (optional)
   - Start Time
   - End Time
   - Duration in minutes
4. Click "Create & Add Questions"
5. Add questions one by one:
   - Select question type (MCQ, Short, Long)
   - Enter question text
   - For MCQ: add options and select correct answer
6. Questions are saved immediately

### Taking an Exam (Student)

1. Login with a student account
2. See available exams on the dashboard
3. Click "Start Exam" on an active exam
4. Allow camera access when prompted
5. Test your camera (preview will appear)
6. Click "Start Exam Now"
7. Answer all questions
8. Click "Submit Exam" when done
9. View your score immediately

### Reviewing Attempts (Teacher/Proctor)

1. Login with a teacher/proctor/admin account
2. Navigate to "View Attempts" or "Review"
3. Filter by exam if needed
4. Click "View Details & Proctor Events" on any attempt
5. Review:
   - Student information
   - Exam score
   - Proctoring statistics
   - Event timeline
   - Webcam snapshots (click to enlarge)

## 🔐 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with configurable expiration
- Role-based authorization on all endpoints
- Protected routes on frontend
- CORS enabled for specific origin
- Camera permission required for exams
- Base64 image size limits (10MB)

## 🏗️ Project Structure

```
proctored-exam/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth & validation
│   │   ├── config/          # DB connection
│   │   └── utils/           # Helper scripts
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth context
│   │   ├── hooks/           # Custom hooks (webcam, proctor, timer)
│   │   ├── services/        # API service
│   │   ├── index.css        # Global styles
│   │   └── App.jsx          # Main app component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Exams
- `POST /api/exams` - Create exam (teacher/admin)
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/questions` - Add questions
- `GET /api/exams/:id/questions` - Get questions

### Attempts
- `POST /api/attempts/exams/:id/start` - Start exam (student)
- `POST /api/attempts/exams/:id/submit` - Submit exam (student)
- `GET /api/attempts/mine` - Get student's attempts
- `GET /api/attempts` - Get all attempts (teacher/proctor/admin)
- `GET /api/attempts/:id` - Get attempt details

### Proctoring
- `POST /api/proctor/events` - Log proctor event (student)
- `GET /api/proctor/attempts/:attemptId/events` - Get events (teacher/proctor/admin)

## 🎨 Frontend Features

### Design System
- Modern dark theme
- Vibrant gradient colors
- Glassmorphism effects
- Smooth animations and transitions
- Responsive design for mobile/tablet
- CSS custom properties for theming

### Proctoring Implementation
- **useProctor hook**: Monitors tab visibility, window focus, and fullscreen changes
- **useWebcam hook**: Captures periodic webcam snapshots (every 30 seconds)
- **useTimer hook**: Countdown timer with warning states

### User Experience
- Loading states with spinners
- Error handling with alerts
- Success notifications
- Accessible forms with validation
- Responsive navigation bar
- Protected routes with role checking

## 🚨 Important Notes

### Webcam Snapshots
- Snapshots are stored as base64-encoded data URLs in MongoDB
- For production, consider using cloud storage (AWS S3, Cloudinary) instead
- Current implementation may have scalability limitations with many snapshots

### Browser Compatibility
- Requires modern browser with webcam support
- Works best in Chrome, Firefox, Edge (latest versions)
- Camera permission must be granted

### Proctoring Limitations
- This is "soft proctoring" - monitors behavior but doesn't prevent cheating
- Tab switches are logged but not blocked
- No screen recording (only periodic snapshots)
- No AI-based face detection (MVP feature)

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB` (Windows) or `mongod`
- Check MONGO_URI in .env file
- Verify MongoDB is listening on the correct port

### Camera Not Working
- Check browser permissions (Camera should be allowed)
- Ensure HTTPS is used in production (required for camera access)
- Test camera in browser settings

### CORS Errors
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check that frontend is running on the configured port

### Port Already in Use
- Change PORT in backend .env file
- Or stop the process using the port

## 📦 Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use a strong JWT_SECRET
3. Use MongoDB Atlas or similar for database
4. Consider using cloud storage for images
5. Add rate limiting and additional security measures
6. Use PM2 or similar for process management

### Frontend
1. Build the production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update VITE_API_URL environment variable
4. Ensure CORS is configured correctly

## 🛣️ Future Enhancements

- Real-time monitoring with Socket.IO
- AI-based face detection and verification
- Screen recording instead of snapshots
- Multiple proctors per exam
- Detailed analytics and reports
- Email notifications
- Exam templates
- Question bank
- Automatic grading for text answers (AI)
- Mobile app for students

## 📄 License

MIT

## 👨‍💻 Developer Notes

This is an MVP (Minimum Viable Product) implementation. For production use, consider:
- Adding comprehensive tests (Jest, React Testing Library)
- Implementing proper error boundaries
- Adding logging (Winston, Morgan)
- Database indexing optimization
- Caching strategies (Redis)
- CDN for static assets
- Load balancing for scalability

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check console logs for detailed errors

---

**Built with**: Node.js, Express, MongoDB, React, Vite, JWT, bcrypt.js

**Enjoy building your proctored exam system! 🎓**
