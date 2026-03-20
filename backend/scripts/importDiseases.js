require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { pool } = require("../src/config/db");

async function importDiseases() {
  try {
    const filePath = path.join(__dirname, "../data/diseases.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const diseases = JSON.parse(rawData);

    console.log(`Found ${diseases.length} diseases. Starting import...`);

    for (const disease of diseases) {
      await pool.query(
        `
          INSERT INTO diseases (
            name,
            slug,
            body_system,
            category,
            symptoms,
            causes,
            diagnosis,
            treatment,
            prevention,
            emergency_signs,
            sources
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (slug) DO NOTHING
        `,
        [
          disease.name,
          disease.slug,
          disease.body_system,
          disease.category,
          disease.symptoms,
          disease.causes,
          disease.diagnosis,
          disease.treatment,
          disease.prevention,
          disease.emergency_signs,
          disease.sources,
        ]
      );
    }

    console.log("Disease import completed successfully.");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Disease import failed:", error);
    await pool.end();
    process.exit(1);
  }
}

importDiseases();
