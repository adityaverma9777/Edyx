import { motion } from "framer-motion";
import { useEffect } from "react";

type IntroScreenProps = {
  onComplete: () => void;
};

const lines = [
  "Hi, I'm your Edyx assistant.",
  "I can help you explore APIs, answer questions, or guide you.",
  "Let's get you started.",
];

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete();
    }, 4400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="voice-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(16px)", scale: 0.98, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div className="voice-intro-aurora" />
      <div className="voice-gradient-orb voice-gradient-orb-a" />
      <div className="voice-gradient-orb voice-gradient-orb-b" />
      <div className="voice-gradient-orb voice-gradient-orb-c" />

      <div className="voice-intro-content">
        {lines.map((line, index) => (
          <motion.p
            key={line}
            className="voice-intro-line"
            initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.5 + index * 1.1,
              duration: 1.0,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.p>
        ))}

        <motion.div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1px solid rgba(0, 113, 227, 0.1)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 2.5, opacity: [0, 0.3, 0] }}
          transition={{
            delay: 1.2,
            duration: 3.0,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        />
      </div>
    </motion.div>
  );
}
