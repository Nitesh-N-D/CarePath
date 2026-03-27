const express = require("express");

const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
  deleteAccount,
  updateAccountProfile,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getCurrentUser);
router.put("/profile", requireAuth, updateAccountProfile);
router.post("/change-password", requireAuth, changePassword);
router.delete("/account", requireAuth, deleteAccount);

module.exports = router;
