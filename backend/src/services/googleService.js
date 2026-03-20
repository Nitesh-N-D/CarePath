const { createHttpError } = require("../utils/httpError");

async function verifyGoogleAccessToken(accessToken) {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);

  if (!response.ok) {
    throw createHttpError(401, "Unable to verify Google account.");
  }

  const profile = await response.json();

  if (!profile.email || !profile.email_verified) {
    throw createHttpError(401, "Google account email is not verified.");
  }

  return {
    email: String(profile.email).toLowerCase(),
    name: profile.name || profile.given_name || "Google User",
    avatar: profile.picture || null,
    googleId: profile.sub,
  };
}

module.exports = { verifyGoogleAccessToken };
