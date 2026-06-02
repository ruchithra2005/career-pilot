const express = require("express");
const router = express.Router();
const { startInterview, submitAnswer, getHistory } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Ensure all AI prep endpoints are guarded by token authentication
router.use(protect);

// Route mappings for the AI interview sequence
router.post("/start", startInterview);
router.post("/submit", submitAnswer);
router.get("/history", getHistory);

module.exports = router;