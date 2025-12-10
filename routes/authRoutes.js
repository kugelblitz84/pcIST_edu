import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import { registerTeacher, loginUser, registerStudent, setUserRole } from '../controllers/authController.js';

const router = express.Router();

router.post('/registerTeacher', authenticate({ role: 'admin' }), registerTeacher);
router.post('/registerStudent', registerStudent);
router.post('/login', loginUser);
router.post('/setUserRole', authenticate({ role: 'admin' }), setUserRole);

export default router;