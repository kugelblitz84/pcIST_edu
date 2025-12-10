import express from 'express';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { CronJob } from 'cron';
import path from 'path';
import { promises as fs } from 'fs';
import connectDB from './confgis/db.js';
import User from './models/User.js';
import ProctorEvent from './models/ProctorEvent.js';
import Attempt from './models/Attempt.js';

dotenv.config();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    },
});

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'screenshots');

// Serve screenshots as static assets
app.use('/screenshots', express.static(STORAGE_ROOT));

const ensureDir = async (dirPath) => {
    await fs.mkdir(dirPath, { recursive: true });
};

const inferExt = (mimeType) => {
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return '.jpg';
    if (mimeType === 'image/png') return '.png';
    if (mimeType === 'image/webp') return '.webp';
    return '.png';
};

const storeScreenshot = async ({ examId, studentId, imageData, mimeType }) => {
    if (!examId || !studentId || !imageData) return;
    const ext = inferExt(mimeType);
    const examDir = path.join(STORAGE_ROOT, String(examId));
    await ensureDir(examDir);

    const sanitizedBase64 = imageData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(sanitizedBase64, 'base64');
    const filename = `${studentId}-${Date.now()}${ext}`;
    const filePath = path.join(examDir, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
};

const terminateAttempt = async (attemptRef) => {
    if (!attemptRef) return;
    try {
        await Attempt.updateOne({ _id: attemptRef }, { terminated: true });
    } catch (err) {
        console.error('Error marking attempt terminated:', err.message);
    }
};

const requestScreenshotForSocket = (socket, reason, extra = {}) => {
    socket.emit('request-screenshot', { reason, requestedAt: Date.now(), ...extra });
};

const persistProctorEvent = async (eventType, payload = {}) => {
    try {
        const { attemptId, attempt, message, ...metadata } = payload || {};
        const attemptRef = attemptId || attempt;
        if (!attemptRef) return; // cannot store without attempt reference
        await ProctorEvent.create({
            attempt: attemptRef,
            eventType,
            message,
            metadata,
        });
    } catch (err) {
        console.error(`Error storing proctor event (${eventType}):`, err.message);
    }
};

io.on('connection', (socket) => {
    //set user active status to true

    console.log('New client connected:', socket.id);
    socket.on('user_online', async (userId) => {
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, { isActive: true });
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socket.userId) {
            User.findByIdAndUpdate(socket.userId, { isActive: false }).catch((err) => {
                console.error('Error updating user status on disconnect:', err);
            });
        }
    })
    socket.on('tabSwitch', (data) => {
        persistProctorEvent('tab-switch', data);
        terminateAttempt(data?.attemptId || data?.attempt);
        requestScreenshotForSocket(socket, 'tab-switch', { examId: data?.examId, attemptId: data?.attemptId || data?.attempt });
    });
    socket.on('examStarted', (data) => {
        persistProctorEvent('exam-started', data);
    });
    socket.on('examEnded', (data) => {
        persistProctorEvent('exam-ended', data);
    });
    socket.on('proctoringAlert', (data) => {
        persistProctorEvent('proctoring-alert', data);
    });
    socket.on('windowFocusChange', (data) => {
        persistProctorEvent('window-focus-change', data);
        terminateAttempt(data?.attemptId || data?.attempt);
        requestScreenshotForSocket(socket, 'window-focus-change', { examId: data?.examId, attemptId: data?.attemptId || data?.attempt });
    });

    socket.on('screenshot-upload', async (data = {}) => {
        const { examId, studentId, imageData, mimeType, attemptId, attempt } = data;
        try {
            await storeScreenshot({ examId, studentId, imageData, mimeType });
            persistProctorEvent('screen-capture', { attemptId: attemptId || attempt, examId, studentId, mimeType });
            socket.emit('screenshot-uploaded', { status: 'ok' });
        } catch (err) {
            console.error('Error storing screenshot:', err.message);
            socket.emit('screenshot-uploaded', { status: 'error', message: 'Failed to store screenshot' });
        }
    });
});
const PORT = process.env.PORT || 5000;

// Request screenshots from all connected clients every 5 minutes
const screenshotCron = new CronJob('0 */5 * * * *', () => {
    io.emit('request-screenshot', { reason: 'scheduled', requestedAt: Date.now() });
});
screenshotCron.start();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

