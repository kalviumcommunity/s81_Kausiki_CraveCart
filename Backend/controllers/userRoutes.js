  const express = require("express")
  const {UserModel} = require("../model/userModel");
  const ErrorHandler = require("../utils/errorhadler");
  const bcrypt = require("bcrypt");
  const nodemailer = require("nodemailer");
  const jwt = require("jsonwebtoken");
  const crypto = require("crypto");
  const { sendMail } = require("../utils/mail");
  const catchAsyncError = require("../middleware/catchAsyncError");
  const passport=require('passport')


  const userRouter = express.Router();
  const otpStore = new Map();
  require("dotenv").config();

  // Signup Page (GET)
  userRouter.get("/signup", (req, res) => {
    res.status1(200).send("Signup Page");
  });

  // Signup (POST)
  userRouter.post(
    "/signup",
    catchAsyncError(async (req, res, next) => {
      const { name, email, password } = req.body;

      if (!email || !name || !password) {
        return next(new ErrorHandler("All fields are required", 400));
      }

      if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return next(new ErrorHandler("Invalid email format", 400));
      }

      if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)) {
        return next(
          new ErrorHandler(
            "Password must be at least 8 characters long and contain at least one letter and one number",
            400
          )
        );
      }

      const user = await userModel.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = crypto.randomInt(100000, 999999).toString();

      otpStore.set(email, {
        otp,
        name,
        hashedPassword,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      });

      await sendOTP(email, otp);
      res.status(200).json({ success: true, message: "OTP sent to your email" });
    })
  );

  // Verify OTP (POST)
  userRouter.post(
    "/verify-otp",
    catchAsyncError(async (req, res, next) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return next(new ErrorHandler("All fields are required", 400));
      }

      const storedData = otpStore.get(email);
      if (!storedData) {
        return next(new ErrorHandler("OTP expired or not requested", 400));
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return next(new ErrorHandler("OTP has expired", 400));
      }

      if (storedData.otp !== otp) {
        return next(new ErrorHandler("Invalid OTP", 400));
      }

      const newUser = await userModel.create({
        name: storedData.name,
        email,
        password: storedData.hashedPassword,
      });

      otpStore.delete(email);
      res.status(200).json({ success: true, message: "Signup successful" });
    })
  );

  // Login (POST)
  userRouter.post(
    "/login",
    catchAsyncError(async (req, res, next) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Email and password are required", 400));
      }

      const user = await userModel.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const token = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: "30d", // 30 days
      });

      res.cookie("accesstoken", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });

      res.status(200).json({ status: true, message: "Login successful" });
    })
  );

  // Helper: Send OTP Email
  async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.ADMIN_NAME,
        pass: process.env.ADMIN_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `CraveCart <${process.env.ADMIN_NAME}>`,
      to: email,
      subject: "Your OTP for Signup",
      text:`Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });
  }


const googleAuthCallback = async (req, res) => {
  try {
    const { profile, user } = req.user;

    const { displayName, emails } = profile;
    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'Email is required for authentication' });
    }


    const email = emails[0].value;
    const name = displayName;

    

    let existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      existingUser = new UserModel({
        name,
        email,
        password: null,
        role: 'user' ,
        isActivated: true,
      });
      await existingUser.save();
    }


   
    const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.SECRET, { expiresIn: "24h" });

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect(`http://localhost:5173/google-success?token=${token}`);

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Failed to authenticate with Google", error: err.message });
  }
};




  userRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


  userRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),

    (req, res, next) => {
    
      console.log("User object:", req.user);
      next();
    },
    googleAuthCallback
  );



  module.exports = {userRouter}