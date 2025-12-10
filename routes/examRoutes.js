import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import {
  createExam,
  getExams,
  getExamProctoredByUserId,
  getAttemptedExambyUserId,
  startExamAttempt,
  getQuestionsForExam,
  submitAnswers,
} from '../controllers/examController.js';


const router = express.Router();

// Create a new exam (teachers/admins only)
router.post('/create', authenticate({ role: ['teacher', 'admin'] }), createExam);

// Get all exams (teachers/admins only)
router.get('/getAll', authenticate({ role: ['teacher', 'admin'] }), getExams);

// Get exams assigned to a specific proctor (proctors can only view their own)
router.get(
  '/proctored/:userId',
  authenticate({ role: ['teacher', 'admin', 'proctor'] }),
  getExamProctoredByUserId
);

// Get a student's attempted exams (students can only fetch their own)
router.get(
  '/student/:userId',
  authenticate({ role: ['student', 'teacher', 'admin', 'proctor'] }),
  getAttemptedExambyUserId
);

// Start an attempt for an exam (students only)
router.post('/startAttempt/:examId', authenticate({ role: 'student' }), startExamAttempt);

// Fetch questions for a specific exam (students only)
router.get('/questions/:examId', authenticate({ role: 'student' }), getQuestionsForExam);

// Submit answers for an attempt (students only)
router.post('/attempt/:attemptId/submit', authenticate({ role: 'student' }), submitAnswers);

// Student exam attempts (also visible to teachers/admins/proctors for oversight)
router.get(
	'/student/:userId',
	authenticate({ role: ['student', 'teacher', 'admin', 'proctor'] }),
	getAttemptedExambyUserId
);

export default router;
