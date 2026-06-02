const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String], // Array of skills required (e.g., ["React", "NodeJS"])
      required: true,
    },
    salary: {
      type: String, // e.g., "$80,000 - $100,000" or "12 LPA"
      required: true,
    },
    eligibilityCGPA: {
      type: Number,
      default: 0.0, // Minimum CGPA required to apply
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links directly to the Recruiter who created the post
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);