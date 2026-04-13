const User = require("../models/user.model");
const sendEmail = require("../services/email.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        msg: "User already exists"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendEmail(email, `Your OTP is ${otp}`);

    res.json({
      success: true,
      msg: "OTP sent",
      otp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};

exports.verifySignup = async (req, res) => {
  try {
    const { name, email, otp, originalOtp } = req.body;

    if (otp !== originalOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    await newUser.save();

    await sendEmail(
      email,
      `Signup successful!\nYour password is: ${plainPassword}`
    );

    res.json({
      success: true,
      msg: "Signup complete"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user && user.isVerified) {
    return res.json({ exists: true });
  }

  res.json({ exists: false });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found"
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        msg: "Please complete signup (verify OTP first)"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ msg: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  await sendEmail(email, `Your OTP is ${otp}`);

  res.json({ msg: "OTP sent" });
};

exports.verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ msg: "OTP expired" });
  }

  res.json({ msg: "OTP verified" });
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ msg: "Password updated" });
};