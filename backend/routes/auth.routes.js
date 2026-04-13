const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");

router.post("/signup", auth.signup);  // ✅ now works
router.post("/verify-signup", auth.verifySignup); // ✅ ADD THIS
router.post("/check-email", auth.checkEmail);
router.post("/login", auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-forgot-otp', auth.verifyForgotOtp);
router.post('/reset-password', auth.resetPassword);




module.exports = router;