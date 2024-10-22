const jwt = require("jsonwebtoken");

// Middleware to verify token and assign user id to req.userId
const TokenVerificationMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "Failed to authenticate token." });
  }
};

module.exports = TokenVerificationMiddleware;
