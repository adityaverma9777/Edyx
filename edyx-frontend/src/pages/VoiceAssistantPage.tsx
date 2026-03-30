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
  const [connectingMessage, setConnectingMessage] = useState("Please wait, we are connecting you to the agent.");
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
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

  useEffect(() => {
    if (step !== "mode" || sessionId) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function ensureAssistantReady() {
      setBootstrapError("");
      setBootstrapping(true);
      setConnectingMessage("Please wait, we are connecting you to the agent.");

      try {
        const data = await bootstrapAssistant(controller.signal);
        if (cancelled) return;

        setSessionId(data.sessionId);
        setGreeting(data.greeting || greeting);
        const preferred = data.supportedLanguages?.includes("en") ? "en" : data.supportedLanguages?.[0] || "en";
        setLanguage(preferred);
        setBootstrapError("");
      } catch (error: any) {
        if (cancelled) return;

        if (error?.name === "AbortError") {
          return;
        }

        setBootstrapError(error?.message || "Still waking up. Please retry in a moment.");
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    ensureAssistantReady();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [bootstrapAttempt, greeting, sessionId, step]);

  function openMode(mode: "call" | "chat") {
    if (!canOpenInteraction) {
      return;
    }
    setStep(mode);
  }

  return (
    <main className="voice-assistant-page">
      <div className="voice-ambient voice-ambient-a" />
      <div className="voice-ambient voice-ambient-b" />
      <div className="voice-ambient voice-ambient-c" />
      <div className="voice-vignette" />
      <div className="voice-noise" />

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <IntroScreen onComplete={() => setStep((current) => (current === "intro" ? "form" : current))} />
        )}
      </AnimatePresence>

      {step === "form" && <UserForm onCompleted={() => setStep("mode")} />}
      {step === "mode" && (
        <>
          {!canOpenInteraction && (
            <div className="voice-bootstrap-note">
              {bootstrapping ? connectingMessage : "Connection paused. Tap retry to reconnect."}
            </div>
          )}
          {canOpenInteraction && <ModeSelection onSelect={openMode} />}
          {bootstrapError && <div className="voice-bootstrap-error">{bootstrapError}</div>}
          {bootstrapError && !canOpenInteraction && !bootstrapping && (
            <button
              className="voice-bootstrap-retry"
              type="button"
              onClick={() => setBootstrapAttempt((attempt) => attempt + 1)}
            >
              Retry Connection
            </button>
          )}
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
