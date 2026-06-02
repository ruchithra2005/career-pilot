const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Post a brand new job opening (Recruiters Only)
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, salary, eligibilityCGPA } = req.body;

    // Build requirements from comma-separated string if passed as string
    const requirementsArray = Array.isArray(requirements) 
      ? requirements 
      : requirements.split(",").map(req => req.trim());

    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirementsArray,
      salary,
      eligibilityCGPA: eligibilityCGPA || 0,
      postedBy: req.user.id, // Populated by auth middleware
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all available job postings (All Roles)
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit job application (Students Only)
// @route   POST /api/jobs/:id/apply
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user.id;

    // Verify if the job opening actually exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found." });
    }

    // Verify if the student has already applied to this job to prevent duplicate records
    const alreadyApplied = await Application.findOne({ job: jobId, student: studentId });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const application = await Application.create({
      job: jobId,
      student: studentId,
      resumeUrl: req.body.resumeUrl || "https://placeholder-resume.com/resume.pdf", // Mock placeholder fallback
    });

    res.status(201).json({ message: "Application submitted successfully!", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch application status tracker (Students see theirs, Recruiters see all submissions)
// @route   GET /api/jobs/applications
exports.getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === "recruiter") {
      // Find jobs posted by this specific recruiter
      const postedJobs = await Job.find({ postedBy: req.user.id });
      const jobIds = postedJobs.map(job => job._id);

      // Populate with student details and job title info
      applications = await Application.find({ job: { $in: jobIds } })
        .populate("job", "title company salary")
        .populate("student", "name email");
    } else if (req.user.role === "student") {
      // Students only view their individual submissions
      applications = await Application.find({ student: req.user.id })
        .populate("job", "title company salary description eligibilityCGPA")
        .populate("student", "name email");
    } else {
      // Admins view all applications in the database
      applications = await Application.find()
        .populate("job", "title company")
        .populate("student", "name email");
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};