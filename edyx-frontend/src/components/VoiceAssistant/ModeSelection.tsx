import { motion } from "framer-motion";
import { Mic, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ModeSelectionProps = {
  onSelect: (mode: "call" | "chat") => void;
};

const modes = [
  {
    id: "call" as const,
    icon: Mic,
    title: "Call the Assistant",
    description: "Real-time voice conversation with live captions.",
  },
  {
    id: "chat" as const,
    icon: MessageSquare,
    title: "Chat with Assistant",
    description: "Clean and formal text chat experience.",
  },
];

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
  const navigate = useNavigate();
  return (
    <>
      <button 
        type="button" 
        className="voice-top-back voice-global-back" 
        onClick={() => navigate('/')} 
      >
        Back
      </button>

      <motion.div
      className="voice-mode-wrap"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2>How would you like to continue?</h2>
      <p>Choose your preferred interaction style.</p>

      <div className="voice-mode-grid">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              className="voice-mode-card"
              onClick={() => onSelect(mode.id)}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.3 + index * 0.2,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 22 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="voice-mode-icon">
                <Icon size={22} strokeWidth={2} />
              </div>
              <h3>{mode.title}</h3>
              <span>{mode.description}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
    </>
  );
}
