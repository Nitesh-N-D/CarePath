const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addHealthLog, getHealthLogs } = require("../controllers/healthController");

router.post("/", authMiddleware, addHealthLog);
router.get("/", authMiddleware, getHealthLogs);

module.exports = router;