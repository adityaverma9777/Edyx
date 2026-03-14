import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Image as ImageIcon, RefreshCw, Type, Download } from 'lucide-react';
import Layout from '../components/Layout/Layout';

type StyleOption = 'vibrant' | 'minimal' | 'flat' | '3d';

const STYLES: { id: StyleOption; label: string; desc: string; prompt: string }[] = [
    { id: 'vibrant', label: 'Vibrant', desc: 'Colorful and dynamic gradients', prompt: 'vibrant dynamic colorful gradients icon logo isolated on white background, high quality, vector style' },
    { id: 'minimal', label: 'Minimalist', desc: 'Extremely simple, bare-bones shapes', prompt: 'extreme minimalist simple vector style icon flat isolated on white background, high quality' },
    { id: 'flat', label: 'Flat Vector', desc: 'Solid colors, no gradients or shadows', prompt: 'flat design icon solid bold colors no gradients isolated on white background, vector graphic style' },
    { id: '3d', label: '3D Render', desc: 'Soft 3D icon with volumetric lighting', prompt: '3D rendered icon design, soft volumetric lighting, high detail, isolated on white background' }
];

const IconGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<StyleOption>('flat');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setError(null);

        const styleConfig = STYLES.find(s => s.id === selectedStyle);
        const finalPrompt = `${prompt}, ${styleConfig?.prompt}`;

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
            const response = await fetch(`${API_URL}/services/icon-generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: finalPrompt })
            });

            if (!response.ok) {
                let errorMsg = "Failed to generate image.";
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { }

                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (err: any) {
            console.error("Image generation error:", err);
            setError(err.message || "Failed to generate image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPNG = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icon_${prompt.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download image", err);
        }
    };

    return (
        <Layout>
            <div className="service-container">
                <div className="glass-backdrop" />

                <div className="service-content">
                    <header className="service-header">
                        <div className="icon-wrapper">
                            <Palette size={32} color="#8b5cf6" />
                        </div>
                        <h1>AI Icon Generator</h1>
                        <p>Describe an icon and watch our AI instantly produce high-quality, beautiful images.</p>
                    </header>

                    <div className="main-layout">
                        {/* LEFT COLUMN: Controls */}
                        <div className="control-panel glass-panel">
                            <div className="input-group">
                                <label><Type size={16} /> Description</label>
                                <textarea
                                    className="prompt-input"
                                    placeholder="E.g., A cute robot reading a book, minimalistic lines..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="input-group">
                                <label><Palette size={16} /> Art Style</label>
                                <div className="style-grid">
                                    {STYLES.map(s => (
                                        <div
                                            key={s.id}
                                            className={`style-card ${selectedStyle === s.id ? 'active' : ''}`}
                                            onClick={() => setSelectedStyle(s.id)}
                                        >
                                            <span className="style-name">{s.label}</span>
                                            <span className="style-desc">{s.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="action-btn generate-btn"
                                disabled={!prompt.trim() || isGenerating}
                                onClick={handleGenerate}
                            >
                                {isGenerating ? (
                                    <><RefreshCw className="spin" size={18} /> Generating Graphic...</>
                                ) : (
                                    <><Sparkles size={18} /> Generate Icon</>
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
                                <h3>Preview Canvas</h3>
                                {imageUrl && (
                                    <div className="download-actions">
                                        <button className="action-btn download-btn" onClick={handleDownloadPNG}>
                                            <Download size={16} /> Download PNG
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="output-content">
                                {!imageUrl && !isGenerating && (
                                    <div className="empty-state">
                                        <ImageIcon size={48} />
                                        <p>Your generated icon will appear here.</p>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="processing-state">
                                        <div className="pulse-ring" />
                                        <p>Rendering pixels and styles...</p>
                                    </div>
                                )}

                                {imageUrl && !isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="image-result-container"
                                    >
                                        <img src={imageUrl} alt="Generated Icon" className="generated-image" />
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
        .icon-wrapper { width: 80px; height: 80px; background: rgba(139, 92, 246, 0.1); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .service-header h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.03em; color: var(--color-text-primary); margin-bottom: 16px; }
        .service-header p { font-size: 1.2rem; color: var(--color-text-secondary); }
        .main-layout { display: grid; grid-template-columns: 450px 1fr; gap: 32px; align-items: start; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border-radius: 32px; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); padding: 32px; }
        
        /* Controls */
        .input-group { margin-bottom: 32px; }
        .input-group label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 12px; }
        .prompt-input { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); background: white; font-family: inherit; font-size: 1rem; resize: vertical; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .prompt-input:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1); }
        
        .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .style-card { padding: 16px; background: white; border: 1px solid rgba(0,0,0,0.1); border-radius: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px; }
        .style-card:hover { border-color: rgba(0,0,0,0.2); transform: translateY(-2px); }
        .style-card.active { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1); }
        .style-name { font-weight: 600; color: var(--color-text-primary); font-size: 0.95rem; }
        .style-desc { font-size: 0.75rem; color: var(--color-text-tertiary); line-height: 1.4; }

        .action-btn { width: 100%; padding: 16px; border-radius: 16px; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; border: none; }
        .generate-btn { background: #8b5cf6; color: white; }
        .generate-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2); }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box { margin-top: 20px; padding: 16px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; font-size: 0.9rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Output */
        .output-panel { min-height: 600px; display: flex; flex-direction: column; }
        .output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .output-header h3 { font-size: 1.2rem; font-weight: 600; color: var(--color-text-primary); }
        .download-actions { display: flex; gap: 12px; }
        .download-btn { width: auto; padding: 8px 16px; border-radius: 10px; font-size: 0.9rem; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .download-btn:hover { background: #8b5cf6; color: white; transform: none; box-shadow: none; }
        
        .output-content { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 20px; border: 2px dashed rgba(0,0,0,0.05); overflow: hidden; }
        .empty-state, .processing-state { text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; }
        .pulse-ring { width: 64px; height: 64px; border: 3px solid rgba(139, 92, 246, 0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; }
        
        .image-result-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .generated-image { width: 100%; max-width: 450px; aspect-ratio: 1; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

        @media (max-width: 1024px) {
          .main-layout { grid-template-columns: 1fr; }
          .control-panel { order: 2; }
          .output-panel { order: 1; min-height: 400px; }
        }
        @media (max-width: 768px) {
          .service-header h1 { font-size: 2.2rem; }
          .glass-panel { padding: 20px; }
          .style-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </Layout>
    );
};

export default IconGenerator;
