const express = require("express");
const router = express.Router();

// Controllers
const {
  login,
  register,
  verifyOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

router.route("/register").post(register);

router.route("/verify-otp").post(verifyOtp);

router.route("/login").post(login);

router.route("/forgotpassword").post(forgotPassword);

router.route("/passwordreset/:resetToken").put(resetPassword);

module.exports = router;
