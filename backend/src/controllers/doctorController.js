const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createHttpError } = require("../utils/httpError");

const getPatients = asyncHandler(async (req, res) => {
  const doctorResult = await pool.query("SELECT id FROM doctors WHERE user_id = $1 LIMIT 1", [req.user.id]);
  const doctor = doctorResult.rows[0];

  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found.");
  }

  const result = await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        (
          SELECT row_to_json(latest_log)
          FROM (
            SELECT id, weight, height_cm, systolic_bp, diastolic_bp, sugar_level, sleep_hours, created_at
            FROM health_logs
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 1
          ) latest_log
        ) AS latest_log
      FROM patient_assignments pa
      INNER JOIN users u ON u.id = pa.user_id
      WHERE pa.doctor_id = $1
      ORDER BY u.name ASC
    `,
    [doctor.id]
  );

  res.status(200).json(result.rows);
});

module.exports = { getPatients };
