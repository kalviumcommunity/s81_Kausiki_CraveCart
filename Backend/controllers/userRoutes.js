    const express = require("express")
    const {UserModel} = require("../model/userModel");
    const ErrorHandler = require("../utils/errorhadler");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const catchAsyncError = require("../middleware/catchAsyncError");
    const passport=require('passport')
    const { requireAuth } = require("../middleware/auth");
    const { KitchenModel } = require("../model/kitchenModel");
    const { sendMail } = require("../utils/mail");
    const { ADMIN_STATIC_EMAIL, ADMIN_STATIC_PASSWORD, isAdminEmail, normalizeEmail } = require("../utils/adminAccess");


    const userRouter = express.Router();
    require("dotenv").config();

    const resolveRoleForUser = async (user) => {
      const email = normalizeEmail(user.email);
      const ownsKitchen = Boolean(await KitchenModel.exists({ ownerUserId: user._id }));

      let role = "customer";
      if (isAdminEmail(email)) {
        role = "admin";
      } else if (ownsKitchen) {
        role = "kitchen";
      }

      if (user.role !== role) {
        user.role = role;
        await user.save();
      }

      return { role, ownsKitchen };
    };

    // Signup Page (GET)
    userRouter.get("/signup", (req, res) => {
      res.status(200).send("Signup Page");
    });

      // GET: Fetch All Users (Admin Only or for Development)
    userRouter.get(
      "/all-users",
      catchAsyncError(async (req, res, next) => {
        const users = await UserModel.find().select("-password"); // Don't return passwords

        res.status(200).json({
          success: true,
          count: users.length,
          users,
        });
      })
    );


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

        const normalizedEmail = normalizeEmail(email);

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (user) {
          return next(new ErrorHandler("User already exists", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
        });

        res.status(201).json({ success: true, message: "Signup successful" });
      })
    );

    // Forgot password: send reset link
    userRouter.post(
      "/forgot-password",
      catchAsyncError(async (req, res, next) => {
        const { email } = req.body;
        if (!email) return next(new ErrorHandler("Email is required", 400));

        const normalizedEmail = normalizeEmail(email);
        const user = await UserModel.findOne({ email: normalizedEmail });

        // Always respond success to avoid leaking which emails exist
        const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
        const dummyResponse = () =>
          res.status(200).json({ success: true, message: "If that account exists, a reset link was sent." });

        if (!user) return dummyResponse();

        if (!process.env.SECRET) return next(new ErrorHandler("Server auth misconfigured (SECRET missing)", 500));

        const resetToken = jwt.sign({ id: user._id, type: "reset" }, process.env.SECRET, { expiresIn: "15m" });
        const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`;

        try {
          await sendMail({
            email: user.email,
            subject: "Reset your CraveCart password",
            message: `Use this link to reset your password (valid 15 minutes): ${resetLink}`,
          });
        } catch (mailErr) {
          console.error("Reset mail send failed", mailErr);
          // Still respond success to avoid leaking, but log server-side
        }

        return dummyResponse();
      })
    );

    // Reset password
    userRouter.post(
      "/reset-password",
      catchAsyncError(async (req, res, next) => {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return next(new ErrorHandler("token and newPassword are required", 400));

        if (!newPassword.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)) {
          return next(
            new ErrorHandler(
              "Password must be at least 8 characters long and contain at least one letter and one number",
              400
            )
          );
        }

        if (!process.env.SECRET) return next(new ErrorHandler("Server auth misconfigured (SECRET missing)", 500));

        let decoded;
        try {
          decoded = jwt.verify(token, process.env.SECRET);
        } catch (err) {
          return next(new ErrorHandler("Invalid or expired reset token", 400));
        }

        if (!decoded || decoded.type !== "reset") {
          return next(new ErrorHandler("Invalid reset token", 400));
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) return next(new ErrorHandler("User not found", 404));

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });
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

        const normalizedEmail = normalizeEmail(email);
        let user = await UserModel.findOne({ email: normalizedEmail });

        // Static admin credential shortcut
        if (normalizedEmail === ADMIN_STATIC_EMAIL && password === ADMIN_STATIC_PASSWORD) {
          if (!user) {
            const hashedPassword = await bcrypt.hash(ADMIN_STATIC_PASSWORD, 10);
            user = await UserModel.create({
              name: "Admin",
              email: normalizedEmail,
              password: hashedPassword,
              role: "admin",
              isActivated: true,
            });
          } else {
            const updates = {};
            if (user.role !== "admin") updates.role = "admin";
            const hasMatch = user.password ? await bcrypt.compare(ADMIN_STATIC_PASSWORD, user.password) : false;
            if (!hasMatch) updates.password = await bcrypt.hash(ADMIN_STATIC_PASSWORD, 10);
            if (Object.keys(updates).length > 0) {
              user = await UserModel.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
            }
          }

          const { role } = await resolveRoleForUser(user);

          const token = jwt.sign({ id: user._id, role }, process.env.SECRET, {
            expiresIn: "30d", // 30 days
          });

          res.cookie("accesstoken", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
          });

          return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role,
            },
          });
        }

        if (!user) {
          return next(new ErrorHandler("Invalid credentials", 400));
        }

        if (!user.password) {
          return next(new ErrorHandler("Please login with Google for this account", 400));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return next(new ErrorHandler("Invalid credentials", 400));
        }

          const { role } = await resolveRoleForUser(user);

          const token = jwt.sign({ id: user._id, role }, process.env.SECRET, {
            expiresIn: "30d", // 30 days
          });

          res.cookie("accesstoken", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
          });

          res.status(200).json({ 
            success: true, 
            message: "Login successful",
            token: token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role,
            }
          });
        })
      );

    // Helper: Send OTP Email
    async function sendOTP(email, otp) {
      try {
        await sendMail({
          email: email,
          subject: "Your OTP for Signup",
          message: `Your OTP is: ${otp}. It is valid for 5 minutes.`
        });
      } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
      }
    }


    const getSafeFrontendBase = (value) => {
      const fallback = process.env.FRONTEND_URL || "http://localhost:5173";
      if (!value || typeof value !== "string") return fallback;

      // Allow only local dev origins to avoid open redirects
      if (/^http:\/\/localhost:\d+$/.test(value) || /^http:\/\/127\.0\.0\.1:\d+$/.test(value)) {
        return value;
      }
      return fallback;
    };

    const googleAuthCallback = async (req, res) => {
      try {
        const { profile, user } = req.user;

        const { displayName, emails } = profile;
        if (!emails || emails.length === 0) {
          return res.status(400).json({ message: 'Email is required for authentication' });
        }

        const email = normalizeEmail(emails[0].value);
        const name = displayName;

        

        let existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
          existingUser = new UserModel({
            name,
            email,
            password: null,
            role: 'customer' ,
            isActivated: true,
          });
          await existingUser.save();
        }

        const { role } = await resolveRoleForUser(existingUser);

        const token = jwt.sign(
          { id: existingUser._id, role },
          process.env.SECRET,
          { expiresIn: "30d" }
        );

        res.cookie("accesstoken", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

  const frontendBase = getSafeFrontendBase(req.query.state);
  const redirectUrl = `${frontendBase}/google-success?token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`;
  res.redirect(redirectUrl);

      } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ message: "Failed to authenticate with Google", error: err.message });
      }
    };



      userRouter.get(
        "/google",
        (req, res, next) => {
          // Accept frontend origin from query string and send it back via OAuth 'state'
          req._frontendBase = getSafeFrontendBase(req.query.returnTo);
          passport.authenticate("google", {
            scope: ["profile", "email"],
            session: false,
            state: req._frontendBase,
          })(req, res, next);
        }
      );


      userRouter.get(
        "/google/callback",
        passport.authenticate("google", {
          session: false,
          failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
        }),

        (req, res, next) => {
        
          console.log("User object:", req.user);
          next();
        },
        googleAuthCallback
      );


    // Current user (auth check)
    userRouter.get(
      "/me",
      requireAuth,
      catchAsyncError(async (req, res) => {
        res.status(200).json({ success: true, user: req.user });
      })
    );



    module.exports = {userRouter}