const { pool } = require("../config/db");

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

async function getDoctorRecommendations({ condition, location }) {
  const normalizedCondition = normalize(condition);
  const normalizedLocation = normalize(location);

  const values = [];
  const filters = ["available = TRUE"];
  let index = 1;

  if (normalizedLocation) {
    filters.push(`LOWER(location) = $${index}`);
    values.push(normalizedLocation);
    index += 1;
  }

  if (normalizedCondition) {
    filters.push(`EXISTS (SELECT 1 FROM unnest(conditions) condition WHERE LOWER(condition) LIKE $${index})`);
    values.push(`%${normalizedCondition}%`);
    index += 1;
  }

  const result = await pool.query(
    `
      SELECT id, name, specialization, location, conditions, experience_years, rating, contact_phone, hospital
      FROM doctor_directory
      WHERE ${filters.join(" AND ")}
      ORDER BY rating DESC, experience_years DESC
      LIMIT 5
    `,
    values
  );

  if (result.rows.length) {
    return result.rows;
  }

  const fallback = await pool.query(
    `
      SELECT id, name, specialization, location, conditions, experience_years, rating, contact_phone, hospital
      FROM doctor_directory
      WHERE available = TRUE
      ORDER BY rating DESC, experience_years DESC
      LIMIT 5
    `
  );

  return fallback.rows;
}

module.exports = { getDoctorRecommendations };
