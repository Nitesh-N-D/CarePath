const express = require("express");

const {
  getDiseases,
  getDiseaseFilters,
  searchDiseases,
  getDiseaseBySlug,
} = require("../controllers/diseaseController");

const router = express.Router();

router.get("/", getDiseases);
router.get("/filters", getDiseaseFilters);
router.get("/search", searchDiseases);
router.get("/:slug", getDiseaseBySlug);

module.exports = router;
