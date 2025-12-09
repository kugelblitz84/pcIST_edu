import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const answerSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const attemptSchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'auto-submitted', 'graded'],
      default: 'in-progress',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      min: 0,
    },
    proctoringSummary: {
      alerts: { type: Number, default: 0 },
      snapshots: { type: Number, default: 0 },
    },
    terminated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

attemptSchema.index({ exam: 1, student: 1 }, { unique: true });

export default model('Attempt', attemptSchema);
