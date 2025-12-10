import Exam from "../models/Exam.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";

const createExam = async (req, res) => {
  try {
    const { title, description, proctoredBy, startTime, endTime, questions } = req.body;
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
      questions: questions || [],
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
    const requester = req.user;
    const isSelf = requester?._id?.toString() === userId;

    if (requester.role === "student" && !isSelf) {
      return res
        .status(403)
        .json({ message: "Forbidden: students can only view their own attempts" });
    }

    if (requester.role === "proctor" && !isSelf) {
      return res
        .status(403)
        .json({ message: "Forbidden: proctors can only view their own attempts" });
    }

    if (
      requester.role !== "student" &&
      requester.role !== "teacher" &&
      requester.role !== "admin" &&
      requester.role !== "proctor"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

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
    const requester = req.user;
    const isSelf = requester?._id?.toString() === userId;

    if (requester.role === "proctor" && !isSelf) {
      return res
        .status(403)
        .json({ message: "Forbidden: proctors can only view their own exams" });
    }

    if (
      requester.role !== "teacher" &&
      requester.role !== "admin" &&
      requester.role !== "proctor"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

    const exams = await Exam.find({ proctoredBy: userId });
    res.status(200).json({ exams });
  } catch (error) {
    console.error("Error in getExamProctoredByUserId:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


const startExamAttempt = async (req, res) => {
  try {
    const examId = req.params.examId;
    const requester = req.user;
    if (requester.role !== "student") {
      return res
        .status(403)
        .json({ message: "Forbidden: only students can start exam attempts" });
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    const existingAttempt = await Attempt.findOne({
      exam: examId,
      student: requester._id,
    });
    if (existingAttempt) {
      return res
        .status(400)
        .json({ message: "You have already started this exam." });
    }
    const newAttempt = new Attempt({
      exam: examId,
      student: requester._id,
      startTime: new Date(),
    });
    await newAttempt.save();
    res.status(201).json({ message: "Exam attempt started" });
  }
  catch (error) {
    console.error("Error in startExamAttempt:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getQuestionsForExam = async (req, res) => {
  // Implementation for fetching questions for a specific exam
  const examId = req.params.examId;
  const requester = req.user;
  if (requester.role !== "student") {
    return res.status(403).json({ message: "Forbidden: only students can access exam questions" });
  }
  try {
    const questions = await Question.find({ exam: examId });
    if (!questions) {
      return res.status(404).json({ message: "Questions not found for this exam" });
    }
    //only send questions if time is within exam start and end time
    const exam = await Exam.findById(examId);
    const now = new Date();
    //only 
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error in getQuestionsForExam:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const submitAnswers = async (req, res) => {
  // Implementation for submitting answers for an exam attempt
  const attemptId = req.params.attemptId;
  const requester = req.user;
  if (requester.role !== "student") {
    return res.status(403).json({ message: "Forbidden: only students can submit answers" });
  }
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    return res.status(404).json({ message: "Attempt not found" });
  }
  if (attempt.student.toString() !== requester._id.toString()) {
    return res.status(403).json({ message: "Forbidden: you can only submit your own attempts" });
  }
  //check if exam time is over
  const exam = await Exam.findById(attempt.exam);
  const now = new Date();
  if (now > exam.endTime) {
    return res.status(400).json({ message: "Exam time is over. You cannot submit answers." });
  }
  try {
    const { answers } = req.body;
    attempt.answers = answers;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    await attempt.save();
    res.status(200).json({ message: "Answers submitted successfully" });
  } catch (error) {
    console.error("Error in submitAnswers:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }

};

export { createExam, getExams, getAttemptedExambyUserId, getExamProctoredByUserId, startExamAttempt, getQuestionsForExam, submitAnswers };