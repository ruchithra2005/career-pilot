const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json()); // Allows parsing incoming JSON payloads

// Mount REST API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/ai", require("./routes/aiRoutes")); // Connects AI mock interview & scoring endpoints

// Base Fallback API check route
app.get("/", (req, res) => {
  res.send("Career Pilot API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});