const express = require("express");

const { getUsers, assignDoctor, getAnalytics } = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/users", getUsers);
router.get("/analytics", getAnalytics);
router.put("/assign-doctor", assignDoctor);

module.exports = router;
