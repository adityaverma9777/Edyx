import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import IntroScreen from "../components/VoiceAssistant/IntroScreen";
import UserForm from "../components/VoiceAssistant/UserForm";
import ModeSelection from "../components/VoiceAssistant/ModeSelection";
import CallInterface from "../components/VoiceAssistant/CallInterface";
import ChatInterface from "../components/VoiceAssistant/ChatInterface";
import { bootstrapAssistant } from "../lib/voiceAssistantApi";
import "./VoiceAssistantPage.css";

type FlowStep = "intro" | "form" | "mode" | "call" | "chat";

export default function VoiceAssistantPage() {
  const [step, setStep] = useState<FlowStep>("intro");
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [language, setLanguage] = useState("en");
  const [greeting, setGreeting] = useState("Hi, I am your Edyx assistant. How can I help you today?");

  const canOpenInteraction = useMemo(() => Boolean(sessionId), [sessionId]);

  useEffect(() => {
    // Lock body scrolling globally to prevent mobile elastic bounce and scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.touchAction = "none"; // Disable all browser gestures globally

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
    };
  }, []);

  async function openMode(mode: "call" | "chat") {
    setBootstrapError("");
    setBootstrapping(true);
    try {
      const data = await bootstrapAssistant();
      setSessionId(data.sessionId);
      setGreeting(data.greeting || greeting);
      const preferred = data.supportedLanguages?.includes("en") ? "en" : data.supportedLanguages?.[0] || "en";
      setLanguage(preferred);
      setStep(mode);
    } catch (error: any) {
      setBootstrapError(error?.message || "Could not start assistant session.");
    } finally {
      setBootstrapping(false);
    }
  }

  return (
    <main className="voice-assistant-page">
      <div className="voice-ambient voice-ambient-a" />
      <div className="voice-ambient voice-ambient-b" />
      <div className="voice-ambient voice-ambient-c" />
      <div className="voice-vignette" />
      <div className="voice-noise" />

      <AnimatePresence mode="wait">
        {step === "intro" && <IntroScreen onComplete={() => setStep("form")} />}
      </AnimatePresence>

      {step === "form" && <UserForm onCompleted={() => setStep("mode")} />}
      {step === "mode" && (
        <>
          <ModeSelection onSelect={openMode} />
          {bootstrapping && <div className="voice-bootstrap-note">Starting assistant session...</div>}
          {bootstrapError && <div className="voice-bootstrap-error">{bootstrapError}</div>}
        </>
      )}
      {step === "call" && canOpenInteraction && (
        <CallInterface
          onBack={() => setStep("mode")}
          onEnd={() => setStep("mode")}
          sessionId={sessionId}
          greeting={greeting}
          language={language}
        />
      )}
      {step === "chat" && canOpenInteraction && (
        <ChatInterface onBack={() => setStep("mode")} sessionId={sessionId} language={language} />
      )}
    </main>
  );
}
