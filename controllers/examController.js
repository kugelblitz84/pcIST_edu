import Exam from "../models/Exam";

const createExam = async (req, res) => {
  try {
    const { title, description, proctoredBy, startTime, endTime } = req.body;
    const user = req.user;
    if (user.role !== "teacher" && user.role !== "admin") {
      return res.status(403).json({ message: "Only teachers and admins can create exams." });
    }
    if (!title || !startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "Title, start time, and end time are required." });
    }
    if (!proctoredBy) {
      return res
        .status(400)
        .json({ message: "Proctor information is required." });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ message: "Invalid start or end time." });
    }
    const durationMinutes = Math.ceil((end - start) / (1000 * 60));

    const newExam = new Exam({
      title,
      description,
      proctoredBy,
      startTime: start,
      endTime: end,
      durationMinutes,
      createdBy: req.user._id,
    });
    await newExam.save();
    res.status(201).json({ exam: newExam });
  } catch (error) {
    console.error("Error in createExam:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getExams = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "teacher" || user.role === "admin") {
      const exams = await Exam.find();
      return res.status(200).json({ exams });
    } else {
      return res
        .status(403)
        .json({
          message: "Forbidden: only Teachers and Admins can view all exams",
        });
    }
  } catch (error) {
    console.error("Error in getExams:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getAttemptedExambyUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const exams = await Attempt.find({ student: userId }).populate("exam");
    res.status(200).json({ exams });
  } catch (error) {
    console.error("Error in getAttemptedExam:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getExamProctoredByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const exams = await Exam.find({ proctoredBy: userId });
    res.status(200).json({ exams });
  } catch (error) {
    console.error("Error in getExamProctoredByUserId:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export { createExam, getExams, getAttemptedExambyUserId, getExamProctoredByUserId };
