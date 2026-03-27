const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createHttpError } = require("../utils/httpError");
const { ensureRequiredString } = require("../utils/validation");
const { buildRiskAssessment } = require("../services/riskEngine");

async function getDoctorIdForUser(userId) {
  const doctorResult = await pool.query("SELECT id FROM doctors WHERE user_id = $1 LIMIT 1", [userId]);
  return doctorResult.rows[0]?.id || null;
}

const getPatients = asyncHandler(async (req, res) => {
  const doctorId = await getDoctorIdForUser(req.user.id);

  if (!doctorId) {
    throw createHttpError(404, "Doctor profile not found.");
  }

  const result = await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        up.age,
        up.gender,
        up.location,
        up.primary_goal,
        up.chronic_conditions,
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
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE pa.doctor_id = $1
      ORDER BY u.name ASC
    `,
    [doctorId]
  );

  const patients = await Promise.all(
    result.rows.map(async (patient) => {
      const logs = await pool.query(
        `
          SELECT weight, height_cm, systolic_bp, diastolic_bp, sugar_level, sleep_hours, created_at
          FROM health_logs
          WHERE user_id = $1
          ORDER BY created_at ASC
        `,
        [patient.id]
      );

      return {
        ...patient,
        risk_assessment: buildRiskAssessment(logs.rows),
      };
    })
  );

  res.status(200).json(patients);
});

const getClinicalNotes = asyncHandler(async (req, res) => {
  const doctorId = await getDoctorIdForUser(req.user.id);
  if (!doctorId) {
    throw createHttpError(404, "Doctor profile not found.");
  }

  const result = await pool.query(
    `
      SELECT id, patient_user_id, note, created_at
      FROM clinical_notes
      WHERE doctor_id = $1
      ORDER BY created_at DESC
    `,
    [doctorId]
  );

  res.status(200).json(result.rows);
});

const createClinicalNote = asyncHandler(async (req, res) => {
  const doctorId = await getDoctorIdForUser(req.user.id);
  if (!doctorId) {
    throw createHttpError(404, "Doctor profile not found.");
  }

  const patientUserId = ensureRequiredString(req.body.patient_user_id, "Patient user id");
  const note = ensureRequiredString(req.body.note, "Clinical note", 4);

  const assignment = await pool.query(
    `
      SELECT id
      FROM patient_assignments
      WHERE doctor_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [doctorId, patientUserId]
  );

  if (!assignment.rows.length) {
    throw createHttpError(403, "You can only add notes for assigned patients.");
  }

  const result = await pool.query(
    `
      INSERT INTO clinical_notes (doctor_id, patient_user_id, note)
      VALUES ($1, $2, $3)
      RETURNING id, patient_user_id, note, created_at
    `,
    [doctorId, patientUserId, note]
  );

  res.status(201).json(result.rows[0]);
});

module.exports = { createClinicalNote, getClinicalNotes, getPatients };
