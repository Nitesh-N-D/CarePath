const express = require("express");

const { getHistory, sendMessage, streamMessage } = require("../controllers/assistantController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("user", "doctor", "admin"));
router.get("/history", getHistory);
router.post("/chat", sendMessage);
router.post("/chat/stream", streamMessage);

module.exports = router;
