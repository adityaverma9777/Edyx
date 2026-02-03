import React from "react";
import { Key, Code2, Rocket } from "lucide-react";

const steps = [
    {
        icon: <Key size={24} />,
        title: "1. Get your Key",
        desc: "Sign up via OTP and generate a free API key instantly."
    },
    {
        icon: <Code2 size={24} />,
        title: "2. Make a Request",
        desc: "Use our clean, typed SDKs or simple curl commands."
    },
    {
        icon: <Rocket size={24} />,
        title: "3. Scale Up",
        desc: "Watch your app grow with uncapped requests and real-time metrics."
    }
];

const HowItWorks: React.FC = () => {
    return (
        <section className="how-section">
            <div className="container">
                <h2 className="section-title">Zero to Intelligence in seconds.</h2>

                <div className="steps-container">
                    {steps.map((step, idx) => (
                        <div key={idx} className="step-card">
                            <div className="step-icon-area">
                                <div className="step-line"></div>
                                <div className="step-icon">{step.icon}</div>
                            </div>
                            <div className="step-content">
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .how-section {
          padding: 100px 20px;
        }

        .container {
           max-width: 900px;
           margin: 0 auto;
        }

        .section-title {
           font-size: 2.5rem;
           font-weight: 700;
           text-align: center;
           margin-bottom: 80px;
           color: var(--color-text-primary);
        }

        .steps-container {
           display: flex;
           justify-content: space-between;
           gap: 40px;
           position: relative;
        }
        
        /* Connecting Line */
        .steps-container::before {
           content: "";
           position: absolute;
           top: 24px;
           left: 50px;
           right: 50px;
           height: 2px;
           background: rgba(0,0,0,0.05);
           z-index: 0;
           margin-left: 20px; /* Offset for icon width */
           margin-right: 20px; 
        }

        .step-card {
           flex: 1;
           display: flex;
           flex-direction: column;
           align-items: center;
           text-align: center;
           z-index: 1;
        }

        .step-icon {
           width: 56px;
           height: 56px;
           background: white;
           border: 2px solid var(--surface-secondary);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: var(--color-accent-primary);
           box-shadow: 0 4px 12px rgba(0,0,0,0.05);
           margin-bottom: 24px;
        }

        .step-content h3 {
           font-size: 1.1rem;
           font-weight: 600;
           margin-bottom: 8px;
        }

        .step-content p {
           font-size: 0.95rem;
           color: var(--color-text-secondary);
           line-height: 1.5;
        }

        @media (max-width: 768px) {
           .steps-container { flex-direction: column; gap: 40px; }
           .steps-container::before { 
              width: 2px; height: 100%; left: 28px; top: 0; right: auto; margin: 0;
           }
           .step-card { flex-direction: row; text-align: left; gap: 20px; align-items: flex-start; }
           .step-icon { margin-bottom: 0; }
        }
      `}</style>
        </section>
    );
};

export default HowItWorks;
