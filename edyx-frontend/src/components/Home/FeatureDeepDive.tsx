import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Infinity as InfinityIcon, Cpu, MessageCircle, Server, Rocket, Sparkles, Hand } from "lucide-react";

const FeatureDeepDive: React.FC = () => {
    return (
        <section className="deep-dive-section" id="features">
            <div className="container">

                {/* Zero Friction */}
                <div className="feature-row">
                    <div className="feature-text">
                        <div className="icon-box blue"><Zap size={24} /></div>
                        <h2>Zero Friction Entry.</h2>
                        <p>
                            Forget passwords. Edyx uses secure, instant OTP logins.
                            Go from "Visitor" to "Developer" in under 30 seconds.
                            We remove the hurdles so you can just ship.
                        </p>
                        <ul className="feature-list">
                            <li>• Magic Link / OTP Email</li>
                            <li>• Instant Session Hydration</li>
                            <li>• No Password Fatigue</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">
                            {/* Simulated Login Flow */}
                            <motion.div
                                className="login-sim"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="sim-input">user@company.com</div>
                                <motion.div
                                    className="sim-btn"
                                    animate={{
                                        scale: [1, 0.95, 1],
                                        backgroundColor: ["#1d1d1f", "#3B82F6", "#1d1d1f"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    Send Code
                                </motion.div>
                                <motion.div
                                    className="sim-toast"
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                >
                                    Code sent! <Rocket size={14} style={{ display: 'inline', marginLeft: 4 }} />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* FAST */}
                <div className="feature-row reverse">
                    <div className="feature-text">
                        <div className="icon-box yellow"><Zap size={24} /></div>
                        <h2>Lightning Fast.</h2>
                        <p>
                            Meet our <strong>FAST</strong> model, powered by <strong>Qwen 2.5 (Quantized)</strong>.
                            Engineered for ultra-low latency and CPU-friendly performance.
                            It delivers short, precise answers instantly—perfect for students and quick apps.
                        </p>
                        <ul className="feature-list">
                            <li>• Powered by Qwen 2.5 Small</li>
                            <li>• &lt; 2s Response Time</li>
                            <li>• Extremely Stable API</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="speed-visual">
                                <motion.div
                                    className="bolt-container"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Zap size={80} color="#FBBF24" fill="#FBBF24" />
                                </motion.div>
                                <motion.div
                                    className="speed-lines"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                >
                                    {[1, 2, 3].map(i => (
                                        <motion.div key={i} className="speed-line"
                                            animate={{ x: [-20, 100], opacity: [0, 1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </motion.div>
                                <div className="metric-badge">24ms Latency</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*CONVO */}
                <div className="feature-row">
                    <div className="feature-text">
                        <div className="icon-box green"><MessageCircle size={24} /></div>
                        <h2>Natural Conversation.</h2>
                        <p>
                            Our <strong>CONVO</strong> model brings personality to the table.
                            Running on <strong>TinyLlama 1.1B</strong>, it's instruction-tuned for friendly,
                            rich dialogue while remaining lightweight enough to run anywhere.
                        </p>
                        <ul className="feature-list">
                            <li>• Powered by TinyLlama 1.1B</li>
                            <li>• Tuned for Personality</li>
                            <li>• Balanced Speed & Coherence</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="chat-visual">
                                <motion.div className="chat-blob agent"
                                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: 'spring' }}
                                > <Hand size={14} style={{ display: 'inline', marginRight: 4 }} /> Hi! How can I help?</motion.div>
                                <motion.div className="chat-blob user"
                                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                                >Tell me a fun fact!</motion.div>
                                <motion.div className="chat-blob agent"
                                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}
                                >Did you know honey never spoils?</motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BALANCED */}
                <div className="feature-row reverse">
                    <div className="feature-text">
                        <div className="icon-box purple"><Cpu size={24} /></div>
                        <h2>Deep Reasoning.</h2>
                        <p>
                            For complex tasks, use our <strong>BALANCED</strong> model.
                            Powered by <strong>Llama 3.2 1B Instruct (quantized)</strong>, it takes its time (~25s) to
                            think, analyze, and structure the perfect answer.
                        </p>
                        <ul className="feature-list">
                            <li>• Powered by Llama 3.2 1B Instruct</li>
                            <li>• Advanced Reasoning Capabilities</li>
                            <li>• Best for Logic & Code</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="brain-visual">
                                <div className="brain-circle center"></div>
                                <div className="brain-orbit">
                                    <motion.div className="orb" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ originX: "60px", originY: "0px" }} />
                                    <motion.div className="orb" animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ originX: "-50px", originY: "-30px" }} />
                                    <motion.div className="orb" animate={{ rotate: 180 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} style={{ originX: "0px", originY: "50px" }} />
                                </div>
                                <motion.div className="pulse-waves">
                                    <motion.div className="wave" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                                    <motion.div className="wave" animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="feature-row">
                    <div className="feature-text">
                        <div className="icon-box purple"><InfinityIcon size={24} /></div>
                        <h2>Uncapped Potential.</h2>
                        <p>
                            Most APIs punish you for growing. We don't.
                            Our free tier is designed for real production loads, not just toy projects.
                            Scale your requests without hitting a paywall.
                        </p>
                        <ul className="feature-list">
                            <li>• 100% Free Tier</li>
                            <li>• No Hard Rate Limits</li>
                            <li>• Generous Token Quotas</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="graph-container">
                                <svg viewBox="0 0 200 100" className="growth-chart">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#A855F7', stopOpacity: 0.5 }} />
                                            <stop offset="100%" style={{ stopColor: '#A855F7', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <motion.path
                                        d="M0 80 C 50 80, 80 80, 100 50 S 150 20, 200 10"
                                        fill="none"
                                        stroke="#A855F7"
                                        strokeWidth="4"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                    />
                                    <motion.path
                                        d="M0 80 C 50 80, 80 80, 100 50 S 150 20, 200 10 L 200 100 L 0 100 Z"
                                        fill="url(#grad1)"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                    />
                                </svg>
                                <motion.div
                                    className="float-label"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 }}
                                >
                                    unlimited <Sparkles size={14} style={{ display: 'inline', marginLeft: 4 }} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="feature-row reverse">
                    <div className="feature-text">
                        <div className="icon-box dark"><Server size={24} /></div>
                        <h2>Sovereign Infrastructure.</h2>
                        <p>
                            We don't just wrap other APIs. <strong>We host our models ourselves</strong>.
                            By running our own nodes on Hugging Face Spaces, we eliminate external dependencies.
                            This means 100% transparency and no middleman outages.
                        </p>
                        <ul className="feature-list">
                            <li>• Self-Hosted on HF Spaces</li>
                            <li>• No External API Reliance</li>
                            <li>• Independent & Robust</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="server-visual">
                                <div className="server-box">
                                    <div className="blink-light"></div>
                                    <div className="blink-light two"></div>
                                    <div className="blink-light three"></div>
                                </div>
                                <motion.div
                                    className="connection-line"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="cloud-badge">HF Space</div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="feature-row">
                    <div className="feature-text">
                        <div className="icon-box red"><Shield size={24} /></div>
                        <h2>Bank-Grade Security.</h2>
                        <p>
                            Your data is encrypted at rest and in transit.
                            With granular key management, you can generate, scope, and revoke access keys instantly.
                            You are always in full control of your infrastructure.
                        </p>
                        <ul className="feature-list">
                            <li>• Instant Key Revocation</li>
                            <li>• AES-256 Encryption</li>
                            <li>• Scoped Access Control</li>
                        </ul>
                    </div>
                    <div className="feature-visual">
                        <div className="visual-card">

                            <div className="security-mock">
                                <motion.div
                                    className="shield-icon"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Lock size={48} color="white" />
                                </motion.div>
                                <div className="enc-lines">
                                    <motion.div className="enc-line" animate={{ width: ["0%", "80%", "0%"] }} transition={{ duration: 2, repeat: Infinity }} />
                                    <motion.div className="enc-line" animate={{ width: ["0%", "60%", "0%"] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
                                    <motion.div className="enc-line" animate={{ width: ["0%", "90%", "0%"] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        .deep-dive-section {
          padding: 80px 20px;
          background: #fafafa;
          margin: 20px;
          border-radius: 40px;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 120px;
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 80px;
        }
        .feature-row.reverse {
           flex-direction: row-reverse;
        }

        .feature-text {
           flex: 1;
           display: flex;
           flex-direction: column;
           gap: 24px;
        }

        .icon-box {
           width: 48px; height: 48px;
           border-radius: 12px;
           display: flex; align-items: center; justify-content: center;
           color: white;
           margin-bottom: 8px;
        }
        .icon-box.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
        .icon-box.purple { background: linear-gradient(135deg, #A855F7, #9333EA); }
        .icon-box.red { background: linear-gradient(135deg, #dd7a83, #e3bfc3); }
        .icon-box.yellow { background: linear-gradient(135deg, #F59E0B, #FBBF24); }
        .icon-box.green { background: linear-gradient(135deg, #10B981, #34D399); }
        .icon-box.dark { background: linear-gradient(135deg, #333, #000); }

        .feature-text h2 {
           font-size: 2.5rem;
           font-weight: 700;
           color: var(--color-text-primary);
           line-height: 1.1;
        }

        .feature-text p {
           font-size: 1.1rem;
           color: var(--color-text-secondary);
           line-height: 1.6;
        }
        .feature-text p strong { color: var(--color-text-primary); }

        .feature-list {
           list-style: none;
           padding: 0;
           display: flex;
           flex-direction: column;
           gap: 12px;
        }
        .feature-list li {
           font-size: 1rem;
           font-weight: 500;
           color: var(--color-text-primary);
        }

        .feature-visual {
           flex: 1;
        }

        .visual-card {
           background: white;
           border-radius: 24px;
           padding: 40px;
           box-shadow: 
              0 20px 40px -10px rgba(0,0,0,0.08),
              0 0 0 1px rgba(0,0,0,0.03);
           height: 320px;
           display: flex;
           align-items: center;
           justify-content: center;
           overflow: hidden;
           position: relative;
        }

        /* Login Sim */
        .login-sim { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 240px; }
        .sim-input { padding: 12px; border: 1px solid #eee; border-radius: 8px; color: #888; font-size: 0.9rem; }
        .sim-btn {
           background: #1d1d1f; color: white; padding: 12px; border-radius: 8px; 
           text-align: center; font-weight: 600; font-size: 0.9rem; cursor: pointer;
        }
        .sim-toast {
           background: #4ade80; color: #065f46; padding: 10px; border-radius: 8px;
           font-size: 0.85rem; text-align: center; font-weight: 600;
           box-shadow: 0 4px 12px rgba(74, 222, 128, 0.2);
        }

        /* Fast Model Visual */
        .speed-visual { display: flex; flex-direction: column; align-items: center; position: relative; width: 100%; }
        .bolt-container { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5)); }
        .speed-lines { position: absolute; width: 100%; height: 100%; top: 0; pointer-events: none; }
        .speed-line { height: 2px; width: 40px; background: #fbbf24; border-radius: 2px; position: absolute; }
        .speed-line:nth-child(1) { top: 20%; left: 10%; }
        .speed-line:nth-child(2) { top: 50%; left: 0%; }
        .speed-line:nth-child(3) { top: 70%; left: 15%; }
        .metric-badge { 
             margin-top: 20px; background: #fff; padding: 8px 16px; 
             border: 1px solid #fee2e2; color: #b45309; border-radius: 20px; 
             font-weight: 700; box-shadow: 0 4px 10px rgba(251, 191, 36, 0.2); 
        }

        /* Chat Visual */
        .chat-visual { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px; }
        .chat-blob { padding: 12px 16px; border-radius: 16px; font-size: 0.9rem; max-width: 80%; }
        .chat-blob.agent { background: #f0fdf4; color: #166534; border-bottom-left-radius: 4px; align-self: flex-start; }
        .chat-blob.user { background: #166534; color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
        
        /* Growth Graph */
        .graph-container { width: 100%; height: 100%; position: relative; display: flex; align-items: flex-end; }
        .growth-chart { width: 100%; height: 100%; overflow: visible; }
        .float-label {
           position: absolute; top: 10%; right: 10%;
           background: #A855F7; color: white; padding: 6px 12px;
           border-radius: 20px; font-size: 0.8rem; font-weight: 600;
           box-shadow: 0 4px 10px rgba(168, 85, 247, 0.4);
        }

        /* Server Visual */
        .server-visual { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .server-box { 
            width: 140px; height: 100px; background: #1f2937; border-radius: 8px; 
            padding: 12px; display: flex; gap: 8px; position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 2px solid #374151;
        }
        .blink-light { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; animation: blink 1s infinite alternate; }
        .blink-light.two { animation-delay: 0.2s; }
        .blink-light.three { animation-delay: 0.5s; }
        @keyframes blink { from { opacity: 0.4; } to { opacity: 1; } }
        
        .connection-line { width: 2px; height: 40px; background: #374151; }
        .cloud-badge { background: #fff; border: 1px solid #e5e5e5; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; color: #374151; }

        /* Security Shield */
        .security-mock { display: flex; flex-direction: column; align-items: center; gap: 24px; width: 100%; }
        .shield-icon {
           width: 80px; height: 80px; background: #dd7a83; border-radius: 50%;
           display: flex; align-items: center; justify-content: center;
           box-shadow: 0 10px 30px rgba(221, 122, 131, 0.3);
        }
        .enc-lines { width: 100%; max-width: 200px; display: flex; flex-direction: column; gap: 8px; }
        .enc-line { height: 4px; background: #e5e5e5; border-radius: 2px; }

        /* Brain Visual */
        .brain-visual { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .brain-circle { width: 60px; height: 60px; background: #A855F7; border-radius: 50%; z-index: 2; box-shadow: 0 0 30px rgba(168, 85, 247, 0.5); }
        .brain-orbit { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .orb { width: 12px; height: 12px; background: #c084fc; border-radius: 50%; opacity: 0.8; position: absolute; }
        
        .pulse-waves { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .wave { position: absolute; width: 60px; height: 60px; border: 2px solid #A855F7; border-radius: 50%; opacity: 0.5; }

        @media (max-width: 860px) {
           .feature-row, .feature-row.reverse { flex-direction: column; gap: 40px; text-align: center; }
           .feature-text { align-items: center; }
           .feature-list { align-items: center; }
           .deep-dive-section { padding: 60px 20px; margin: 10px; border-radius: 24px; }
           .container { gap: 80px; }
           .feature-text h2 { font-size: 2rem; }
           .visual-card { height: auto; min-height: 200px; padding: 24px; width: 100%; }
           .brain-visual { min-height: 180px; }
           .feature-visual { width: 100%; }
        }

        @media (max-width: 480px) {
           .deep-dive-section { padding: 40px 16px; margin: 8px; }
           .container { gap: 60px; }
           .feature-text h2 { font-size: 1.6rem; }
           .feature-text p { font-size: 0.95rem; }
           .visual-card { min-height: 180px; padding: 20px; border-radius: 16px; }
           .icon-box { width: 40px; height: 40px; }
        }
      `}</style>
        </section>
    );
};

export default FeatureDeepDive;
