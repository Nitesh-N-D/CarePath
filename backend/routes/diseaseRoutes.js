const express = require("express");
const router = express.Router();
const {
  createDisease,
  getDiseases,
  getDiseaseBySlug,
  searchDiseases,
  autocompleteDiseases
} = require("../controllers/diseaseController");
router.post("/", createDisease);
router.get("/", getDiseases);
router.get("/search", searchDiseases);
router.get("/autocomplete", autocompleteDiseases);
router.get("/:slug", getDiseaseBySlug);

module.exports = router;