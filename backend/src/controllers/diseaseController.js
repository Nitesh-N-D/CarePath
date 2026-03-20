const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(/[,.;]\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeDisease(row) {
  return {
    ...row,
    symptoms: normalizeList(row.symptoms),
    emergency_signs: normalizeList(row.emergency_signs),
    sources: normalizeList(row.sources),
  };
}

const getDiseases = asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `
      SELECT id, name, slug, body_system, category, symptoms, causes, diagnosis, treatment, prevention, emergency_signs, sources, created_at
      FROM diseases
      ORDER BY name ASC
    `
  );

  res.status(200).json(result.rows.map(normalizeDisease));
});

const searchDiseases = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 8), 1), 50);
  const offset = (page - 1) * limit;

  const filters = [];
  const values = [];
  let index = 1;

  if (q) {
    filters.push(`(
      name ILIKE $${index}
      OR category ILIKE $${index}
      OR body_system ILIKE $${index}
      OR EXISTS (
        SELECT 1 FROM unnest(symptoms) symptom WHERE symptom ILIKE $${index}
      )
    )`);
    values.push(`%${q}%`);
    index += 1;
  }

  if (req.query.body_system) {
    filters.push(`body_system = $${index}`);
    values.push(req.query.body_system);
    index += 1;
  }

  if (req.query.category) {
    filters.push(`category = $${index}`);
    values.push(req.query.category);
    index += 1;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const countQuery = `SELECT COUNT(*)::int AS count FROM diseases ${whereClause}`;
  const dataQuery = `
    SELECT id, name, slug, body_system, category, symptoms, causes, diagnosis, treatment, prevention, emergency_signs, sources, created_at
    FROM diseases
    ${whereClause}
    ORDER BY created_at DESC, name ASC
    LIMIT $${index} OFFSET $${index + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  const totalResults = countResult.rows[0].count;
  res.status(200).json({
    totalResults,
    totalPages: Math.max(Math.ceil(totalResults / limit), 1),
    currentPage: page,
    results: dataResult.rows.map(normalizeDisease),
  });
});

const getDiseaseBySlug = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM diseases WHERE slug = $1 LIMIT 1", [req.params.slug]);
  if (!result.rows.length) {
    res.status(404).json({ message: "Disease not found." });
    return;
  }
  res.status(200).json(normalizeDisease(result.rows[0]));
});

module.exports = { getDiseases, searchDiseases, getDiseaseBySlug };
