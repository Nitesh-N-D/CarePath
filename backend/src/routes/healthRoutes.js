const express = require("express");

const {
  addHealthLog,
  createReminder,
  getDashboard,
  getHealthLogs,
  getProfile,
  getRecommendations,
  getWeeklyReport,
  listNotifications,
  listReminders,
  markNotificationRead,
  upsertProfile,
  updateReminder,
} = require("../controllers/healthController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("user", "doctor", "admin"));
router.get("/", getHealthLogs);
router.post("/", requireRole("user", "admin"), addHealthLog);
router.get("/dashboard", getDashboard);
router.get("/report", getWeeklyReport);
router.get("/profile", getProfile);
router.put("/profile", requireRole("user", "admin"), upsertProfile);
router.get("/reminders", listReminders);
router.post("/reminders", requireRole("user", "admin"), createReminder);
router.patch("/reminders/:id", requireRole("user", "admin"), updateReminder);
router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.get("/doctor-recommendations", getRecommendations);

module.exports = router;
