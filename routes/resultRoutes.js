import express from 'express';

const router = express.Router();

// TODO: implement result routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Result routes not implemented yet.' });
});

export default router;
