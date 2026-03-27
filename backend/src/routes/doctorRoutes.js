const express = require("express");

const {
  createClinicalNote,
  getClinicalNotes,
  getPatients,
} = require("../controllers/doctorController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("doctor", "admin"));
router.get("/patients", getPatients);
router.get("/notes", getClinicalNotes);
router.post("/notes", createClinicalNote);

module.exports = router;
