const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { ensureNumber } = require("../utils/validation");

function normalizeLogRow(row) {
  return {
    ...row,
    weight: Number(row.weight),
    systolic_bp: Number(row.systolic_bp),
    diastolic_bp: Number(row.diastolic_bp),
    sugar_level: Number(row.sugar_level),
    sleep_hours: Number(row.sleep_hours),
    height_cm: Number(row.height_cm),
  };
}

const addHealthLog = asyncHandler(async (req, res) => {
  const payload = {
    weight: ensureNumber(req.body.weight, "Weight", { min: 20, max: 400 }),
    heightCm: ensureNumber(req.body.height_cm, "Height", { min: 80, max: 250 }),
    systolicBp: ensureNumber(req.body.systolic_bp, "Systolic BP", { min: 60, max: 260 }),
    diastolicBp: ensureNumber(req.body.diastolic_bp, "Diastolic BP", { min: 40, max: 180 }),
    sugarLevel: ensureNumber(req.body.sugar_level, "Sugar level", { min: 20, max: 600 }),
    sleepHours: ensureNumber(req.body.sleep_hours, "Sleep hours", { min: 0, max: 24 }),
    createdAt: req.body.created_at ? new Date(req.body.created_at) : new Date(),
  };

  const result = await pool.query(
    `
      INSERT INTO health_logs (
        user_id,
        weight,
        height_cm,
        systolic_bp,
        diastolic_bp,
        sugar_level,
        sleep_hours,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      req.user.id,
      payload.weight,
      payload.heightCm,
      payload.systolicBp,
      payload.diastolicBp,
      payload.sugarLevel,
      payload.sleepHours,
      payload.createdAt,
    ]
  );

  res.status(201).json(normalizeLogRow(result.rows[0]));
});

const getHealthLogs = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `
      SELECT *
      FROM health_logs
      WHERE user_id = $1
      ORDER BY created_at ASC
    `,
    [req.user.id]
  );

  res.status(200).json(result.rows.map(normalizeLogRow));
});

module.exports = { addHealthLog, getHealthLogs };
