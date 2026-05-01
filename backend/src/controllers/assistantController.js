const asyncHandler = require("../utils/asyncHandler");
const { ensureRequiredString } = require("../utils/validation");
const { fetchProfile, fetchLogs, fetchDiseaseContext } = require("./healthController");
const { buildRiskAssessment } = require("../services/riskEngine");
const { buildWeeklyInsightPack } = require("../services/insightsEngine");
const {
  generateAssistantReply,
  getRecentChatHistory,
  saveMessage,
} = require("../services/assistantService");

async function getAssistantContext(req) {
  const message = ensureRequiredString(req.body.message, "Message", 2);
  const [profile, logs] = await Promise.all([fetchProfile(req.user.id), fetchLogs(req.user.id)]);
  const riskAssessment = buildRiskAssessment(logs);
  const weeklyReport = buildWeeklyInsightPack({ profile, riskAssessment, logs });
  const diseaseContext = await fetchDiseaseContext(profile);

  return { message, profile, logs, riskAssessment, weeklyReport, diseaseContext };
}

const getHistory = asyncHandler(async (req, res) => {
  const history = await getRecentChatHistory(req.user.id);
  res.status(200).json(history);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { message, profile, riskAssessment, weeklyReport, diseaseContext } = await getAssistantContext(req);

  await saveMessage({
    userId: req.user.id,
    role: "user",
    content: message,
  });

  const result = await generateAssistantReply({
    user: req.user,
    message,
    profile,
    riskAssessment,
    weeklyReport,
    diseaseContext,
  });

  await saveMessage({
    userId: req.user.id,
    role: "assistant",
    content: result.reply,
    metadata: {
      source: result.source,
      fallbackUsed: result.fallbackUsed || false,
      error: result.error || null,
      providerErrors: result.providerErrors || [],
    },
  });

  res.status(200).json({
    reply: result.reply,
    source: result.source,
    fallbackUsed: result.fallbackUsed || false,
    error: result.error || null,
    providerErrors: result.providerErrors || [],
  });
});

const streamMessage = asyncHandler(async (req, res) => {
  try {
    const { message, profile, riskAssessment, weeklyReport, diseaseContext } = await getAssistantContext(req);

    await saveMessage({
      userId: req.user.id,
      role: "user",
      content: message,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let assistantReply = "";

    const result = await generateAssistantReply({
      user: req.user,
      message,
      profile,
      riskAssessment,
      weeklyReport,
      diseaseContext,
      onToken(token) {
        assistantReply += token;
        res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
      },
    });

    await saveMessage({
      userId: req.user.id,
      role: "assistant",
      content: assistantReply || result.reply,
      metadata: {
        source: result.source,
        fallbackUsed: result.fallbackUsed || false,
        error: result.error || null,
        providerErrors: result.providerErrors || [],
      },
    });

    res.write(
      `data: ${JSON.stringify({
        type: "done",
        reply: assistantReply || result.reply,
        source: result.source,
        fallbackUsed: result.fallbackUsed || false,
        error: result.error || null,
        providerErrors: result.providerErrors || [],
      })}\n\n`
    );
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      throw error;
    }

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: error?.message || "Streaming assistant unavailable.",
      })}\n\n`
    );
    res.end();
  }
});

module.exports = {
  getHistory,
  sendMessage,
  streamMessage,
};
