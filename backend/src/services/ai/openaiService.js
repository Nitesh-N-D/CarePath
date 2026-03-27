function createOpenAiError(message, status = 502) {
  const error = new Error(message);
  error.status = status;
  error.provider = "openai";
  return error;
}

async function generateOpenAiResponse({ messages, onToken }) {
  const baseUrl = process.env.LLM_API_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const streaming = typeof onToken === "function";

  if (!apiKey) {
    throw createOpenAiError("OpenAI is not configured. Add LLM_API_KEY to use the cloud provider.", 500);
  }

  let response;

  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        stream: streaming,
      }),
    });
  } catch (_error) {
    throw createOpenAiError("OpenAI is unreachable right now. Check network access or your API configuration.", 503);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw createOpenAiError("OpenAI authentication failed. Check LLM_API_KEY.", 401);
    }
    throw createOpenAiError(`OpenAI request failed with status ${response.status}.`, response.status);
  }

  if (!streaming) {
    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content || "";
  }

  if (!response.body) {
    throw createOpenAiError("OpenAI streaming response was empty.", 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const lines = chunk
        .split("\n")
        .map((entry) => entry.trim())
        .filter((entry) => entry.startsWith("data:"));

      for (const line of lines) {
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          return finalText;
        }

        const payload = JSON.parse(data);
        const token = payload?.choices?.[0]?.delta?.content || "";
        if (token) {
          finalText += token;
          onToken(token);
        }
      }
    }
  }

  return finalText;
}

module.exports = { generateOpenAiResponse };
