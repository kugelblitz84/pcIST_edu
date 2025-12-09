import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventTypes = [
  'tab-switch',
  'window-blur',
  'fullscreen-exit',
  'webcam-capture',
  'screen-capture',
  'window-focus-change',
  'exam-started',
  'exam-ended',
  'proctoring-alert',
  'warning',
  'info',
];

const proctorEventSchema = new Schema(
  {
    attempt: {
      type: Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: eventTypes,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

proctorEventSchema.index({ attempt: 1, createdAt: -1 });

export default model('ProctorEvent', proctorEventSchema);
