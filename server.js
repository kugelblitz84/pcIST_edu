import express from 'express';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from '/config/db.js';

dotenv.config();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    },
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    })
    socket.on('tabSwitch', (data) => {
        // Handle tab switch event
        console.log(`Tab switch detected from user ${data.userId} on exam ${data.examId}`);
    });
    socket.on('examStarted', (data) => {
        console.log(`Exam started by user ${data.userId} on exam ${data.examId}`);
    });
    socket.on('examEnded', (data) => {
        console.log(`Exam ended by user ${data.userId} on exam ${data.examId}`);
    });
    socket.on('proctoringAlert', (data) => {
        console.log(`Proctoring alert for user ${data.userId} on exam ${data.examId}: ${data.alertType}`);
    });
    socket.on('windowFocusChange', (data) => {
        console.log(`Window focus change for user ${data.userId} on exam ${data.examId}: isFocused = ${data.isFocused}`);
    });
});
const PORT = process.env.PORT || 5000;

