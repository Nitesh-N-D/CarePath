import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import API from "../services/api";
import type { AssistantMessage } from "../types/health";

function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get<AssistantMessage[]>("/assistant/history");
        setMessages(response.data);
      } catch (requestError) {
        setError("Unable to load your AI conversation right now.");
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setMessages((current) => [...current, { role: "user", content }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await API.post<{ reply: string }>("/assistant/chat", { message: content });
      setMessages((current) => [...current, { role: "assistant", content: response.data.reply }]);
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Assistant unavailable." : "Assistant unavailable.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="section-heading">AI Assistant</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Ask CarePath about your health patterns and next steps.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">This assistant reads your CarePath profile, risk score, and recent entries before responding, so the conversation feels specific rather than generic.</p>
      </section>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <div className="text-sm text-[var(--color-text-soft)]">Live health guidance</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">Conversation</div>
        </div>
        <div className="h-[480px] space-y-4 overflow-y-auto px-6 py-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-20" />)
          ) : messages.length ? (
            messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant" ? "bg-white text-slate-700 shadow-sm" : "ml-auto bg-slate-900 text-white"
                }`}
              >
                {message.content}
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-soft)]">
              Start by asking about BMI, blood pressure, medication routines, preventive steps, or whether your recent health log suggests a trend.
            </div>
          )}

          {sending ? <LoadingSkeleton className="h-16 w-3/4" /> : null}
        </div>

        <form onSubmit={sendMessage} className="border-t border-[var(--color-border)] px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask CarePath about a symptom, trend, or recommendation"
              className="field-shell min-w-0 flex-1 rounded-2xl px-4 py-3 outline-none"
            />
            <GradientButton type="submit" disabled={sending}>Send</GradientButton>
          </div>
          {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
        </form>
      </GlassCard>
    </div>
  );
}

export default AssistantPage;
