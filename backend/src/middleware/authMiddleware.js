const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createHttpError } = require("../utils/httpError");
const { hasRoleColumn, getRoleSelectSql } = require("../utils/userSchema");

const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError(401, "Missing JWT token.");
  }

  const token = authHeader.slice("Bearer ".length);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const roleEnabled = await hasRoleColumn();
  const roleSelectSql = await getRoleSelectSql("users");

  const result = await pool.query(
    `
      SELECT id, name, email, created_at, ${roleSelectSql}
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [decoded.id]
  );

  if (!result.rows.length) {
    throw createHttpError(401, "User session is no longer valid.");
  }

  req.user = result.rows[0];
  if (!roleEnabled && req.user.role === "user") {
    const doctorResult = await pool.query("SELECT id FROM doctors WHERE user_id = $1 LIMIT 1", [req.user.id]);
    if (doctorResult.rows.length) {
      req.user.role = "doctor";
    }
  }
  next();
});

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(createHttpError(401, "Authentication required."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createHttpError(403, "You do not have permission to access this resource."));
      return;
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
