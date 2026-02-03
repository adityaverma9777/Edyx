import React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const CountUp = ({ end, duration }: { end: number, duration: number }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  React.useEffect(() => {
    if (inView) {
      spring.set(end);
    }
  }, [inView, spring, end]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const PhoneMockup: React.FC = () => {
  return (
    <section className="mockup-section">
      <div className="mockup-container">

        {/* Background Glow */}
        <div className="glow-bg"></div>

        {/* Left Phone (Chat UI) */}
        <motion.div
          className="phone-frame left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="notch"></div>
          <div className="side-button"></div>
          <div className="vol-button upper"></div>
          <div className="vol-button lower"></div>

          <div className="screen chat-screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <span className="wifi-icon"></span>
                <span className="battery-icon"></span>
              </div>
            </div>
            <div className="app-header">
              <span className="back-arrow"><ArrowLeft size={18} /></span>
              <span className="app-title">Edyx AI</span>
              <div className="avatar-xs"></div>
            </div>

            {/* Animated Chat Sequence */}
            <div className="chat-area-mock">
              <motion.div
                className="chat-bubble user"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                Analyze Q3 revenue trends
              </motion.div>

              <motion.div
                className="chat-bubble ai"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="ai-response-content">
                  <span>Processing Q3 Data...</span>
                  <div className="mini-bar-chart">
                    <div className="mini-bar" style={{ height: '40%' }}></div>
                    <div className="mini-bar" style={{ height: '70%' }}></div>
                    <div className="mini-bar" style={{ height: '50%' }}></div>
                    <div className="mini-bar" style={{ height: '90%' }}></div>
                  </div>
                  <span>Revenue is up <b>12%</b> QoQ.</span>
                </div>
              </motion.div>
            </div>
            <div className="input-mock">
              <div className="rect"></div>
            </div>
          </div>
        </motion.div>

        {/* Right Phone (Dashboard UI) */}
        <motion.div
          className="phone-frame right"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="notch"></div>
          <div className="side-button"></div>

          <div className="screen dashboard-screen">
            <div className="status-bar white-text">
              <span>9:41</span>
            </div>
            <div className="dash-header">
              <h2>Overview</h2>
              <div className="dash-avatar"></div>
            </div>

            <div className="dash-card main">
              <div className="card-label">Active Keys</div>
              <div className="card-val">
                <CountUp end={12} duration={2} />
              </div>
              <div className="sparkline">
                <svg viewBox="0 0 100 20">
                  <motion.path
                    d="M0 15 Q 20 5, 40 10 T 100 2"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                </svg>
              </div>
            </div>

            <div className="list-group">
              <div className="list-item">
                <div className="icon-sq bg-blue"></div>
                <div className="list-text">
                  <div className="list-title">Usage Alert</div>
                  <div className="list-sub">90% of limit</div>
                </div>
              </div>
              <div className="list-item">
                <div className="icon-sq bg-purple"></div>
                <div className="list-text">
                  <div className="list-title">New Model</div>
                  <div className="list-sub">Convo 2.0 Added</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      <style>{`
        .mockup-section {
          padding: 80px 20px;
          overflow: hidden;
          /* bg handled globally now */
        }

        .mockup-container {
          display: flex;
          justify-content: center;
          gap: 60px;
          flex-wrap: wrap;
          position: relative; /* Ensure container is positioning context */
        }

        .glow-bg {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(221, 122, 131, 0.2) 50%, rgba(255, 255, 255, 0) 70%);
            filter: blur(80px);
            z-index: 0;
            border-radius: 50%;
            pointer-events: none;
        }

        .phone-frame {
          width: 280px;
          height: 560px;
          background: #1d1d1f;
          border-radius: 40px;
          padding: 12px;
          position: relative;
          z-index: 1; /* Sit above glow */
          box-shadow: 
             0 25px 50px -12px rgba(0, 0, 0, 0.25),
             inset 0 0 0 2px rgba(255, 255, 255, 0.1);
          transform: rotate(-5deg);
        }

        .phone-frame.right {
          transform: rotate(5deg) translateY(40px);
        }

        .notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 24px;
          background: #1d1d1f;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          z-index: 10;
        }

        .screen {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Device Buttons */
        .side-button { position: absolute; right: -2px; top: 60px; height: 40px; width: 4px; background: #c0c0c0; border-radius: 2px; }
        .vol-button { position: absolute; left: -2px; height: 30px; width: 4px; background: #c0c0c0; border-radius: 2px; }
        .vol-button.upper { top: 60px; }
        .vol-button.lower { top: 100px; }

        /* Internal UI - Chat */
        .status-bar { display: flex; justify-content: space-between; padding: 0 20px; font-size: 10px; font-weight: 600; margin-top: 10px; color: #000; }
        .status-bar.white-text { color: white; }
        .status-icons { display: flex; gap: 4px; }
        .wifi-icon, .battery-icon { width: 14px; height: 10px; background: #000; border-radius: 2px; display: inline-block; }
        .status-bar.white-text .wifi-icon, .status-bar.white-text .battery-icon { background: white; }
        
        .app-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; }
        .app-title { font-weight: 600; font-size: 0.9rem; }
        .avatar-xs { width: 24px; height: 24px; background: #eee; border-radius: 50%; }
        
        .chat-area-mock { padding: 16px; display: flex; flex-direction: column; gap: 12px; height: 300px; }
        .chat-bubble { padding: 10px 14px; border-radius: 16px; font-size: 0.8rem; max-width: 85%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .chat-bubble.user { align-self: flex-end; background: #007AFF; color: white; border-bottom-right-radius: 4px; }
        .chat-bubble.ai { align-self: flex-start; background: #f2f2f7; color: black; border-bottom-left-radius: 4px; }

        .ai-response-content { display: flex; flex-direction: column; gap: 6px; }
        .mini-bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 30px; margin-top: 4px; }
        .mini-bar { width: 8px; background: #dd7a83; border-radius: 2px; }
        
        .input-mock { position: absolute; bottom: 20px; left: 16px; right: 16px; height: 36px; background: #f2f2f5; border-radius: 18px; }

        /* Internal UI - Dashboard */
        .dashboard-screen { background: #1c1c1e; } /* Dark Mode Dashboard Mock */
        .dash-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .dash-header h2 { font-size: 1.4rem; font-weight: 700; color: white; margin: 0; }
        .dash-avatar { width: 32px; height: 32px; background: rgba(255,255,255,0.3); border-radius: 50%; }

        .dash-card.main {
           background: linear-gradient(135deg, #dd7a83 0%, #a855f7 100%);
           color: white;
           margin: 0 16px 20px;
           padding: 20px;
           border-radius: 20px;
           box-shadow: 0 10px 20px rgba(221, 122, 131, 0.4);
        }
        .card-label { font-size: 0.8rem; opacity: 0.9; margin-bottom: 4px; }
        .card-val { font-size: 2rem; font-weight: 800; }
        
        .list-group { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
        .list-item { background: rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; backdrop-filter: blur(10px); }
        .icon-sq { width: 36px; height: 36px; border-radius: 8px; }
        .bg-blue { background: #3B82F6; }
        .bg-purple { background: #A855F7; }
        .list-text { color: white; }
        .list-title { font-weight: 600; font-size: 0.9rem; }
        .list-sub { font-size: 0.75rem; color: rgba(255,255,255,0.6); }

        @media (max-width: 768px) {
           .mockup-container { gap: 30px; transform: scale(0.9); }
           .phone-frame.right { transform: rotate(0) translateY(0); }
           .phone-frame.left { transform: rotate(0); }
        }
      `}</style>
    </section>
  );
};

export default PhoneMockup;
