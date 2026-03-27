const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { pool } = require("../config/db");
const { sendPasswordResetEmail } = require("../services/emailService");
const { verifyGoogleAccessToken } = require("../services/googleService");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, sanitizeUser } = require("../utils/auth");
const { createHttpError } = require("../utils/httpError");
const { hasRoleColumn, getRoleSelectSql } = require("../utils/userSchema");
const {
  ensureEmail,
  ensurePassword,
  ensureRequiredString,
} = require("../utils/validation");

const SALT_ROUNDS = 10;
const APP_URL = process.env.APP_URL || "http://localhost:5173";

let passwordColumnPromise;

async function getPasswordColumn() {
  if (!passwordColumnPromise) {
    passwordColumnPromise = pool
      .query(
        `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name IN ('password', 'password_hash')
          ORDER BY CASE WHEN column_name = 'password' THEN 0 ELSE 1 END
          LIMIT 1
        `
      )
      .then((result) => result.rows[0]?.column_name || "password");
  }

  return passwordColumnPromise;
}

async function ensureDoctorProfile(userId) {
  await pool.query(
    `
      INSERT INTO doctors (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  );
}

async function attachDerivedRole(user) {
  if (user?.role) {
    return user;
  }

  const doctorResult = await pool.query("SELECT id FROM doctors WHERE user_id = $1 LIMIT 1", [user.id]);
  return {
    ...user,
    role: doctorResult.rows.length ? "doctor" : "user",
  };
}

const register = asyncHandler(async (req, res) => {
  const name = ensureRequiredString(req.body.name, "Name", 2);
  const email = ensureEmail(req.body.email);
  const password = ensurePassword(req.body.password);
  const role = ["user", "doctor", "admin"].includes(req.body.role) ? req.body.role : "user";
  const passwordColumn = await getPasswordColumn();
  const roleEnabled = await hasRoleColumn();

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
  if (existingUser.rows.length) {
    throw createHttpError(409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = roleEnabled
    ? await pool.query(
        `
          INSERT INTO users (name, email, ${passwordColumn}, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, role, created_at
        `,
        [name, email, hashedPassword, role]
      )
    : await pool.query(
        `
          INSERT INTO users (name, email, ${passwordColumn})
          VALUES ($1, $2, $3)
          RETURNING id, name, email, created_at
        `,
        [name, email, hashedPassword]
      );

  const user = { ...result.rows[0], role: result.rows[0].role || role || "user" };
  if (role === "doctor") {
    await ensureDoctorProfile(user.id);
  }
  res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const email = ensureEmail(req.body.email);
  const password = ensureRequiredString(req.body.password, "Password");
  const passwordColumn = await getPasswordColumn();
  const roleSelectSql = await getRoleSelectSql("users");

  const result = await pool.query(
    `
      SELECT users.*, ${roleSelectSql}
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );
  let user = result.rows[0];
  const storedPassword = user?.[passwordColumn];

  if (!user || !storedPassword) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, storedPassword);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password.");
  }

  user = await attachDerivedRole(user);
  res.status(200).json({ token: signToken(user), user: sanitizeUser(user) });
});

const googleLogin = asyncHandler(async (req, res) => {
  const accessToken = ensureRequiredString(req.body.accessToken, "Google access token");
  const profile = await verifyGoogleAccessToken(accessToken);
  const passwordColumn = await getPasswordColumn();
  const roleEnabled = await hasRoleColumn();

  let result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [profile.email]);
  let user = result.rows[0];

  if (!user) {
    // Store a random hash for Google-created accounts so legacy schemas that
    // still require a password-like value don't fail with a 500 on insert.
    const generatedPassword = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
    try {
      result = roleEnabled
        ? await pool.query(
            `
              INSERT INTO users (name, email, ${passwordColumn}, role)
              VALUES ($1, $2, $3, $4)
              RETURNING id, name, email, role, created_at
            `,
            [profile.name, profile.email, generatedPassword, "user"]
          )
        : await pool.query(
            `
              INSERT INTO users (name, email, ${passwordColumn})
              VALUES ($1, $2, $3)
              RETURNING id, name, email, created_at
            `,
            [profile.name, profile.email, generatedPassword]
          );
      user = result.rows[0];
    } catch (error) {
      if (error?.code === "23505") {
        result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [profile.email]);
        user = result.rows[0];
      } else {
        throw createHttpError(
          500,
          "Google registration is temporarily unavailable. Please try again or continue with email sign-up."
        );
      }
    }
  }

  user = await attachDerivedRole(user);

  res.status(200).json({ token: signToken(user), user: sanitizeUser(user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = ensureEmail(req.body.email);

  const result = await pool.query("SELECT id, name, email FROM users WHERE email = $1 LIMIT 1", [email]);
  if (!result.rows.length) {
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    return;
  }

  const user = result.rows[0];
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query("DELETE FROM password_resets WHERE user_id = $1", [user.id]);
  await pool.query(
    `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `,
    [user.id, hashedToken, expiresAt]
  );

  const resetUrl = `${APP_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });

  res.status(200).json({ message: "If that email exists, a reset link has been sent." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = ensureEmail(req.body.email);
  const password = ensurePassword(req.body.password);
  const token = ensureRequiredString(req.body.token, "Reset token");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const passwordColumn = await getPasswordColumn();

  const result = await pool.query(
    `
      SELECT pr.id, pr.user_id, pr.expires_at
      FROM password_resets pr
      INNER JOIN users u ON u.id = pr.user_id
      WHERE u.email = $1 AND pr.token = $2
      LIMIT 1
    `,
    [email, hashedToken]
  );

  const resetEntry = result.rows[0];
  if (!resetEntry || new Date(resetEntry.expires_at).getTime() < Date.now()) {
    throw createHttpError(400, "This reset link is invalid or has expired.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.query(`UPDATE users SET ${passwordColumn} = $1 WHERE id = $2`, [hashedPassword, resetEntry.user_id]);
  await pool.query("DELETE FROM password_resets WHERE user_id = $1", [resetEntry.user_id]);

  res.status(200).json({ message: "Your password has been reset successfully." });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) });
});

const updateAccountProfile = asyncHandler(async (req, res) => {
  const name = ensureRequiredString(req.body.name, "Name", 2);
  const email = ensureEmail(req.body.email);

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1", [email, req.user.id]);
  if (existingUser.rows.length) {
    throw createHttpError(409, "Another account is already using this email.");
  }

  const result = await pool.query(
    `
      UPDATE users
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, name, email, role, created_at
    `,
    [name, email, req.user.id]
  );

  res.status(200).json({ user: sanitizeUser(result.rows[0]) });
});

const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = ensureRequiredString(req.body.currentPassword, "Current password");
  const newPassword = ensurePassword(req.body.newPassword);
  const passwordColumn = await getPasswordColumn();

  const result = await pool.query(`SELECT id, ${passwordColumn} FROM users WHERE id = $1 LIMIT 1`, [req.user.id]);
  const user = result.rows[0];

  if (!user?.[passwordColumn]) {
    throw createHttpError(400, "Password change is unavailable for this account.");
  }

  const matches = await bcrypt.compare(currentPassword, user[passwordColumn]);
  if (!matches) {
    throw createHttpError(400, "Your current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(`UPDATE users SET ${passwordColumn} = $1 WHERE id = $2`, [hashedPassword, req.user.id]);

  res.status(200).json({ message: "Password updated successfully." });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
  res.status(200).json({ message: "Account deleted successfully." });
});

module.exports = {
  changePassword,
  deleteAccount,
  updateAccountProfile,
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
