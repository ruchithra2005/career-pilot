const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domain: {
      type: String,
      required: true,
      enum: ["frontend", "backend"],
    },
    questions: {
      type: [String],
      required: true,
    },
    answers: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Started", "Completed"],
      default: "Started",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);