import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import proctorRoutes from './routes/proctorRoutes.js';
import examRoutes from './routes/examRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send("API running");
})

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/proctoring', proctorRoutes);

export default app;