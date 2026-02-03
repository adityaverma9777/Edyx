import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Globe, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { WavingFlag, SpinningEarth } from "../Footer/Footer3DComponents";

const Footer: React.FC = () => {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  return (
    <footer className="edyx-footer">
      <div className="footer-content">
        {/* LEFT: Branding */}
        <div className="footer-brand">
          <img src="/edyx-logo-black.png" alt="Edyx AI" className="footer-logo" />
          <p className="brand-tagline">
            Intelligence, Unfiltered. <br />
            Built for the future.
          </p>
          <div className="made-in">
            <span>Made in</span>
            <div className="flag-container">
              <Canvas camera={{ position: [0, 0, 3], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={1} />
                <WavingFlag />
              </Canvas>
            </div>
          </div>
        </div>

        {/* RIGHT: Links & Policy */}
        <div className="footer-links">
          <div className="link-column">
            <h4>Platform</h4>
            <a href="/dashboard">Dashboard</a>
            <a href="https://www.adityavermaworks.in/" target="_blank" rel="noreferrer">Developer</a>
            <a href="/docs">API Docs</a>
          </div>
          <div className="link-column">
            <h4>Legal</h4>
            <button onClick={() => setIsDataModalOpen(true)} className="link-btn">Privacy & Terms</button>
          </div>
          <div className="link-column">
            <h4>Contribute</h4>
            <a href="https://github.com/adityaverma9777/Edyx" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Edyx AI. All Rights Reserved.</p>
        <p className="disclaimer">Response times usage estimates only. Performance varies by environment.</p>
      </div>

      {/* PRIVACY POLICY MODAL */}
      <AnimatePresence>
        {isDataModalOpen && (
          <div className="modal-overlay" onClick={() => setIsDataModalOpen(false)}>
            <motion.div
              className="policy-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setIsDataModalOpen(false)}><X size={20} /></button>

              <div className="modal-header">
                <Shield size={32} className="modal-icon text-blue" />
                <h2>Transparency & Trust</h2>
                <p>We believe in radical transparency. Here is exactly how Edyx operates.</p>
              </div>

              <div className="policy-grid">
                <div className="policy-item">
                  <div className="p-icon bg-green"><CheckCircle size={18} color="#10b981" /></div>
                  <div>
                    <h4>Zero Access Policy</h4>
                    <p>We <strong>never</strong> see, store, or access your chat history. Your conversations are ephemeral and private.</p>
                  </div>
                </div>

                <div className="policy-item">
                  <div className="p-icon bg-blue"><MapPin size={18} color="#3b82f6" /></div>
                  <div>
                    <h4>Indigenous Infrastructure</h4>
                    <p>Models are hosted on <strong>private, indigenous Hugging Face Spaces</strong>. We rely on NO external APIs (OpenAI/Anthropic).</p>
                  </div>
                </div>

                <div className="policy-item">
                  <div className="p-icon bg-yellow"><AlertTriangle size={18} color="#f59e0b" /></div>
                  <div>
                    <h4>Safety & Compliance</h4>
                    <p>Strict safety shaders prevent illegal content generation. <strong>Attempts to jailbreak or mine illegal data will result in immediate permanent ban.</strong></p>
                  </div>
                </div>

                <div className="policy-item">
                  <div className="p-icon bg-purple"><Globe size={18} color="#8b5cf6" /></div>
                  <div>
                    <h4>Ownership & Rights</h4>
                    <p>Model weights (GGUF) belong to their respective creators. This platform provides the compute and interface layer.</p>
                  </div>
                </div>
              </div>

              <div className="email-note">
                <strong>📧 Communcation:</strong> We may use your email to send important updates. We will <strong>never</strong> sell your data to third parties.
              </div>

              <div className="modal-footer">
                <p>By using Edyx, you agree to these transparent terms.</p>
                <button className="confirm-btn" onClick={() => setIsDataModalOpen(false)}>Understood</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .edyx-footer {
          background: #fafafa;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding: 80px 20px 40px;
          margin-top: 0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-brand {
          max-width: 300px;
        }
        .footer-logo { height: 48px; margin-bottom: 24px; opacity: 1; }

        .brand-tagline {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .made-in {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          color: #1d1d1f;
          background: white;
          padding: 8px 20px;
          border-radius: 100px;
          width: fit-content;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          vertical-align: middle;
        }
        
        .flag-container { 
            width: 44px; height: 34px; 
            display: flex; align-items: center; justify-content: center;
            transform: translateY(2px); /* Slight optical correction */
        }
        .globe-container { 
            width: 30px; height: 30px; 
            display: flex; align-items: center; justify-content: center;
            transform: translateY(1px);
        }

        .footer-links {
          display: flex;
          gap: 80px;
          flex-wrap: wrap;
        }
        .link-column h4 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #999;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .link-column { display: flex; flex-direction: column; gap: 12px; }
        .link-column a, .link-btn {
          color: #444; text-decoration: none; font-size: 0.95rem; transition: color 0.2s;
          background: none; border: none; padding: 0; cursor: pointer; text-align: left; font-family: inherit;
        }
        .link-column a:hover, .link-btn:hover { color: black; text-decoration: underline; }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: #888;
          flex-wrap: wrap;
          gap: 20px;
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .policy-modal {
          background: white;
          width: 100%; max-width: 600px;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          position: relative;
        }

        .close-btn {
          position: absolute; top: 20px; right: 20px;
          background: #f5f5f7; border: none; width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #666; transition: background 0.2s;
        }
        .close-btn:hover { background: #e5e5e7; color: black; }

        .modal-header { text-align: center; margin-bottom: 32px; }
        .modal-icon { margin-bottom: 16px; color: #3b82f6; }
        .modal-header h2 { font-size: 1.8rem; margin-bottom: 8px; color: #1d1d1f; }
        .modal-header p { color: #666; font-size: 1.05rem; }

        .policy-grid { display: grid; gap: 20px; margin-bottom: 32px; }
        .policy-item { 
          display: flex; gap: 16px; 
          background: #fbfbfd; padding: 16px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.04);
        }
        .p-icon { 
          min-width: 36px; height: 36px; border-radius: 10px; 
          display: flex; align-items: center; justify-content: center; 
        }
        .bg-green { background: rgba(16, 185, 129, 0.1); }
        .bg-blue { background: rgba(59, 130, 246, 0.1); }
        .bg-yellow { background: rgba(245, 158, 11, 0.1); }
        .bg-purple { background: rgba(139, 92, 246, 0.1); }

        .policy-item h4 { font-size: 0.95rem; margin-bottom: 4px; color: #1d1d1f; font-weight: 600; }
        .policy-item p { font-size: 0.9rem; color: #666; line-height: 1.5; }

        .email-note {
          background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px;
          border-radius: 12px; font-size: 0.9rem; color: #166534; margin-bottom: 32px;
        }

        .modal-footer { text-align: center; }
        .modal-footer p { font-size: 0.85rem; color: #999; margin-bottom: 16px; }
        .confirm-btn {
          background: #1d1d1f; color: white; border: none; 
          padding: 14px 40px; border-radius: 100px; font-weight: 600; font-size: 1rem;
          cursor: pointer; transition: transform 0.2s;
        }
        .confirm-btn:hover { transform: scale(1.05); background: black; }

        @media (max-width: 768px) {
           .footer-content { flex-direction: column; gap: 40px; }
           .footer-links { gap: 40px; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
