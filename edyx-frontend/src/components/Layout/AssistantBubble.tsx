import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./AssistantBubble.css";

export default function AssistantBubble() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on the assistant page itself
  if (location.pathname === "/assistant") {
    return null;
  }

  // Keyboard detection to hide bubble on mobile when typing
  useEffect(() => {
    const minHeightDiff = 150;
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      if (window.innerHeight < initialHeight - minHeightDiff) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        window.innerWidth <= 768
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      if (window.innerWidth <= 768) {
        setIsKeyboardOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // 15s interval for greeting pop-out
  useEffect(() => {
    // Initial pop-out after a short delay
    const initialTimer = setTimeout(() => setShowGreeting(true), 2000);
    const initialCloseTimer = setTimeout(() => setShowGreeting(false), 8000);

    // Repeated pop-out every 15 seconds
    const interval = setInterval(() => {
      setShowGreeting(true);
      setTimeout(() => setShowGreeting(false), 6000);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(initialCloseTimer);
      clearInterval(interval);
    };
  }, []);

  if (isKeyboardOpen) return null;

  return (
    <div
      className="assistant-bubble-container"
      onClick={() => navigate("/assistant")}
      title="Open Edyx Assistant"
    >
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            className="assistant-bubble-greeting"
            initial={{ opacity: 0, width: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, width: "auto", scale: 1, x: 0 }}
            exit={{ opacity: 0, width: 0, scale: 0.8, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="assistant-bubble-text">Hi, I'm here to help you</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="assistant-bubble-avatar"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src="/animoji-panda.gif" alt="Edyx Assistant" />
      </motion.div>
    </div>
  );
}
