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

const getHistory = asyncHandler(async (req, res) => {
  const history = await getRecentChatHistory(req.user.id);
  res.status(200).json(history);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = ensureRequiredString(req.body.message, "Message", 2);

  const [profile, logs] = await Promise.all([fetchProfile(req.user.id), fetchLogs(req.user.id)]);
  const riskAssessment = buildRiskAssessment(logs);
  const weeklyReport = buildWeeklyInsightPack({ profile, riskAssessment, logs });
  const diseaseContext = await fetchDiseaseContext(profile);

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
    metadata: { source: result.source, error: result.error || null },
  });

  res.status(200).json({
    reply: result.reply,
    source: result.source,
    error: result.error || null,
  });
});

module.exports = {
  getHistory,
  sendMessage,
};
