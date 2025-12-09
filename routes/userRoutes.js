import express from 'express';
import { getUserData, getStudentList, getTeacherList } from '../controllers/userController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/teacher/getUserData', authenticate({ role: 'teacher' }), getUserData);
router.get('/student/getUserData', authenticate({ role: 'student' }), getUserData);
router.get('/proctor/getUserData', authenticate({ role: 'proctor' }), getUserData);
router.get('/admin/getUserData', authenticate({ role: 'admin' }), getUserData);
router.get('/getStudentList', authenticate({ role: ['admin', 'teacher'] }), getStudentList);
router.get('/getTeacherList', authenticate({ role: 'admin' }), getTeacherList);

export default router;