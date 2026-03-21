import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, VolumeX, Radio, PhoneOff } from "lucide-react";
import SiriWaveform from "./SiriWaveform";
import AudioMeter from "../../lib/AudioMeter";
import { fetchAssistantTtsAudio, resetAssistantSession, respondAssistant, transcribeCallAudio } from "../../lib/voiceAssistantApi";

type CallInterfaceProps = {
  onEnd: () => void;
  onBack: () => void;
  sessionId: string;
  greeting: string;
  language: string;
};

type CallStatus = "idle" | "listening" | "thinking" | "speaking";

type Caption = {
  role: "user" | "assistant";
  text: string;
};

export default function CallInterface({ onEnd, onBack, sessionId, greeting, language }: CallInterfaceProps) {
  const [muted, setMuted] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [status, setStatus] = useState<CallStatus>("listening");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userMeter, setUserMeter] = useState<AudioMeter | null>(null);
  const [assistantMeter, setAssistantMeter] = useState<AudioMeter | null>(null);

  // Core Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const userSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const assistantAudioRef = useRef<HTMLAudioElement | null>(null);
  const assistantSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const assistantAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Timers and Tracking
  const speakingRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoListenTimeoutRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const vadFrameRef = useRef<number | null>(null);
  const ttsEventRef = useRef(0);

  // State refs for VAD loop access
  const statusRef = useRef(status);
  const isThinkingRef = useRef(isThinking);
  const isRecordingRef = useRef(isRecording);
  const autoListenRef = useRef(autoListen);
  const mutedRef = useRef(muted);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { autoListenRef.current = autoListen; }, [autoListen]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Setup Persistent Microphone and VAD
  useEffect(() => {
    let unmounted = false;

    async function initMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        if (unmounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStreamRef.current = stream;

        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (audioContextRef.current.state === "suspended") await audioContextRef.current.resume();

        const context = audioContextRef.current;
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);

        userSourceRef.current = source;
        userAnalyserRef.current = analyser;

        const meter = new AudioMeter(analyser);
        setUserMeter(meter);

        // VAD Loop
        let vadConseqFrames = 0;
        const checkVAD = () => {
          if (
            !mutedRef.current && 
            statusRef.current === "speaking" && 
            autoListenRef.current && 
            !isRecordingRef.current
          ) {
            const vol = meter.getVolume();
            if (vol > 0.08) { // Volume threshold
              vadConseqFrames++;
              if (vadConseqFrames > 12) { // ~200ms of sustained audio spike
                interruptAndListen();
                vadConseqFrames = 0;
              }
            } else {
              vadConseqFrames = 0;
            }
          } else {
            vadConseqFrames = 0;
          }
          vadFrameRef.current = requestAnimationFrame(checkVAD);
        };
        vadFrameRef.current = requestAnimationFrame(checkVAD);

      } catch (err) {
        setErrorMessage("Microphone permission failed. You can retry with Speak Now.");
      }
    }

    initMic();

    return () => {
      unmounted = true;
      if (vadFrameRef.current) cancelAnimationFrame(vadFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (autoListenTimeoutRef.current) window.clearTimeout(autoListenTimeoutRef.current);
      if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
      
      setUserMeter(null);
      setAssistantMeter(null);
      
      userSourceRef.current?.disconnect();
      userAnalyserRef.current?.disconnect();
      assistantSourceRef.current?.disconnect();
      assistantAnalyserRef.current?.disconnect();
      
      if (assistantAudioRef.current) {
        assistantAudioRef.current.pause();
        assistantAudioRef.current.src = "";
      }
      audioContextRef.current?.close().catch(() => undefined);
      window.speechSynthesis.cancel();
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!muted) return;
    window.speechSynthesis.cancel();
    if (assistantAudioRef.current) {
      assistantAudioRef.current.pause();
      assistantAudioRef.current.src = "";
    }
    assistantSourceRef.current?.disconnect();
    assistantAnalyserRef.current?.disconnect();
    setAssistantMeter(null);
    if (!isRecording && !isThinking) {
      setStatus("idle");
    }
  }, [muted, isRecording, isThinking]);

  useEffect(() => {
    setCaptions([{ role: "assistant", text: greeting }]);
    if (!muted) {
      speakText(greeting, () => {
        if (autoListenRef.current) startRecording();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting]);

  const statusLabel = useMemo(() => {
    if (isThinking) return "Processing";
    if (isRecording) return "Listening";
    if (status === "speaking") return "Speaking";
    if (status === "listening") return "Listening";
    return "Ready";
  }, [status, isRecording, isThinking]);

  function scheduleAutoListen() {
    if (!autoListenRef.current || mutedRef.current || isRecordingRef.current) return;
    if (autoListenTimeoutRef.current) window.clearTimeout(autoListenTimeoutRef.current);
    autoListenTimeoutRef.current = window.setTimeout(() => {
      startRecording();
    }, 450);
  }

  function stopAssistantPlayback() {
    window.speechSynthesis.cancel();
    if (assistantAudioRef.current) {
      assistantAudioRef.current.pause();
      assistantAudioRef.current.src = "";
    }
    assistantSourceRef.current?.disconnect();
    assistantAnalyserRef.current?.disconnect();
    setAssistantMeter(null);
  }

  const interruptAndListen = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    }
    
    stopAssistantPlayback();
    setIsThinking(false);
    
    if (autoListenTimeoutRef.current) window.clearTimeout(autoListenTimeoutRef.current);
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    
    startRecording();
  }, []);

  async function speakWithAnalyzedAudio(text: string, onDone?: () => void): Promise<boolean> {
    try {
      const blob = await fetchAssistantTtsAudio({ text, language }, abortControllerRef.current?.signal);
      if (!blob.size || mutedRef.current) return false;

      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === "suspended") await audioContextRef.current.resume();

      stopAssistantPlayback();

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.preload = "auto";

      const context = audioContextRef.current;
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(context.destination);

      assistantAudioRef.current = audio;
      assistantSourceRef.current = source;
      assistantAnalyserRef.current = analyser;
      setAssistantMeter(new AudioMeter(analyser));

      const finish = () => {
        setAssistantMeter(null);
        source.disconnect();
        analyser.disconnect();
        URL.revokeObjectURL(url);
        // Only trigger done and set listen mode if we weren't interrupted out of speaking
        if (statusRef.current === "speaking") {
          setStatus("listening");
          onDone?.();
        }
      };

      audio.onended = finish;
      audio.onerror = finish;
      setStatus("speaking");
      await audio.play();
      return true;
    } catch (e: any) {
      if (e.name === "AbortError") return true; 
      return false;
    }
  }

  function speakText(text: string, onDone?: () => void) {
    if (mutedRef.current) {
      onDone?.();
      return;
    }

    void (async () => {
      const usedRealAudio = await speakWithAnalyzedAudio(text, onDone);
      if (usedRealAudio) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setStatus("speaking");
        ttsEventRef.current += 1;
      };
      utterance.onboundary = () => {
        ttsEventRef.current += 1;
      };
      utterance.onend = () => {
        if (statusRef.current === "speaking") {
          setStatus("listening");
          onDone?.();
        }
      };
      speakingRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    })();
  }

  function fallbackBrowserSpeechRecognition(): Promise<string> {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        resolve("");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => resolve(event?.results?.[0]?.[0]?.transcript || "");
      recognition.onerror = () => resolve("");
      recognition.onend = () => resolve("");
      recognition.start();
    });
  }

  async function processUserText(text: string) {
    const cleanText = text.trim();
    if (!cleanText) {
      setErrorMessage("I could not detect speech. Try Speak Now again.");
      scheduleAutoListen();
      return;
    }

    setErrorMessage("");
    setCaptions((prev) => [...prev, { role: "user", text: cleanText }]);
    setIsThinking(true);
    setStatus("thinking");

    abortControllerRef.current = new AbortController();

    try {
      const response = await respondAssistant(
        { sessionId, userText: cleanText, language, mode: "call" },
        abortControllerRef.current.signal
      );
      
      const reply = response.reply || "I can help with that. Could you clarify your request?";
      
      // If we were interrupted while thinking, discard this response
      if (abortControllerRef.current.signal.aborted) return;
      
      setCaptions((prev) => [...prev, { role: "assistant", text: reply }]);
      speakText(reply, () => {
        setIsThinking(false);
        scheduleAutoListen();
      });
    } catch (e: any) {
      if (e.name === "AbortError") return;

      const fallback = "Network issue occurred, but you can continue by pressing Speak Now again.";
      setCaptions((prev) => [...prev, { role: "assistant", text: fallback }]);
      setErrorMessage("Network error. Please try again.");
      setIsThinking(false);
      setStatus("listening");
      scheduleAutoListen();
    }
  }

  async function startRecording() {
    if (isRecordingRef.current || mutedRef.current) return;
    if (!activeStreamRef.current) {
      setErrorMessage("Microphone is not active.");
      return;
    }

    try {
      if (!abortControllerRef.current) {
         abortControllerRef.current = new AbortController();
      }

      const recorder = new MediaRecorder(activeStreamRef.current, { mimeType: "audio/webm" });
      chunksRef.current = [];
      setErrorMessage("");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
        setIsRecording(false);
        
        // If they hit interrupt mid-recording, or we transitioned
        if (statusRef.current === "listening") {
            setStatus("idle");
        }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!blob.size) return;

        let text = "";
        try {
          // If we manually interrupted, create a fresh AbortController so it doesn't fail transcription instantly
          if (abortControllerRef.current?.signal.aborted) {
              abortControllerRef.current = new AbortController();
          }
          const transcript = await transcribeCallAudio(blob, abortControllerRef.current?.signal);
          text = transcript?.text?.trim() || "";
        } catch (e: any) {
          if (e.name === "AbortError") return;
          text = "";
        }

        if (!text) text = await fallbackBrowserSpeechRecognition();

        if (statusRef.current !== "speaking") {
             await processUserText(text);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus("listening");

      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 5600);
    } catch {
      setErrorMessage("Microphone permission failed. You can retry with Speak Now.");
      setStatus("idle");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  }

  function handleMicClick() {
    if (status === "speaking" || isThinking) {
      interruptAndListen();
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function handleEndCall() {
    resetAssistantSession(sessionId).catch(() => undefined);
    onEnd();
  }

  return (
    <motion.section
      className="voice-call-fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="voice-call-topbar"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="voice-top-back" onClick={onBack}>Back</button>
        <div className="voice-call-title-block">
          <h2>Edyx Voice Assistant</h2>
          <p>{statusLabel}</p>
        </div>
        <div className="voice-live-dot" />
      </motion.div>

      <div className="voice-call-core" onMouseDown={stopRecording} onTouchEnd={stopRecording}>
        <SiriWaveform
          userMeter={userMeter}
          assistantMeter={assistantMeter}
          status={status}
          ttsEventRef={ttsEventRef}
          muted={muted}
        />
      </div>

      {errorMessage && (
        <motion.div
          className="voice-call-error"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {errorMessage}
        </motion.div>
      )}

      <div className="voice-caption-stack">
        {captions.slice(-4).map((caption, index) => (
          <motion.div
            key={`${caption.role}-${index}-${caption.text.slice(0, 20)}`}
            className={`voice-caption voice-caption-${caption.role}`}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {caption.text}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="voice-call-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          className={`voice-ctrl-btn ${isRecording ? "active" : ""}`}
          onClick={handleMicClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          title={isRecording ? "Stop Recording" : isThinking || status === "speaking" ? "Interrupt" : "Speak Now"}
        >
          <Mic size={20} />
        </motion.button>

        <motion.button
          className={`voice-ctrl-btn ${autoListen ? "active" : ""}`}
          onClick={() => setAutoListen((prev) => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          title={`Auto Listen: ${autoListen ? "On" : "Off"}`}
        >
          <Radio size={20} />
        </motion.button>

        <motion.button
          className="voice-ctrl-btn"
          onClick={() => setMuted((prev) => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>

        <motion.button
          className="voice-ctrl-btn danger"
          onClick={handleEndCall}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          title="End Call"
        >
          <PhoneOff size={20} />
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
