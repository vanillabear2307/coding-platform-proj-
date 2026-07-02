const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Check if req.user is already populated by Passport / cookie session
  if (req.user) {
    return next();
  }

  // Fallback to checking JWT token header
  const token = req.header("token") || req.header("Authorization") || req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ err: "Authentication required" });
  }

  try {
    const parsedToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(parsedToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Combined auth error:", err.message);
    res.status(401).json({ err: "Invalid Token" });
  }
};
