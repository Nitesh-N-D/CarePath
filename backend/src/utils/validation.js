const { createHttpError } = require("./httpError");

function ensureEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!valid) {
    throw createHttpError(400, "Please provide a valid email address.");
  }

  return normalizedEmail;
}

function ensurePassword(password) {
  const rawPassword = String(password || "");
  if (rawPassword.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters long.");
  }
  return rawPassword;
}

function ensureRequiredString(value, fieldName, minLength = 1) {
  const normalized = String(value || "").trim();
  if (normalized.length < minLength) {
    throw createHttpError(400, `${fieldName} is required.`);
  }
  return normalized;
}

function ensureNumber(value, fieldName, options = {}) {
  const parsed = Number(value);
  const { min, max } = options;

  if (!Number.isFinite(parsed)) {
    throw createHttpError(400, `${fieldName} must be a valid number.`);
  }

  if (typeof min === "number" && parsed < min) {
    throw createHttpError(400, `${fieldName} must be at least ${min}.`);
  }

  if (typeof max === "number" && parsed > max) {
    throw createHttpError(400, `${fieldName} must be at most ${max}.`);
  }

  return parsed;
}

module.exports = {
  ensureEmail,
  ensurePassword,
  ensureRequiredString,
  ensureNumber,
};
