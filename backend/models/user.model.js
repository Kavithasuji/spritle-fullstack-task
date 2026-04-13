const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  password:   { type: String },        
  otp: String,
  otpExpiry: Date
});

module.exports = mongoose.model("User", userSchema);