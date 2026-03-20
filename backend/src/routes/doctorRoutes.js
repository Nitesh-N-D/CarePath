const express = require("express");

const { getPatients } = require("../controllers/doctorController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("doctor", "admin"));
router.get("/patients", getPatients);

module.exports = router;
