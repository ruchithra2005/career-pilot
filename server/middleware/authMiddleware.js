const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header is present and formatted as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header string
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify the JWT signature using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token ID and attach user data to req object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found." });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authorized, invalid token." });
    }
  }

  // Handle case where no token was passed in the request
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }
};

module.exports = { protect };