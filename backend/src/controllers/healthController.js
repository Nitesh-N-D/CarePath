const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { ensureNumber, ensureRequiredString } = require("../utils/validation");
const { buildRiskAssessment, calculateBmi, getBmiCategory } = require("../services/riskEngine");
const { buildWeeklyInsightPack } = require("../services/insightsEngine");
const { getDoctorRecommendations } = require("../services/doctorRecommendationService");

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

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

function normalizeProfileRow(row) {
  if (!row) {
    return null;
  }

  const bmi = calculateBmi(row.weight, row.height_cm);

  return {
    ...row,
    age: toNumberOrNull(row.age),
    weight: toNumberOrNull(row.weight),
    height_cm: toNumberOrNull(row.height_cm),
    chronic_conditions: normalizeList(row.chronic_conditions),
    allergies: normalizeList(row.allergies),
    medications: normalizeList(row.medications),
    bmi,
    bmiCategory: getBmiCategory(bmi),
  };
}

async function fetchProfile(userId) {
  const result = await pool.query(
    `
      SELECT user_id, age, gender, weight, height_cm, location, primary_goal, chronic_conditions, allergies, medications, updated_at
      FROM user_profiles
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return normalizeProfileRow(result.rows[0]);
}

async function fetchLogs(userId) {
  const result = await pool.query(
    `
      SELECT *
      FROM health_logs
      WHERE user_id = $1
      ORDER BY created_at ASC
    `,
    [userId]
  );

  return result.rows.map(normalizeLogRow);
}

async function fetchReminders(userId) {
  const result = await pool.query(
    `
      SELECT id, medication_name, dosage, schedule_time, frequency, instructions, active, last_sent_at, created_at
      FROM medication_reminders
      WHERE user_id = $1
      ORDER BY active DESC, schedule_time ASC
    `,
    [userId]
  );

  return result.rows;
}

async function fetchNotifications(userId) {
  const result = await pool.query(
    `
      SELECT id, reminder_id, title, message, due_at, sent_at, read_at, status
      FROM reminder_notifications
      WHERE user_id = $1
      ORDER BY due_at DESC
      LIMIT 20
    `,
    [userId]
  );

  return result.rows;
}

async function fetchDiseaseContext(profile) {
  const conditions = normalizeList(profile?.chronic_conditions);
  if (!conditions.length) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT id, name, slug, symptoms, prevention
      FROM diseases
      WHERE EXISTS (
        SELECT 1
        FROM unnest($1::text[]) query_condition
        WHERE LOWER(name) LIKE '%' || LOWER(query_condition) || '%'
      )
      LIMIT 3
    `,
    [conditions]
  );

  return result.rows;
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

  await pool.query(
    `
      INSERT INTO user_profiles (user_id, weight, height_cm, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        weight = EXCLUDED.weight,
        height_cm = EXCLUDED.height_cm,
        updated_at = NOW()
    `,
    [req.user.id, payload.weight, payload.heightCm]
  );

  res.status(201).json(normalizeLogRow(result.rows[0]));
});

const getHealthLogs = asyncHandler(async (req, res) => {
  const logs = await fetchLogs(req.user.id);
  res.status(200).json(logs);
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await fetchProfile(req.user.id);
  res.status(200).json(profile);
});

const upsertProfile = asyncHandler(async (req, res) => {
  const payload = {
    age: req.body.age === "" ? null : ensureNumber(req.body.age, "Age", { min: 1, max: 120 }),
    gender: req.body.gender ? ensureRequiredString(req.body.gender, "Gender", 2) : null,
    weight: req.body.weight === "" || req.body.weight == null ? null : ensureNumber(req.body.weight, "Weight", { min: 20, max: 400 }),
    heightCm:
      req.body.height_cm === "" || req.body.height_cm == null
        ? null
        : ensureNumber(req.body.height_cm, "Height", { min: 80, max: 250 }),
    location: req.body.location ? ensureRequiredString(req.body.location, "Location", 2) : null,
    primaryGoal: req.body.primary_goal ? ensureRequiredString(req.body.primary_goal, "Primary goal", 3) : null,
    chronicConditions: normalizeList(req.body.chronic_conditions),
    allergies: normalizeList(req.body.allergies),
    medications: normalizeList(req.body.medications),
  };

  const result = await pool.query(
    `
      INSERT INTO user_profiles (
        user_id,
        age,
        gender,
        weight,
        height_cm,
        location,
        primary_goal,
        chronic_conditions,
        allergies,
        medications,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        weight = EXCLUDED.weight,
        height_cm = EXCLUDED.height_cm,
        location = EXCLUDED.location,
        primary_goal = EXCLUDED.primary_goal,
        chronic_conditions = EXCLUDED.chronic_conditions,
        allergies = EXCLUDED.allergies,
        medications = EXCLUDED.medications,
        updated_at = NOW()
      RETURNING user_id, age, gender, weight, height_cm, location, primary_goal, chronic_conditions, allergies, medications, updated_at
    `,
    [
      req.user.id,
      payload.age,
      payload.gender,
      payload.weight,
      payload.heightCm,
      payload.location,
      payload.primaryGoal,
      payload.chronicConditions,
      payload.allergies,
      payload.medications,
    ]
  );

  res.status(200).json(normalizeProfileRow(result.rows[0]));
});

