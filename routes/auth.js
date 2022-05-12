const express = require("express");
const router = express.Router();

// Controllers
const {
  login,
  register,
  verifyOtp,
  secretApi,
  keyApi,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

router.route("/register").post(register);

router.route("/verify-otp").post(verifyOtp);

router.route("/secret-api").post(secretApi);

router.route("/key-api").post(keyApi);

router.route("/login").post(login);

router.route("/forgotpassword").post(forgotPassword);

router.route("/passwordreset/:resetToken").put(resetPassword);

module.exports = router;
