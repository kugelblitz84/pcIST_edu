import { Router } from 'express';

const router = Router();

// Placeholder endpoints until result features are implemented.
router.use((_req, res) => {
    res.status(501).json({ message: 'Result routes are not implemented yet.' });
});

export default router;
