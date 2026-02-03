
import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Zap, Activity, Globe, Server } from "lucide-react";

/**
 * Enhanced Macbook Pro mockup with animated Token Counter.
 */
const MacbookMockup: React.FC = () => {
    // Animating count to 1,000,000
    const count = useSpring(0, { duration: 5000, bounce: 0 });
    const formattedCount = useTransform(count, (value) => Math.floor(value).toLocaleString());

    useEffect(() => {
        count.set(1000000);
    }, [count]);

    return (
        <section className="macbook-section">
            <motion.div
                className="macbook-container"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <div className="macbook">
                    <div className="lid">
                        <div className="screen-content">
                            {/* Background Grid */}
                            <div className="dot-grid"></div>

                            {/* Header Badge */}
                            <div className="screen-header">
                                <div className="status-badge">
                                    <span className="blink-dot"></span> System Online
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="counter-display">
                                <motion.div
                                    className="token-count"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    <motion.span>{formattedCount}</motion.span>
                                    <span className="plus">+</span>
                                </motion.div>
                                <motion.p
                                    className="token-label"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                >
                                    Generated Tokens
                                </motion.p>
                            </div>

                            {/* Memoji - Absolute Bottom Center */}
                            <motion.img
                                src="/memoji-macbook.png"
                                className="screen-memoji"
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                            />

                            {/* Floating Icons */}
                            <motion.div className="floating-icon i-1" animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}><Zap size={24} /></motion.div>
                            <motion.div className="floating-icon i-2" animate={{ y: [15, -15, 15] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}><Activity size={24} /></motion.div>
                            <motion.div className="floating-icon i-3" animate={{ y: [-12, 12, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}><Globe size={24} /></motion.div>
                            <motion.div className="floating-icon i-4" animate={{ y: [20, -20, 20] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}><Server size={24} /></motion.div>

                            {/* Bottom Graph Line */}
                            <svg className="bottom-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#f3f4f6" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </div>
                        <div className="camera"></div>
                    </div>
                    <div className="base"></div>
                </div>
            </motion.div>

            <style>{`
        .macbook-section {
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          perspective: 2000px;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(221, 122, 131, 0.05) 0%, transparent 60%);
        }

        .macbook-container {
           transform-style: preserve-3d;
        }

        .macbook {
           width: 900px;
           height: 540px;
           position: relative;
           transform-style: preserve-3d;
           transform: rotateX(12deg);
           transition: transform 0.5s ease;
           will-change: transform;
        }
        
        .macbook:hover {
           transform: rotateX(5deg) scale(1.02);
        }

        .lid {
           width: 900px;
           height: 520px;
           background: #1d1d1f;
           border-radius: 28px 28px 0 0;
           position: relative;
           padding: 24px;
           box-sizing: border-box;
           border: 1px solid rgba(255,255,255,0.1);
           box-shadow: 0 20px 50px rgba(0,0,0,0.4);
           display: flex;
           justify-content: center;
           align-items: center;
           transform-origin: bottom;
           background: linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%);
        }

        .screen-content {
           width: 100%;
           height: 100%;
           background: #fff;
           border-radius: 6px;
           overflow: hidden;
           position: relative;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: inset 0 0 60px rgba(0,0,0,0.05);
        }

        .dot-grid {
            position: absolute; inset: 0;
            background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
            background-size: 30px 30px;
            opacity: 0.6;
        }

        .screen-header {
            position: absolute; top: 24px; right: 32px;
        }

        .status-badge {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
            padding: 6px 16px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex; align-items: center; gap: 8px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .blink-dot {
            width: 8px; height: 8px; background: #10b981; border-radius: 50%;
            animation: blink 2s infinite;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .counter-display {
            text-align: center;
            position: relative;
            z-index: 10;
        }

        .token-count {
            font-size: 6rem;
            font-weight: 800;
            background: linear-gradient(135deg, #111 30%, #444 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            letter-spacing: -0.04em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .token-count .plus {
            background: linear-gradient(135deg, #dd7a83 0%, #be185d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 5rem;
            transform: translateY(-8px);
        }

        .token-label {
            font-size: 1.25rem;
            color: #666;
            margin-top: 0;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            background: rgba(0,0,0,0.05);
            padding: 8px 16px; border-radius: 12px;
            display: inline-block;
        }

        .floating-icon {
            position: absolute;
            color: #e5e7eb;
            z-index: 1;
        }
        .i-1 { top: 20%; left: 15%; color: #dbeafe; transform: rotate(-10deg); } /* Zap */
        .i-2 { top: 30%; right: 15%; color: #fce7f3; transform: rotate(10deg); } /* Activity */
        .i-3 { bottom: 25%; left: 20%; color: #e0e7ff; transform: rotate(5deg); } /* Globe */
        .i-4 { bottom: 35%; right: 25%; color: #f3f4f6; transform: rotate(-5deg); } /* Server */
        
        .bottom-wave {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 120px; width: 100%;
            z-index: 0;
        }

        .screen-memoji {
            position: absolute;
            bottom: -20px; /* Touching rim */
            left: 40%;
            transform: translateX(-50%);
            width: 180px;
            height: auto;
            z-index: 5;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
        }

        .camera {
           position: absolute;
           top: 10px;
           left: 50%;
           transform: translateX(-50%);
           width: 6px;
           height: 6px;
           background: #111;
           border-radius: 50%;
           box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
        }

        .base {
           width: 1080px;
           height: 24px;
           background: #c0c0c5;
           border-radius: 0 0 20px 20px;
           position: absolute;
           bottom: -24px;
           left: 50%;
           transform: translateX(-50%);
           background: linear-gradient(to bottom, #d0d0d5, #a0a0a5);
           box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        @media (max-width: 960px) {
           .macbook { width: 100%; height: auto; aspect-ratio: 16/10; transform: rotateX(8deg); }
           .macbook:hover { transform: rotateX(8deg); } /* Disable hover on touch */
           .lid { width: 100%; height: 100%; padding: 16px; }
           .base { width: 120%; bottom: -4%; height: 4%; }
           .macbook-section { padding: 20px 10px; margin-top: -30px; margin-bottom: 40px; overflow: visible; }
           .token-count { font-size: 3rem; }
           .token-count .plus { font-size: 2.5rem; }
           .token-label { font-size: 0.9rem; padding: 6px 12px; }
           .floating-icon { display: none; }
           .screen-memoji { display: none; }
           .status-badge { font-size: 0.75rem; padding: 4px 10px; }
           .screen-header { top: 12px; right: 16px; }
        }

        @media (max-width: 480px) {
           .macbook { transform: rotateX(5deg); }
           .macbook:hover { transform: rotateX(5deg); }
           .macbook-section { padding: 10px 8px; }
           .token-count { font-size: 2rem; }
           .token-count .plus { font-size: 1.5rem; }
           .token-label { font-size: 0.8rem; }
           .screen-memoji { display: none; }
           .status-badge { display: none; }
           .lid { padding: 10px; border-radius: 16px 16px 0 0; }
        }
      `}</style>
        </section>
    );
};

export default MacbookMockup;
