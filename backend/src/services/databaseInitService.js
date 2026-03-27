const fs = require("fs/promises");
const path = require("path");

const { pool } = require("../config/db");

async function readJson(relativePath) {
  const filePath = path.join(__dirname, "../../", relativePath);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents);
}

async function runSchema() {
  const schemaPath = path.join(__dirname, "../../db/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  await pool.query(schema);
}

async function seedDiseases() {
  const diseases = await readJson("data/diseases.json");

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
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          body_system = EXCLUDED.body_system,
          category = EXCLUDED.category,
          symptoms = EXCLUDED.symptoms,
          causes = EXCLUDED.causes,
          diagnosis = EXCLUDED.diagnosis,
          treatment = EXCLUDED.treatment,
          prevention = EXCLUDED.prevention,
          emergency_signs = EXCLUDED.emergency_signs,
          sources = EXCLUDED.sources
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
        Array.isArray(disease.emergency_signs) ? disease.emergency_signs : [disease.emergency_signs].filter(Boolean),
        disease.sources,
      ]
    );
  }
}

async function seedDoctorDirectory() {
  const doctors = await readJson("data/doctorDirectory.json");

  for (const doctor of doctors) {
    await pool.query(
      `
        INSERT INTO doctor_directory (
          name,
          specialization,
          location,
          conditions,
          experience_years,
          rating,
          available,
          contact_phone,
          hospital
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT DO NOTHING
      `,
      [
        doctor.name,
        doctor.specialization,
        doctor.location,
        doctor.conditions,
        doctor.experience_years,
        doctor.rating,
        doctor.available,
        doctor.contact_phone,
        doctor.hospital,
      ]
    );
  }
}

async function initializeDatabase() {
  await runSchema();
  await seedDiseases();
  await seedDoctorDirectory();
}

module.exports = { initializeDatabase };
