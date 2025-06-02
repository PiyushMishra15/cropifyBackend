const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth"); // Adjust path if needed

// Signup route (type: 'user' or 'seller')
router.post("/signup/:type", authController.SignUp);

// Signin route (type: 'user' or 'seller')
router.post("/signin/:type", authController.SignIn);

// Verify email route (type: 'user' or 'seller')
router.get("/verifyEmail/:type/:token", authController.VerifyEmail);

// Forgot password route (type: 'user' or 'seller')
router.post("/forgotPassword/:type", authController.ForgotPassword);

// Reset password route (type: 'user' or 'seller')
router.post("/resetPassword/:type", authController.ResetPassword);

router.post("/logout", authController.logout);
router.get(
  "/checkVerification/:type/:id",
  authController.CheckVerificationStatus
);

router.get("/verifyToken", authController.verifyToken, (req, res) => {
  res.status(200).json({
    message: "Token verified",
    userId: req.userId || req.sellerId,
    isVerified: req.isVerified,
  });
});

module.exports = router;
