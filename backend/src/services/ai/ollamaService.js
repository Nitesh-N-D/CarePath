function createOllamaError(message, status = 502) {
  const error = new Error(message);
  error.status = status;
  error.provider = "ollama";
  return error;
}

async function generateOllamaResponse({ messages, onToken }) {
  const endpoint = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const streaming = typeof onToken === "function";

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: streaming,
        messages,
      }),
    });
  } catch (_error) {
    throw createOllamaError("Ollama is unreachable. Start Ollama locally or switch to OpenAI.", 503);
  }

  if (!response.ok) {
    throw createOllamaError(`Ollama request failed with status ${response.status}.`, response.status);
  }

  if (!streaming) {
    const payload = await response.json();
    return payload?.message?.content || "";
  }

  if (!response.body) {
    throw createOllamaError("Ollama streaming response was empty.", 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines.map((entry) => entry.trim()).filter(Boolean)) {
      const payload = JSON.parse(line);
      const token = payload?.message?.content || "";
      if (token) {
        finalText += token;
        onToken(token);
      }

      if (payload?.done) {
        return finalText;
      }
    }
  }

  if (buffer.trim()) {
    const payload = JSON.parse(buffer.trim());
    const token = payload?.message?.content || "";
    if (token) {
      finalText += token;
      onToken(token);
    }
  }

  return finalText;
}

module.exports = { generateOllamaResponse };
