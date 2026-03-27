const { pool } = require("../config/db");

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

  const riskSummary = riskAssessment?.latest
    ? `BMI ${riskAssessment.latest.bmi || "n/a"} (${riskAssessment.latest.bmiCategory}), BP ${riskAssessment.latest.bloodPressureCategory}, Sugar ${riskAssessment.latest.sugarCategory}, Risk score ${riskAssessment.riskScore}/100.`
    : "No risk signals yet because health logs are limited.";

  const diseaseSummary = diseaseContext?.length
    ? diseaseContext.map((disease) => `${disease.name}: symptoms ${disease.symptoms.slice(0, 4).join(", ")}.`).join(" ")
    : "No matching disease context found.";

  return [
    "You are CarePath, a healthcare guidance assistant embedded in a SaaS platform.",
    "Never diagnose, never claim certainty, and always recommend urgent care for severe symptoms.",
    `User: ${user.name}. ${profileSummary}.`,
    `Risk summary: ${riskSummary}`,
    `Weekly report: ${weeklyReport.overview}`,
    `Relevant disease context: ${diseaseSummary}`,
    "Answer with practical next steps, preventive advice, and a brief disclaimer.",
  ].join("\n");
}

function buildFallbackReply({ message, riskAssessment, weeklyReport, diseaseContext }) {
  const alerts = riskAssessment.alerts || [];
  const matchedDisease = diseaseContext[0];
  const lowerMessage = String(message || "").toLowerCase();

  if (lowerMessage.includes("blood pressure") || lowerMessage.includes("bp")) {
    return `Your latest blood pressure status is ${riskAssessment.latest?.bloodPressureCategory || "unavailable"}. ${alerts.find((alert) => alert.label.toLowerCase().includes("blood pressure"))?.message || "Keep monitoring morning and evening readings for a clearer trend."} This guidance is educational and does not replace a clinician.`;
  }

  if (lowerMessage.includes("weight") || lowerMessage.includes("bmi")) {
    return `Your BMI is ${riskAssessment.latest?.bmi || "not available"} in the ${riskAssessment.latest?.bmiCategory || "unavailable"} range. ${weeklyReport.personalizedSuggestions[0]} This is general wellness guidance, not a diagnosis.`;
  }

  if (matchedDisease) {
    return `${matchedDisease.name} commonly involves ${matchedDisease.symptoms.slice(0, 3).join(", ")}. Prevention usually focuses on ${matchedDisease.prevention}. If symptoms feel severe, persistent, or new, please book medical care promptly.`;
  }

  return `${weeklyReport.overview} Priority actions: ${weeklyReport.personalizedSuggestions.slice(0, 2).join(" ")} If you have severe symptoms, chest pain, trouble breathing, or confusion, seek urgent medical care.`;
}

async function callOllama({ messages }) {
  const endpoint = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
  const model = process.env.OLLAMA_MODEL || "llama3.1";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.message?.content;
}

async function callOpenAiCompatible({ messages }) {
  const baseUrl = process.env.LLM_API_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!baseUrl || !apiKey) {
    throw new Error("External LLM is not configured.");
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content;
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

async function generateAssistantReply({ user, message, profile, riskAssessment, weeklyReport, diseaseContext }) {
  const recentHistory = await getRecentChatHistory(user.id);
  const systemPrompt = buildSystemPrompt({ user, profile, riskAssessment, weeklyReport, diseaseContext });

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory.slice(-6).map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user", content: message },
  ];

  let reply = "";

  try {
    if ((process.env.AI_PROVIDER || "ollama") === "api") {
      reply = await callOpenAiCompatible({ messages });
    } else {
      reply = await callOllama({ messages });
    }
  } catch (error) {
    reply = buildFallbackReply({ message, riskAssessment, weeklyReport, diseaseContext });
    return { reply, source: "fallback", error: error.message };
  }

  return { reply, source: process.env.AI_PROVIDER || "ollama" };
}

module.exports = {
  generateAssistantReply,
  getRecentChatHistory,
  saveMessage,
};
