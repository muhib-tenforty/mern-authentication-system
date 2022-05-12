const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// @desc    Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is provided
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    // Check that user exists by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check that password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse("User Not Verified", 401));
    }
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Register user
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    
    var otp = Math.floor(1000 + Math.random() * 9000);
    const user = await User.create({
      username,
      email,
      password,
      otp
    });
    // HTML Message
    const message = `
      <h1>You have Received OTP Code</h1>
      <p>Please make sure to put this same code : ${otp}</p>  
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "User Otp Request",
        text: message,
      });

      res.status(200).json({ success: true, data: {success: "Email Sent", email: user.email} });
      
      user.save()
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }

    //sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// verify otp
exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    // Check that user exists by email
    const user = await User.findOne({ email })

    if (!user) {
      return next(new ErrorResponse("Invalid Email", 401));
    }

    // Check that password match
    const isMatch = await user.otp == otp;
    if(isMatch){
      user.isVerified = true;
      user.otp = null;

      await user.save();
    }
    else if (!isMatch) {
      return next(new ErrorResponse("Invalid otp", 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// secret api
exports.secretApi = async (req, res, next) => {
  const { email, secretApi } = req.body;

  if (!secretApi) {
    return next(new ErrorResponse("Please provide Secret Key", 400));
  }
  try {
    // Check that user exists by email
    const user = await User.findOne({ email })


    if(user){
      user.secretApi = secretApi;

      await user.save();
      res.status(200).json({ success: true, data: "Secret Api Added" });
    }
  } catch (err) {
    next(err);
  }
};

// key api
exports.keyApi = async (req, res, next) => {
  const { email, keyApi } = req.body;
  console.log('req.body:', req.body)
  if (!keyApi) {
    return next(new ErrorResponse("Please provide Api Key", 400));
  }
  try {
    // Check that user exists by email
    const user = await User.findOne({ email })


    if(user){
      user.keyApi = keyApi;

      await user.save();
      res.status(200).json({ success: true, data: "Private Key Added" });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password Initialization
exports.forgotPassword = async (req, res, next) => {
  // Send Email to email provided but first check if user exists
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("No email could not be sent", 404));
    }

    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset url to email to provided email
    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    // HTML Message
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a put request to the following link:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset User Password
exports.resetPassword = async (req, res, next) => {
  // Compare token in URL params to hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Updated Success",
      token: user.getSignedJwtToken(),
    });
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ sucess: true, token, email: user.email });
};
