import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const tokenGenerator = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const isMatched = async (password, dbpassword) => {
  return bcrypt.compare(password, dbpassword);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};