const getDashboard = asyncHandler(async (req, res) => {
  const [profile, logs, reminders, notifications] = await Promise.all([
    fetchProfile(req.user.id),
    fetchLogs(req.user.id),
    fetchReminders(req.user.id),
    fetchNotifications(req.user.id),
  ]);

  const riskAssessment = buildRiskAssessment(logs);
  const weeklyReport = buildWeeklyInsightPack({ profile, riskAssessment, logs });
  const conditionForRecommendation =
    profile?.chronic_conditions?.[0] ||
    (riskAssessment.latest?.bloodPressureCategory === "High" ? "hypertension" : "") ||
    (riskAssessment.latest?.sugarCategory === "High" ? "diabetes mellitus" : "");
  const doctorRecommendations = await getDoctorRecommendations({
    condition: conditionForRecommendation,
    location: profile?.location,
  });

  res.status(200).json({
    profile,
    logs,
    riskAssessment,
    weeklyReport,
    reminders,
    notifications,
    doctorRecommendations,
  });
});

const getWeeklyReport = asyncHandler(async (req, res) => {
  const [profile, logs] = await Promise.all([fetchProfile(req.user.id), fetchLogs(req.user.id)]);
  const riskAssessment = buildRiskAssessment(logs);
  const weeklyReport = buildWeeklyInsightPack({ profile, riskAssessment, logs });

  res.status(200).json({
    report: weeklyReport,
    riskAssessment,
    logs,
  });
});

const listReminders = asyncHandler(async (req, res) => {
  const reminders = await fetchReminders(req.user.id);
  res.status(200).json(reminders);
});

const createReminder = asyncHandler(async (req, res) => {
  const medicationName = ensureRequiredString(req.body.medication_name, "Medication name", 2);
  const dosage = ensureRequiredString(req.body.dosage, "Dosage", 1);
  const scheduleTime = ensureRequiredString(req.body.schedule_time, "Schedule time", 4);
  const frequency = req.body.frequency ? ensureRequiredString(req.body.frequency, "Frequency", 3) : "daily";
  const instructions = req.body.instructions ? ensureRequiredString(req.body.instructions, "Instructions", 2) : null;

  const result = await pool.query(
    `
      INSERT INTO medication_reminders (
        user_id,
        medication_name,
        dosage,
        schedule_time,
        frequency,
        instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, medication_name, dosage, schedule_time, frequency, instructions, active, last_sent_at, created_at
    `,
    [req.user.id, medicationName, dosage, scheduleTime, frequency, instructions]
  );

  res.status(201).json(result.rows[0]);
});

const updateReminder = asyncHandler(async (req, res) => {
  const reminderId = req.params.id;
  const active = typeof req.body.active === "boolean" ? req.body.active : true;

  const result = await pool.query(
    `
      UPDATE medication_reminders
      SET active = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, medication_name, dosage, schedule_time, frequency, instructions, active, last_sent_at, created_at
    `,
    [active, reminderId, req.user.id]
  );

  res.status(200).json(result.rows[0] || null);
});

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await fetchNotifications(req.user.id);
  res.status(200).json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `
      UPDATE reminder_notifications
      SET status = 'read', read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, reminder_id, title, message, due_at, sent_at, read_at, status
    `,
    [req.params.id, req.user.id]
  );

  res.status(200).json(result.rows[0] || null);
});

const getRecommendations = asyncHandler(async (req, res) => {
  const profile = await fetchProfile(req.user.id);
  const doctors = await getDoctorRecommendations({
    condition: req.query.condition || profile?.chronic_conditions?.[0],
    location: req.query.location || profile?.location,
  });

  res.status(200).json(doctors);
});

module.exports = {
  addHealthLog,
  createReminder,
  getDashboard,
  getHealthLogs,
  getProfile,
  getRecommendations,
  getWeeklyReport,
  listNotifications,
  listReminders,
  markNotificationRead,
  upsertProfile,
  updateReminder,
  fetchProfile,
  fetchLogs,
  fetchDiseaseContext,
};
