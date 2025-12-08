import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const roles = ['student', 'teacher', 'proctor', 'admin'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: roles,
      default: 'student',
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default model('User', userSchema);
