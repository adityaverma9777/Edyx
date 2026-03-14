import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, UploadCloud, File as FileIcon, X, RefreshCw,
  Settings2, Download, BookOpen, MessageSquare, List
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Layout from '../components/Layout/Layout';

type Mode = 'casual' | 'detailed' | 'study';

const MODES = [
  { id: 'casual', label: 'Casual', icon: MessageSquare, desc: 'A quick, easy-to-read overview' },
  { id: 'detailed', label: 'Detailed', icon: List, desc: 'Comprehensive bullet points and sections' },
  { id: 'study', label: 'Study Aid', icon: BookOpen, desc: 'Key concepts, terminology, and Q&A' },
];

const PdfSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('detailed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSummary(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const handleGenerate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/services/pdf-summarize`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while processing the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!resultRef.current || !summary) return;

    const opt = {
      margin: 1,
      filename: `Summary_${file?.name.replace('.pdf', '')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
    };

    html2pdf().set(opt).from(resultRef.current).save();
  };


  return (
    <Layout>
      <div className="service-container">
        <div className="glass-backdrop" />

        <div className="service-content">
          <header className="service-header">
            <div className="icon-wrapper">
              <FileText size={32} color="#f43f5e" />
            </div>
            <h1>PDF Summarizer</h1>
            <p>Upload a document and our AI will extract the key insights instantly.</p>
          </header>

          <div className="main-layout">

            {/* LEFT COLUMN: Controls */}
            <div className="control-panel glass-panel">

              <div className="section-title">
                <Settings2 size={18} />
                <h3>Configuration</h3>
              </div>

              <div className="upload-zone" {...getRootProps()}>
                <input {...getInputProps()} />
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`drop-content ${isDragActive ? 'active' : ''}`}
                    >
                      <UploadCloud size={48} className="upload-icon" />
                      <h4>{isDragActive ? "Drop PDF here" : "Drag & Drop PDF"}</h4>
                      <p>or click to browse (Max 10MB)</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="file-selected"
                    >
                      <FileIcon size={32} className="file-icon" />
                      <div className="file-info">
                        <span className="filename">{file.name}</span>
                        <span className="filesize">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setSummary(null); }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mode-selector">
                <h4>Summary Mode</h4>
                <div className="mode-options">
                  {MODES.map(m => (
                    <div
                      key={m.id}
                      className={`mode-card ${mode === m.id ? 'selected' : ''}`}
                      onClick={() => setMode(m.id as Mode)}
                    >
                      <m.icon size={20} />
                      <div className="mode-text">
                        <h5>{m.label}</h5>
                        <span>{m.desc}</span>
                      </div>
                      {mode === m.id && <div className="active-indicator" />}
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="action-btn generate-btn"
                disabled={!file || isProcessing}
                onClick={handleGenerate}
              >
                {isProcessing ? (
                  <><RefreshCw className="spin" size={18} /> Processing PDF...</>
                ) : (
                  <>Generate Summary</>
                )}
              </button>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Output */}
            <div className="output-panel glass-panel">

              <div className="output-header">
                <h3>Result</h3>
                {summary && (
                  <button className="action-btn download-btn" onClick={handleDownloadPdf}>
                    <Download size={16} /> Download PDF
                  </button>
                )}
              </div>

              <div className="output-content">
                {!summary && !isProcessing && (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>Your summary will appear here.</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="processing-state">
                    <div className="pulse-ring" />
                    <p>Analyzing document structure and extracting key points...</p>
                  </div>
                )}

                {summary && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="summary-result"
                  >
                    <div ref={resultRef} className="markdown-body" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .service-container {
          padding: 120px 20px 60px;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          position: relative;
        }
        
        .glass-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; height: 100vh;
          background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .service-content {
          width: 100%; max-width: 1200px;
          position: relative; z-index: 1;
        }

        .service-header {
          text-align: center;
          margin-bottom: 48px;
        }
        
        .icon-wrapper {
          width: 80px; height: 80px;
          background: rgba(244, 63, 94, 0.1);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }

        .service-header h1 {
          font-size: 3rem; font-weight: 700; letter-spacing: -0.03em;
          color: var(--color-text-primary);
          margin-bottom: 16px;
        }
        .service-header p {
          font-size: 1.2rem; color: var(--color-text-secondary);
        }

        .main-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 32px;
          align-items: start;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
          padding: 32px;
        }

        /* Control Panel */
        .section-title {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px; color: var(--color-text-primary);
        }
        .section-title h3 { font-size: 1.2rem; font-weight: 600; }

        .upload-zone {
          border: 2px dashed rgba(0,0,0,0.1);
          border-radius: 20px;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .upload-zone:hover, .drop-content.active {
          border-color: #3b82f6; background: rgba(59, 130, 246, 0.05);
        }

        .drop-content {
          padding: 40px 20px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .upload-icon { color: #94a3b8; margin-bottom: 8px; }
        .drop-content h4 { font-size: 1.1rem; color: var(--color-text-primary); font-weight: 600; }
        .drop-content p { font-size: 0.9rem; color: var(--color-text-tertiary); }

        .file-selected {
          padding: 24px; display: flex; align-items: center; gap: 16px;
          background: white;
        }
        .file-icon { color: #f43f5e; }
        .file-info { flex: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
        .filename { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-primary); }
        .filesize { font-size: 0.8rem; color: var(--color-text-tertiary); }
        .remove-btn { 
          width: 32px; height: 32px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.05); border: none; cursor: pointer; color: var(--color-text-secondary);
          transition: background 0.2s;
        }
        .remove-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .mode-selector h4 { font-size: 0.95rem; color: var(--color-text-secondary); margin-bottom: 16px; font-weight: 600; }
        .mode-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        
        .mode-card {
          padding: 16px; border-radius: 16px; background: white;
          border: 1px solid rgba(0,0,0,0.05);
          display: flex; align-items: center; gap: 16px;
          cursor: pointer; transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .mode-card:hover { border-color: rgba(0,0,0,0.1); transform: translateY(-1px); }
        .mode-card.selected { 
          border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          background: #f8fafc;
        }
        
        .mode-text { display: flex; flex-direction: column; gap: 4px; }
        .mode-text h5 { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); }
        .mode-text span { font-size: 0.8rem; color: var(--color-text-tertiary); }
        
        .active-indicator {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: #3b82f6;
        }

        .action-btn {
          width: 100%; padding: 16px; border-radius: 16px;
          font-weight: 600; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; border: none;
        }
        .generate-btn {
          background: var(--color-text-primary); color: white;
        }
        .generate-btn:not(:disabled):hover {
          transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box {
          margin-top: 20px; padding: 16px; border-radius: 12px;
          background: #fef2f2; border: 1px solid #fecaca; color: #ef4444;
          font-size: 0.9rem;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Output Panel */
        .output-panel {
          min-height: 600px;
          display: flex; flex-direction: column;
        }
        .output-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .output-header h3 { font-size: 1.2rem; font-weight: 600; color: var(--color-text-primary); }
        
        .download-btn {
          width: auto; padding: 8px 16px; border-radius: 10px;
          font-size: 0.9rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6;
        }
        .download-btn:hover { background: #3b82f6; color: white; transform: none; box-shadow: none; }

        .output-content { flex: 1; position: relative; }
        
        .empty-state, .processing-state {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          text-align: center; color: #94a3b8; width: 100%;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        
        .pulse-ring {
          width: 64px; height: 64px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .summary-result {
          background: white; padding: 32px; border-radius: 20px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
          height: 100%; overflow-y: auto;
          max-height: 700px;
        }

        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          font-size: 1rem; line-height: 1.6; color: #333;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25;
        }
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 16px; }
        .markdown-body li { margin-bottom: 4px; }
        .markdown-body strong { font-weight: 600; }

        @media (max-width: 1024px) {
          .main-layout { grid-template-columns: 1fr; }
          .control-panel { order: 2; }
          .output-panel { order: 1; min-height: 400px; }
        }
        @media (max-width: 768px) {
          .service-header h1 { font-size: 2.2rem; }
          .glass-panel { padding: 20px; }
          .summary-result { padding: 20px; }
        }
      `}</style>
    </Layout>
  );
};

export default PdfSummarizer;
