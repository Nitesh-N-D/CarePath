const { pool } = require("../config/db");
const { generateAIResponse } = require("./ai/aiProvider");

function buildSystemPrompt({ user, profile, riskAssessment, weeklyReport, diseaseContext }) {
  const profileSummary = profile
    ? [
        profile.age ? `Age: ${profile.age}` : null,
        profile.gender ? `Gender: ${profile.gender}` : null,
        profile.location ? `Location: ${profile.location}` : null,
        profile.primary_goal ? `Goal: ${profile.primary_goal}` : null,
        profile.chronic_conditions?.length ? `Conditions: ${profile.chronic_conditions.join(", ")}` : null,
        profile.medications?.length ? `Medications: ${profile.medications.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ")
    : "No profile on file";

  const latestRisk = riskAssessment?.latest;
  const contextPrompt = [
    "You are CarePath, a medically cautious healthcare guidance assistant embedded in a SaaS platform.",
    "Do not diagnose, do not claim certainty, and encourage professional care for urgent symptoms.",
    "Keep advice practical, concise, and safety-oriented.",
    `User: ${user.name}. ${profileSummary}.`,
    "User health data:",
    `BMI: ${latestRisk?.bmi || "n/a"} (${latestRisk?.bmiCategory || "Unavailable"})`,
    `Blood pressure: ${latestRisk?.bloodPressureCategory || "Unavailable"}`,
    `Blood sugar: ${latestRisk?.sugarCategory || "Unavailable"}`,
    `Risk score: ${riskAssessment?.riskScore || 0}/100`,
    `Weekly report: ${weeklyReport.overview}`,
    `Disease context: ${
      diseaseContext?.length
        ? diseaseContext
            .map((disease) => `${disease.name} with symptoms ${disease.symptoms.slice(0, 4).join(", ")}`)
            .join("; ")
        : "No matching disease context."
    }`,
    "Give medically safe guidance, practical next steps, and a short disclaimer.",
  ];

  return contextPrompt.join("\n");
}

function buildFallbackReply({ message, riskAssessment, weeklyReport, diseaseContext }) {
  const alerts = riskAssessment.alerts || [];
  const matchedDisease = diseaseContext[0];
  const lowerMessage = String(message || "").toLowerCase();

  if (lowerMessage.includes("blood pressure") || lowerMessage.includes("bp")) {
    return `Your latest blood pressure status is ${riskAssessment.latest?.bloodPressureCategory || "unavailable"}. ${
      alerts.find((alert) => alert.label.toLowerCase().includes("blood pressure"))?.message ||
      "Keep monitoring morning and evening readings for a clearer trend."
    } This guidance is educational and does not replace a clinician.`;
  }

  if (lowerMessage.includes("weight") || lowerMessage.includes("bmi")) {
    return `Your BMI is ${riskAssessment.latest?.bmi || "not available"} in the ${
      riskAssessment.latest?.bmiCategory || "unavailable"
    } range. ${weeklyReport.personalizedSuggestions[0]} This is general wellness guidance, not a diagnosis.`;
  }

  if (matchedDisease) {
    return `${matchedDisease.name} commonly involves ${matchedDisease.symptoms.slice(0, 3).join(", ")}. Prevention usually focuses on ${
      matchedDisease.prevention
    }. If symptoms feel severe, persistent, or new, please book medical care promptly.`;
  }

  return `${weeklyReport.overview} Priority actions: ${weeklyReport.personalizedSuggestions
    .slice(0, 2)
    .join(" ")} If you have severe symptoms, chest pain, trouble breathing, or confusion, seek urgent medical care.`;
}

async function saveMessage({ userId, role, content, metadata = {} }) {
  await pool.query(
    `
      INSERT INTO ai_chat_messages (user_id, role, content, metadata)
      VALUES ($1, $2, $3, $4)
    `,
    [userId, role, content, metadata]
  );
}

async function getRecentChatHistory(userId) {
  const result = await pool.query(
    `
      SELECT id, role, content, metadata, created_at
      FROM ai_chat_messages
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [userId]
  );

  return result.rows.reverse();
}

async function buildAssistantMessages({ user, message, profile, riskAssessment, weeklyReport, diseaseContext }) {
  const recentHistory = await getRecentChatHistory(user.id);
  const systemPrompt = buildSystemPrompt({ user, profile, riskAssessment, weeklyReport, diseaseContext });

  return [
    { role: "system", content: systemPrompt },
    ...recentHistory.slice(-6).map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user", content: `User question:\n${message}` },
  ];
}

async function generateAssistantReply({
  user,
  message,
  profile,
  riskAssessment,
  weeklyReport,
  diseaseContext,
  onToken,
}) {
  const messages = await buildAssistantMessages({
    user,
    message,
    profile,
    riskAssessment,
    weeklyReport,
    diseaseContext,
  });

  try {
    const result = await generateAIResponse({ messages, onToken });
    return {
      reply: result.reply,
      source: result.provider,
      fallbackUsed: result.fallbackUsed,
      providerErrors: result.errors,
    };
  } catch (error) {
    const reply = buildFallbackReply({ message, riskAssessment, weeklyReport, diseaseContext });
    if (typeof onToken === "function") {
      onToken(reply);
    }
    return {
      reply,
      source: "fallback",
      fallbackUsed: true,
      error: error.message,
      providerErrors: error.details || [],
    };
  }
}

module.exports = {
  generateAssistantReply,
  getRecentChatHistory,
  saveMessage,
};
