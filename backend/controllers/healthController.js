const pool = require("../config/db");

// Add health log
exports.addHealthLog = async (req, res) => {
  try {
    const { weight, systolic_bp, diastolic_bp, sugar_level, sleep_hours } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
  `INSERT INTO health_logs
   (user_id, weight, systolic_bp, diastolic_bp, sugar_level, sleep_hours, created_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7)
   RETURNING *`,
  [
    userId,
    weight,
    systolic_bp,
    diastolic_bp,
    sugar_level,
    sleep_hours,
    date || new Date()
  ]
);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's health logs
exports.getHealthLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM health_logs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};