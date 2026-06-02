const express = require("express");
const router = express.Router();
const { createJob, getJobs, applyJob, getApplications } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Custom middleware function to restrict routing by user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    next();
  };
};

// Apply global authorization protection middleware to all job pathways
router.use(protect);

// Map /api/jobs endpoints
router.route("/")
  .get(getJobs)
  .post(authorizeRoles("recruiter", "admin"), createJob);

// Tracking applications path
router.get("/applications", getApplications);

// Submitting job applications path
router.post("/:id/apply", authorizeRoles("student"), applyJob);

module.exports = router;