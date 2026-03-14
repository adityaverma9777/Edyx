import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Headphones, FileText, Clock, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import Layout from '../components/Layout/Layout';

const YoutubeTranscriber: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleTranscribe = async () => {
        if (!url.trim()) return;
        setIsProcessing(true);
        setError(null);
        setTranscript(null);
        setCopied(false);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://edyx-backend.onrender.com";
            const response = await fetch(`${API_URL}/services/youtube-transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(await response.text() || "Failed to transcribe video");
            }

            const data = await response.json();
            setTranscript(data.transcript);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during transcription.");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        if (transcript) {
            navigator.clipboard.writeText(transcript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Layout>
            <div className="service-container">
                <div className="glass-backdrop" />

                <div className="service-content">
                    <header className="service-header">
                        <div className="icon-wrapper">
                            <Youtube size={32} color="#ef4444" />
                        </div>
                        <h1>YouTube Transcriber</h1>
                        <p>Paste a YouTube link and get a highly accurate transcript instantly using Groq's Whisper API.</p>
                    </header>

                    <div className="main-layout">

                        {/* LEFT COLUMN: Controls */}
                        <div className="control-panel glass-panel">
                            <div className="section-title">
                                <Youtube size={18} />
                                <h3>Video Source</h3>
                            </div>

                            <div className="input-group">
                                <label>YouTube URL</label>
                                <input
                                    type="text"
                                    className="url-input"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>

                            <div className="info-box">
                                <Clock size={16} />
                                <p><strong>Note:</strong> Currently limited to videos under 15 minutes due to API constraints.</p>
                            </div>

                            <button
                                className="action-btn generate-btn"
                                disabled={!url.trim() || isProcessing}
                                onClick={handleTranscribe}
                            >
                                {isProcessing ? (
                                    <><RefreshCw className="spin" size={18} /> Extracting Audio & Transcribing...</>
                                ) : (
                                    <><Headphones size={18} /> Transcribe Video</>
                                )}
                            </button>

                            {error && (
                                <div className="error-box">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Output */}
                        <div className="output-panel glass-panel">

                            <div className="output-header">
                                <h3>Transcript</h3>
                                {transcript && (
                                    <button className="action-btn copy-btn" onClick={copyToClipboard}>
                                        {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                        {copied ? 'Copied' : 'Copy Text'}
                                    </button>
                                )}
                            </div>

                            <div className="output-content">
                                {!transcript && !isProcessing && (
                                    <div className="empty-state">
                                        <FileText size={48} />
                                        <p>The extracted transcript will appear here.</p>
                                    </div>
                                )}

                                {isProcessing && (
                                    <div className="processing-state">
                                        <div className="pulse-ring" />
                                        <p>Downloading audio stream...</p>
                                        <span className="sub-status">This may take a few moments depending on video length.</span>
                                    </div>
                                )}

                                {transcript && !isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="transcript-result"
                                    >
                                        <div className="transcript-text">
                                            {transcript}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
        .service-container { padding: 120px 20px 60px; min-height: 100vh; display: flex; justify-content: center; position: relative; }
        .glass-backdrop { position: fixed; top: 0; left: 0; right: 0; height: 100vh; background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4), transparent 70%); pointer-events: none; z-index: 0; }
        .service-content { width: 100%; max-width: 1200px; position: relative; z-index: 1; }
        .service-header { text-align: center; margin-bottom: 48px; }
        .icon-wrapper { width: 80px; height: 80px; background: rgba(239, 68, 68, 0.1); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .service-header h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.03em; color: var(--color-text-primary); margin-bottom: 16px; }
        .service-header p { font-size: 1.2rem; color: var(--color-text-secondary); }
        .main-layout { display: grid; grid-template-columns: 400px 1fr; gap: 32px; align-items: start; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border-radius: 32px; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); padding: 32px; }
        
        .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--color-text-primary); }
        .section-title h3 { font-size: 1.2rem; font-weight: 600; }

        .input-group { margin-bottom: 24px; }
        .input-group label { display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; }
        .url-input { width: 100%; padding: 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: white; font-family: inherit; font-size: 1rem; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .url-input:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }

        .info-box { display: flex; gap: 12px; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; color: #92400e; font-size: 0.9rem; margin-bottom: 32px; }
        .info-box p { margin: 0; line-height: 1.5; }

        .action-btn { width: 100%; padding: 16px; border-radius: 16px; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; border: none; }
        .generate-btn { background: #ef4444; color: white; }
        .generate-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box { margin-top: 20px; padding: 16px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Output */
        .output-panel { min-height: 600px; display: flex; flex-direction: column; }
        .output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .output-header h3 { font-size: 1.2rem; font-weight: 600; color: var(--color-text-primary); }
        .copy-btn { width: auto; padding: 8px 16px; border-radius: 10px; font-size: 0.9rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .copy-btn:hover { background: #ef4444; color: white; transform: none; box-shadow: none; }
        
        .output-content { flex: 1; position: relative; display: flex; flex-direction: column; }
        .empty-state, .processing-state { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; padding: 0 20px;}
        .pulse-ring { width: 64px; height: 64px; border: 3px solid rgba(239, 68, 68, 0.2); border-top-color: #ef4444; border-radius: 50%; animation: spin 1s linear infinite; }
        .sub-status { font-size: 0.85rem; opacity: 0.8; }

        .transcript-result { flex: 1; background: white; border-radius: 20px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; }
        .transcript-text { padding: 32px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 1.05rem; line-height: 1.8; color: #334155; white-space: pre-wrap; overflow-y: auto; max-height: 600px; }

        @media (max-width: 1024px) {
          .main-layout { grid-template-columns: 1fr; }
          .control-panel { order: 2; }
          .output-panel { order: 1; min-height: 400px; }
        }
      `}</style>
        </Layout>
    );
};

export default YoutubeTranscriber;
