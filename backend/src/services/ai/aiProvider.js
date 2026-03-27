const { generateOllamaResponse } = require("./ollamaService");
const { generateOpenAiResponse } = require("./openaiService");

function getProviderSequence() {
  const preferred = (process.env.AI_PROVIDER || "ollama").toLowerCase();

  if (preferred === "openai") {
    return ["openai", "ollama"];
  }

  if (preferred === "ollama") {
    return ["ollama", "openai"];
  }

  throw new Error("Invalid AI provider. Use AI_PROVIDER=ollama or AI_PROVIDER=openai.");
}

function isProviderConfigured(provider) {
  if (provider === "openai") {
    return Boolean(process.env.LLM_API_KEY);
  }

  return true;
}

async function runProvider(provider, payload) {
  if (provider === "ollama") {
    return generateOllamaResponse(payload);
  }

  if (provider === "openai") {
    return generateOpenAiResponse(payload);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

async function generateAIResponse({ messages, onToken }) {
  const providers = getProviderSequence().filter(isProviderConfigured);
  const errors = [];

  for (const provider of providers) {
    try {
      const reply = await runProvider(provider, { messages, onToken });
      return {
        reply,
        provider,
        fallbackUsed: provider !== providers[0],
        errors,
      };
    } catch (error) {
      errors.push({
        provider,
        message: error.message,
      });
    }
  }

  const finalError = new Error(
    errors[0]?.message || "No configured AI provider is currently available."
  );
  finalError.status = 503;
  finalError.details = errors;
  throw finalError;
}

module.exports = { generateAIResponse };
