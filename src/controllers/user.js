import User from "../models/userModel.js";
import { generateOtp, hashPassword, isMatched, tokenGenerator } from "../utils/index.js";
import { sendOtpEmail } from "../utils/mail.js";

export const SignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const hp = await hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hp,
    });

    const result = await user.save();
    const payload = { id: result._id, email: result.email };
    const token = tokenGenerator(payload);

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      token,
      user: {
        id: result._id,
        email: result.email,
        role: result.role,
      },
    });
  } catch (error) {
    console.log("signup error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    const userExist = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userExist) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isValid = await isMatched(password, userExist.password);
    if (!isValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    const payload = { id: userExist._id, email: userExist.email };
    const token = tokenGenerator(payload);

    return res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      token,
      user: {
        id: userExist._id,
        email: userExist.email,
        role: userExist.role,
      },
    });
  } catch (error) {
    console.log("signin error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User profile fetched",
      user,
    });
  } catch (error) {
    console.log("get profile error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const usedetails = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const requestedUserId = req.params.id;

    if (currentUserId !== requestedUserId && req.user?.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    const user = await User.findById(requestedUserId).select("-password -otp");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User found successfully",
      user,
    });
  } catch (error) {
    console.log("user details error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000);
    user.otp = await hashPassword(otp);
    user.otpExpires = otpExpires;
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailError) {
      console.log("otp email error:", mailError);
    }

    return res.status(200).json({
      status: "success",
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log("forgot password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({
        status: "error",
        message: "OTP not found or expired",
      });
    }

    if (new Date(user.otpExpires) < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      return res.status(400).json({
        status: "error",
        message: "OTP expired",
      });
    }

    const isValidOtp = await isMatched(otp, user.otp);
    if (!isValidOtp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP",
      });
    }

    // user.otp = null;
    // user.otpExpires = null;
    // await user.save();

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("verify otp error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email, OTP, and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({
        status: "error",
        message: "OTP not found or expired",
      });
    }

    if (new Date(user.otpExpires) < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      return res.status(400).json({
        status: "error",
        message: "OTP expired",
      });
    }

    const isValidOtp = await isMatched(otp, user.otp);
    if (!isValidOtp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP",
      });
    }

    user.password = await hashPassword(password);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("reset password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
