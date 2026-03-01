const pool = require("../config/db");

// Create Disease
exports.createDisease = async (req, res) => {
  try {
    const {
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
      sources,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO diseases 
      (name, slug, body_system, category, symptoms, causes, diagnosis, treatment, prevention, emergency_signs, sources)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [name, slug, body_system, category, symptoms, causes, diagnosis, treatment, prevention, emergency_signs, sources]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Diseases
exports.getDiseases = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM diseases ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Disease
exports.getDiseaseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query("SELECT * FROM diseases WHERE slug=$1", [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Disease not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.searchDiseases = async (req, res) => {
  try {
    const {
      q,
      body_system,
      category,
      symptom,
      sort = "relevance",
      page = 1,
      limit = 5,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let whereClause = ` WHERE 1=1 `;
    let values = [];
    let index = 1;

    // Full-text search
    if (q) {
      whereClause += ` AND search_vector @@ plainto_tsquery('english', $${index})`;
      values.push(q);
      index++;
    }

    // Body system filter
    if (body_system) {
      whereClause += ` AND body_system = $${index}`;
      values.push(body_system);
      index++;
    }

    // Category filter
    if (category) {
      whereClause += ` AND category = $${index}`;
      values.push(category);
      index++;
    }

    // Symptom filter
    if (symptom) {
      whereClause += ` AND $${index} = ANY(symptoms)`;
      values.push(symptom);
      index++;
    }

    // 🔹 1️⃣ Get Total Count
    const countQuery = `SELECT COUNT(*) FROM diseases ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const totalResults = Number(countResult.rows[0].count);

    // 🔹 2️⃣ Main Search Query
    let searchQuery = `
      SELECT 
        id,
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
        sources,
        created_at,
     ${
  q
    ? `ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank,
       ts_headline('english', causes, plainto_tsquery('english', $1)) AS highlighted_causes`
    : `NULL AS rank, causes AS highlighted_causes`
}
      FROM diseases
      ${whereClause}
    `;

    // Sorting
    if (q && sort === "relevance") {
      searchQuery += ` ORDER BY rank DESC`;
    } else {
      searchQuery += ` ORDER BY created_at DESC`;
    }

    searchQuery += ` LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limitNumber);
    values.push(offset);

    const result = await pool.query(searchQuery, values);

    const totalPages = Math.ceil(totalResults / limitNumber);

    res.json({
      totalResults,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      results: result.rows,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.autocompleteDiseases = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const query = `
      SELECT 
        name,
        slug,
        similarity(name, $1) AS score
      FROM diseases
      WHERE name ILIKE $2
      ORDER BY score DESC
      LIMIT 5
    `;

    const values = [
      q,
      `%${q}%`
    ];

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};