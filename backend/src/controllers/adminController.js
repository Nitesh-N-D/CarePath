const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createHttpError } = require("../utils/httpError");
const { hasRoleColumn, getRoleSelectSql } = require("../utils/userSchema");

const getUsers = asyncHandler(async (_req, res) => {
  const roleEnabled = await hasRoleColumn();
  const roleSelectSql = await getRoleSelectSql("u");
  const result = await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        ${roleSelectSql},
        u.created_at,
        pa.doctor_id
      FROM users u
      LEFT JOIN patient_assignments pa ON pa.user_id = u.id
      ORDER BY u.created_at DESC
    `
  );

  const rows = roleEnabled
    ? result.rows
    : result.rows.map((row) => ({
        ...row,
        role: row.doctor_id ? "doctor" : "user",
      }));

  res.status(200).json(rows);
});

const assignDoctor = asyncHandler(async (req, res) => {
  const { doctorId, userId } = req.body;
  const roleEnabled = await hasRoleColumn();

  const doctorResult = roleEnabled
    ? await pool.query(
        `
          SELECT d.id
          FROM doctors d
          INNER JOIN users u ON u.id = d.user_id
          WHERE d.id = $1 AND u.role = 'doctor'
          LIMIT 1
        `,
        [doctorId]
      )
    : await pool.query("SELECT id FROM doctors WHERE id = $1 LIMIT 1", [doctorId]);

  if (!doctorResult.rows.length) {
    throw createHttpError(404, "Doctor record not found.");
  }

  const patientResult = roleEnabled
    ? await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'user' LIMIT 1", [userId])
    : await pool.query(
        `
          SELECT u.id
          FROM users u
          LEFT JOIN doctors d ON d.user_id = u.id
          WHERE u.id = $1 AND d.id IS NULL
          LIMIT 1
        `,
        [userId]
      );

  if (!patientResult.rows.length) {
    throw createHttpError(404, "Patient record not found.");
  }

  await pool.query(
    `
      INSERT INTO patient_assignments (doctor_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (doctor_id, user_id) DO NOTHING
    `,
    [doctorId, userId]
  );

  res.status(200).json({ message: "Doctor assigned successfully." });
});

const getAnalytics = asyncHandler(async (_req, res) => {
  const [usersCount, healthCount, doctorsCount, assignmentsCount] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM users"),
    pool.query("SELECT COUNT(*)::int AS count FROM health_logs"),
    pool.query("SELECT COUNT(*)::int AS count FROM doctors"),
    pool.query("SELECT COUNT(*)::int AS count FROM patient_assignments"),
  ]);

  res.status(200).json({
    totalUsers: usersCount.rows[0].count,
    totalHealthLogs: healthCount.rows[0].count,
    totalDoctors: doctorsCount.rows[0].count,
    totalAssignments: assignmentsCount.rows[0].count,
  });
});

module.exports = { getUsers, assignDoctor, getAnalytics };
