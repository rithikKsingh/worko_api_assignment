const jwt = require("jsonwebtoken");

const authenticateMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error: ", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminAuthenticateMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
  
    if (!token) {
      return res.status(401).json({ message: "Authorization token not provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      if (!decoded || !decoded.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Authentication error: ", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
module.exports = { authenticateMiddleware, adminAuthenticateMiddleware };
