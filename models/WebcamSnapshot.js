import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const webcamSnapshotSchema = new Schema(
  {
    attempt: {
      type: Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      index: true,
    },
    imageData: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'image/png',
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

webcamSnapshotSchema.index({ attempt: 1, capturedAt: -1 });

export default model('WebcamSnapshot', webcamSnapshotSchema);
