import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, Sparkles } from "lucide-react";

const MODELS = [
  { id: "convo", name: "Convo 2.0", desc: "Complex Reasoning", color: "#dd7a83" },
  { id: "balanced", name: "Balanced", desc: "General Purpose", color: "#A855F7" },
  { id: "fast", name: "Fast", desc: "Instant Replies", color: "#3B82F6" },
  { id: "physics", name: "Physics", desc: "Scientific Q&A", color: "#06b6d4" },
];

const INITIAL_MESSAGES = [
  { role: "assistant", content: "Hello! I'm Edyx. Pick a model above and ask me anything." },
];

const ChatDemo: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {

      // Build context from previous messages
      const chatHistory = [...messages, userMsg];

      const response = await fetch("https://edyx-backend.onrender.com/chat/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      let assistantContent = "Error parsing response.";

      // Known formats
      if (data.text) {
        // "text" field from user provided example
        assistantContent = data.text;
      } else if (data.choices && data.choices[0]?.message?.content) {
        // OpenAI format
        assistantContent = data.choices[0].message.content;
      } else if (data.generated_text) {
        // HF Text generation format
        assistantContent = data.generated_text;
      } else {
        // Fallback: Dump string if unknown
        assistantContent = typeof data === 'string' ? data : JSON.stringify(data);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the model." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-demo-container">
      <div className="chat-interface glass-panel">
        {/* Header / Model Selector */}
        <div className="chat-header">
          <div className="model-selector" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="current-model">
              <Sparkles size={16} color={selectedModel.color} />
              <span className="model-name">{selectedModel.name}</span>
              <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="model-dropdown"
                >
                  {MODELS.map((model) => (
                    <div
                      key={model.id}
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(model);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="dot" style={{ background: model.color }} />
                      <div className="item-info">
                        <span className="item-name">{model.name}</span>
                        <span className="item-desc">{model.desc}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="header-hint">Test drive our full model suite</span>
        </div>

        {/* Chat Area */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-bubble ${msg.role}`}
            >
              {msg.content}
            </motion.div>
          ))}
          {isTyping && (
            <div className="message-bubble assistant typing">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <input
            className="input-fake"
            placeholder="Ask anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend} disabled={isTyping}>
            <Send size={18} color="#fff" />
          </button>
        </div>
      </div>

      <style>{`
        .chat-demo-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          perspective: 1000px;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          border-radius: 28px;
          overflow: hidden;
          height: 440px;
          display: flex;
          flex-direction: column;
          transform: translateZ(0);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: transform 0.4s ease;
          will-change: transform; /* Performance Hint */
        }

        .chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .header-hint {
            font-size: 0.85rem;
            color: var(--color-text-tertiary);
            font-weight: 500;
            letter-spacing: -0.01em;
        }

        .model-selector {
          cursor: pointer;
          position: relative;
        }

        .current-model {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-text-primary);
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .current-model:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.1);
        }

        .dropdown-arrow {
          transition: transform 0.2s;
          color: var(--color-text-secondary);
        }
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .model-dropdown {
          position: absolute;
          top: 130%;
          left: 0;
          width: 240px;
          background: white;
          border-radius: 20px;
          padding: 8px;
          box-shadow: 
            0 20px 40px -10px rgba(0,0,0,0.1),
            0 0 0 1px rgba(0,0,0,0.05);
          z-index: 20;
          transform-origin: top left;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: #f5f5f7;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          text-align: left;
          gap: 2px;
        }
        .item-name { font-weight: 600; font-size: 0.9rem; color: #1d1d1f; }
        .item-desc { font-size: 0.75rem; color: #86868b; }

        .chat-messages {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .message-bubble {
          max-width: 85%;
          padding: 14px 20px;
          border-radius: 22px;
          font-size: 1rem;
          line-height: 1.5;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .message-bubble.user {
          background: #007AFF;
          color: white;
          border-bottom-right-radius: 6px;
          align-self: flex-end;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
        }

        .message-bubble.assistant {
          background: white;
          color: #1d1d1f;
          border-bottom-left-radius: 6px;
          align-self: flex-start;
          white-space: pre-line;
          border: 1px solid rgba(0,0,0,0.05);
        }

        /* Typing Dots Animation */
        .typing { display: flex; gap: 5px; width: fit-content; padding: 18px 20px; align-items: center; }
        .typing .dot {
          width: 6px; height: 6px; background: #8e8e93; border: none; box-shadow: none;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing .dot:nth-child(1) { animation-delay: -0.32s; }
        .typing .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce { 
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 
          40% { transform: scale(1); opacity: 1; } 
        }

        .chat-input-area {
          padding: 20px 24px;
          display: flex;
          gap: 16px;
          align-items: center;
          background: rgba(255,255,255,0.4);
        }

        .input-fake {
          flex: 1;
          height: 48px;
          border-radius: 24px;
          background: white;
          display: flex;
          align-items: center;
          padding-left: 20px;
          color: #86868b;
          font-size: 1rem;
          box-shadow: 
            0 2px 6px rgba(0,0,0,0.03),
            0 0 0 1px rgba(0,0,0,0.05);
          transition: box-shadow 0.2s;
        }
        .input-fake:hover {
            box-shadow: 
            0 4px 12px rgba(0,0,0,0.06),
            0 0 0 1px rgba(0,0,0,0.08);
        }

        .send-btn {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: #1d1d1f;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s, background 0.2s;
          cursor: pointer;
        }
        .send-btn:hover { 
            transform: scale(1.05); 
            background: black;
        }

        @media (max-width: 768px) {
          .glass-panel {
            height: auto;
            min-height: 380px;
            border-radius: 20px;
          }
          .chat-header {
            padding: 16px;
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          .header-hint {
            display: none;
          }
          .chat-messages {
            padding: 16px;
            gap: 14px;
          }
          .message-bubble {
            max-width: 90%;
            padding: 12px 16px;
            font-size: 0.95rem;
          }
          .chat-input-area {
            padding: 16px;
            gap: 12px;
          }
          .input-fake {
            height: 44px;
            font-size: 0.95rem;
          }
          .send-btn {
            width: 44px;
            height: 44px;
          }
          .model-dropdown {
            width: 200px;
          }
        }

      `}</style>
    </div>
  );
};

export default ChatDemo;
