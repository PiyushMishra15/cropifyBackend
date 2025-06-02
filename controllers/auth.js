const User = require("../models/userModel");
const Seller = require("../models/sellerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // No curly braces

const crypto = require("crypto");

// Register a new user
exports.SignUp = async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const { name, email, password, contact, brandName } = req.body;

    if (type === "seller") {
      const sellerExists = await Seller.findOne({ email });
      if (sellerExists) {
        return res.status(400).json({ message: "Seller already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const newSeller = new Seller({
        name,
        email,
        password: hashedPassword,
        contact,
        brandName,
        verificationToken,
        verificationTokenExpiry: Date.now() + 3600000,
      });

      await newSeller.save();

      const token = jwt.sign(
        { id: newSeller._id, type },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 3600000,
      });
      res.cookie("sellerId", newSeller._id, {
        httpOnly: true,
        sameSite: "Strict", // Prevent CSRF attacks
        maxAge: 3600000, // 1 hour
      });

      // Send email asynchronously before return
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/verifyEmail/${type}/${verificationToken}`;
      sendEmail({
        email: newSeller.email,
        subject: "Verify your email address",
        message: `Please verify your email: ${verificationUrl}`,
        template: "mailVerify",
        templateData: {
          name: newSeller.name,
          verificationUrl,
        },
      }).catch((err) =>
        console.error("Failed to send seller verification email:", err)
      );

      return res.status(200).json({
        token,
        userId: newSeller._id,
        message: `A verification email has been sent to ${newSeller.email}. Please verify your account.`,
      });
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        contact,
        verificationToken,
        verificationTokenExpiry: Date.now() + 3600000,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, type },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 3600000,
      });

      // Send email asynchronously before return
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/verifyEmail/${type}/${verificationToken}`;
      sendEmail({
        email: newUser.email,
        subject: "Verify your email address",
        message: `Please verify your email: ${verificationUrl}`,
        template: "mailVerify",
        templateData: {
          name: newUser.name,
          verificationUrl,
        },
      }).catch((err) =>
        console.error("Failed to send user verification email:", err)
      );

      return res.status(200).json({
        token,
        userId: newUser._id,
        message: `A verification email has been sent to ${newUser.email}. Please verify your account.`,
      });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }
    let type = req.params.type.toLowerCase();

    if (type == "seller") {
      const seller = await Seller.findOne({
        email: email,
      });

      if (!seller) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const isPasswordValid = await bcrypt.compare(password, seller.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      // Generate JWT token
      const token = jwt.sign(
        { id: seller._id, type: type },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict", // Prevent CSRF attacks
        maxAge: 3600000, // 1 hour
      });
      res.cookie("sellerId", seller._id, {
        httpOnly: true,
        sameSite: "Strict", // Prevent CSRF attacks
        maxAge: 3600000, // 1 hour
      });
      return res
        .status(200)
        .json({ token, userId: seller._id, brandName: seller.brandName });
    }

    // Check if user existsels
    else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, type: type },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict", // Prevent CSRF attacks
        maxAge: 3600000, // 1 hour
      });

      return res.status(200).json({ token, userId: user._id });
    }
  } catch (error) {
    console.error("Error during signin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify email
exports.VerifyEmail = async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const token = req.params.token;

    let account;

    if (type === "seller") {
      account = await Seller.findOne({ verificationToken: token });
    } else {
      account = await User.findOne({ verificationToken: token });
    }

    if (!account) {
      return res.status(400).send("<h2>❌ Invalid or expired token</h2>");
    }

    if (
      account.verificationTokenExpiry &&
      account.verificationTokenExpiry < Date.now()
    ) {
      return res.status(400).send("<h2>⏰ Token has expired</h2>");
    }

    account.isVerified = true;
    account.verificationToken = undefined;
    account.verificationTokenExpiry = undefined;
    await account.save();

    res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </head>
        <body style="text-align: center; font-family: sans-serif; padding-top: 50px;">
          <h2>✅ Email Verified!</h2>
          <p>You can return to the original device to continue.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).send("<h2>🚨 Internal Server Error</h2>");
  }
};

// route: /api/auth/check-verification/:type/:id
exports.CheckVerificationStatus = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "seller") {
      const seller = await Seller.findById(id);
      if (!seller) return res.status(404).json({ verified: false });

      return res.status(200).json({ verified: seller.isVerified });
    } else {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ verified: false });

      return res.status(200).json({ verified: user.isVerified });
    }
  } catch (error) {
    console.error("Verification status check error:", error);
    res.status(500).json({ verified: false });
  }
};

// Forgot password
exports.ForgotPassword = async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();

    if (type !== "user" && type !== "seller") {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (type === "seller") {
      const seller = await Seller.findOne({ email });

      if (!seller) {
        return res.status(400).json({ message: "Seller not found" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      seller.resetToken = resetToken;
      seller.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await seller.save(); // ✅ Save changes

      const resetUrl = `http://localhost:5173/resetPassword/${type}/${resetToken}`;

      const mailRes = await sendEmail({
        email,
        subject: "Reset Your Password",
        message: `Reset your password here: ${resetUrl}`,
        template: "resetPassword",
        templateData: {
          name: seller.name,
          resetUrl,
        },
      });

      if (!mailRes) {
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      return res.status(200).json({
        message: `A password reset email has been sent to ${seller.email}. Please check your inbox.`,
      });
    } else {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save(); // ✅ Save changes

      const resetUrl = `http://localhost:5173/resetPassword/${type}/${resetToken}`;

      const mailRes = await sendEmail({
        email,
        subject: "Reset Your Password",
        message: `Reset your password here: ${resetUrl}`,
        template: "resetPassword",
        templateData: {
          name: user.name,
          resetUrl,
        },
      });
      console.log("Mail response:", mailRes);

      if (!mailRes) {
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      return res.status(200).json({
        message: `A password reset email has been sent to ${user.email}. Please check your inbox.`,
      });
    }
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password
exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // Find user by reset token

    let type = req.params.type.toLowerCase();
    if (type === "seller") {
      const seller = await Seller.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
      if (!seller) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update user's password and clear reset token
      seller.password = hashedPassword;
      seller.resetToken = undefined;
      seller.resetTokenExpiry = undefined;
      await seller.save();
      return res.status(200).json({ message: "Password reset successfully" });
    } else {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update user's password and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(200).json({ message: "Password reset successfully" });
    }
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, type } = decoded;

    if (type === "seller") {
      const seller = await Seller.findById(id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      req.sellerId = id;
      req.isVerified = seller.isVerified;
    } else {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.userId = user._id;
      req.isVerified = user.isVerified;
    }

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict", // Prevent CSRF attacks
    maxAge: 0, // Clear the cookie
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
