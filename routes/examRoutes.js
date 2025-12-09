import express from 'express';

const router = express.Router();

// TODO: implement exam routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Exam routes not implemented yet.' });
});

export default router;
