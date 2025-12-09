import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import { getAllEvents } from '../controllers/proctorControllers.js';

const router = express.Router();

// Only teachers and admins can read proctoring events
router.get('/events', authenticate({ role: ['teacher', 'admin'] }), getAllEvents);

export default router;
