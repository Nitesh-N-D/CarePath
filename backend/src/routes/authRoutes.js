const express = require("express");

const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
