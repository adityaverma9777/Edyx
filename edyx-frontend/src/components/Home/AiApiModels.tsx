import React from "react";
import { Zap, Gauge, MessageSquare, Atom, ArrowRight } from "lucide-react";

const models = [
    {
        id: "fast",
        name: "Fast",
        icon: <Zap size={24} />,
        desc: "Instant replies for chatbots.",
        latency: "~5s",
        useCase: "Chatbots, Simple Queries",
        color: "#eab308",
        highlight: false
    },
    {
        id: "balanced",
        name: "Balanced",
        icon: <Gauge size={24} />,
        desc: "Best model. Most smart.",
        latency: "~60s",
        useCase: "Complex Reasoning",
        color: "#3b82f6",
        highlight: false
    },
    {
        id: "convo",
        name: "Convo",
        icon: <MessageSquare size={24} />,
        desc: "Trained for conversations.",
        latency: "~25s",
        useCase: "Natural Chat",
        color: "#ec4899",
        highlight: false
    },
    {
        id: "physics",
        name: "Edyx-Physics",
        icon: <Atom size={24} />,
        desc: "Scientific reasoning natively.",
        latency: "~15s",
        useCase: "Physics, Science",
        color: "#06b6d4",
        highlight: false
    },
    {
        id: "situation-aware",
        name: "Situation-Aware",
        icon: <Zap size={24} />,
        desc: "Contextual and real-time aware.",
        latency: "~20s",
        useCase: "Real-time Context, Awareness",
        color: "#8b5cf6",
        highlight: true
    }
];

const AiApiModels: React.FC = () => {
    return (
        <section id="models" className="models-section">
            <div className="section-header">
                <h2 className="section-title">AI API Models</h2>
                <p className="section-subtitle">Developer-first API access. <strong>Login required</strong> to generate access keys.</p>
            </div>

            <div className="models-grid">
                {models.map((model) => (
                    <div key={model.id} className={`model-card ${model.highlight ? "highlight" : ""}`}>
                        <div className="card-top">
                            <div className="model-icon" style={{ color: model.color, background: `${model.color}15` }}>
                                {model.icon}
                            </div>
                            <h3 className="model-name">{model.name}</h3>
                        </div>

                        <p className="model-desc">{model.desc}</p>

                        <div className="model-stats">
                            <div className="stat-row">
                                <span className="stat-label">Latency</span>
                                <span className="stat-val">{model.latency}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Best for</span>
                                <span className="stat-val">{model.useCase}</span>
                            </div>
                        </div>
                        <button className="try-model-btn" onClick={() => window.location.href = '/dashboard'}>
                            Use API <ArrowRight size={14} style={{ marginLeft: 4 }} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="demo-cta-container">
                <p className="demo-cta-text">Try the demo and check the models. Login and try them here for free, no coding needed. Choose the best suitable model for you.</p>
            </div>

            <style>{`
        .models-section {
          padding: 80px 20px 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .section-header {
            margin-bottom: 50px;
            text-align: center;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin-bottom: 12px;
        }
        
        .section-subtitle {
            font-size: 1.1rem;
            color: var(--color-text-secondary);
        }

        .models-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .model-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .model-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
        }

        .card-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .model-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .model-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .model-desc {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          flex: 1;
        }

        .model-stats {
          padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .stat-label { color: var(--color-text-tertiary); font-weight: 500; }
        .stat-val { color: var(--color-text-primary); font-weight: 600; text-align: right; }
        
        .try-model-btn {
           margin-top: 12px;
           width: 100%;
           padding: 10px;
           border-radius: 10px;
           background: #f8f9fa;
           border: 1px solid #e5e7eb;
           color: var(--color-text-primary);
           font-weight: 600;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.2s;
        }
        
        .try-model-btn:hover {
           background: #111827;
           color: white;
           border-color: #111827;
        }

        .demo-cta-container {
           margin-top: 40px;
           background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));
           padding: 24px;
           border-radius: 16px;
           text-align: center;
           border: 1px solid rgba(168, 85, 247, 0.2);
        }
        
        .demo-cta-text {
           font-size: 1.05rem;
           color: var(--color-text-primary);
           font-weight: 500;
           max-width: 600px;
           margin: 0 auto;
           line-height: 1.6;
        }

        @media (max-width: 900px) {
           .models-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 500px) {
           .models-grid { grid-template-columns: 1fr; }
           .model-card { padding: 20px; }
        }
      `}</style>
        </section>
    );
};

export default AiApiModels;
