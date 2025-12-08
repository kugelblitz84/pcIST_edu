import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: undefined,
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ exam: 1, order: 1 });

export default model('Question', questionSchema);
