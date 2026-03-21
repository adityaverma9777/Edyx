import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { BACKEND_URL, bootstrapAssistant, respondAssistant } from "../../lib/voiceAssistantApi";
import type { AssistantMessage } from "../../lib/voiceAssistantApi";
import type { VoiceApiError } from "../../lib/voiceAssistantApi";

type ChatInterfaceProps = {
  onBack: () => void;
  sessionId: string;
  language: string;
};

export default function ChatInterface({ onBack, sessionId, language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSessionIdRef = useRef(sessionId);

  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed } as AssistantMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await respondAssistant({ sessionId: activeSessionIdRef.current, userText: trimmed, language, mode: "chat" });
      setMessages((prev) => [...prev, { role: "assistant", content: data?.reply || "I am here to help." }]);
    } catch (error: any) {
      const apiError = error as VoiceApiError;

      if (apiError?.code === "SESSION_NOT_FOUND") {
        try {
          const boot = await bootstrapAssistant();
          activeSessionIdRef.current = boot.sessionId;
          const retry = await respondAssistant({ sessionId: activeSessionIdRef.current, userText: trimmed, language, mode: "chat" });
          setMessages((prev) => [...prev, { role: "assistant", content: retry?.reply || "I am here to help." }]);
          return;
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Your assistant session expired and auto-reconnect failed. Please go back and start chat mode again.",
            },
          ]);
          return;
        }
      }

      const details = error?.message || "Request failed";
      const isNetwork = /Failed to fetch|NetworkError|Load failed/i.test(details);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isNetwork
            ? `I could not reach the assistant backend (${BACKEND_URL}). Details: ${details}`
            : `The assistant backend returned an error: ${details}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.section
      className="voice-chat-wrap"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="voice-chat-header">
        <h3>Edyx Assistant Chat</h3>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Back
        </motion.button>
      </div>

      <div className="voice-chat-messages" ref={scrollRef}>
        {messages.length === 0 && <p className="voice-chat-empty">Ask a question about APIs, docs, or guidance.</p>}
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            className={`voice-bubble voice-bubble-${message.role}`}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.4,
              delay: 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {message.content}
          </motion.div>
        ))}
        {loading && (
          <div className="voice-typing-indicator">
            <span className="voice-typing-dot" />
            <span className="voice-typing-dot" />
            <span className="voice-typing-dot" />
          </div>
        )}
      </div>

      <form className="voice-chat-input-wrap" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message"
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Send size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Send
        </motion.button>
      </form>
    </motion.section>
  );
}
