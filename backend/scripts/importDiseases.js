require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function importDiseases() {
  try {
    const filePath = path.join(__dirname, "../data/diseases.json");
    const rawData = fs.readFileSync(filePath);
    const diseases = JSON.parse(rawData);

    console.log(`Found ${diseases.length} diseases. Starting import...`);

    for (const d of diseases) {
      await pool.query(
        `INSERT INTO diseases
        (name, slug, body_system, category, symptoms, causes, diagnosis, treatment, prevention, emergency_signs, sources)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (slug) DO NOTHING`,
        [
          d.name,
          d.slug,
          d.body_system,
          d.category,
          d.symptoms,
          d.causes,
          d.diagnosis,
          d.treatment,
          d.prevention,
          d.emergency_signs,
          d.sources
        ]
      );
    }

    console.log("✅ Import completed successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importDiseases();