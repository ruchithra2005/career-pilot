const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job", // Link to the specific job vacancy
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Link to the student applicant profile
      required: true,
    },
    resumeUrl: {
      type: String, // String path or placeholder URL for uploaded resume files
      default: "",
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interviewing", "Accepted", "Rejected"],
      default: "Applied",
    },
    feedback: {
      type: String, // Recruiter remarks or AI interview summary
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);