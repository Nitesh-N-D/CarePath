const express = require("express");

const { addHealthLog, getHealthLogs } = require("../controllers/healthController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireRole("user", "doctor", "admin"), getHealthLogs);
router.post("/", requireAuth, requireRole("user", "admin"), addHealthLog);

module.exports = router;
