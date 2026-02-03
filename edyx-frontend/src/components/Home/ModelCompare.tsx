import React from "react";
import { Gauge, MessageSquare, Zap } from "lucide-react";

const models = [
  {
    id: "fast",
    name: "Fast",
    icon: <Zap size={24} />,
    desc: "Instant replies for chatbots.",
    latency: "~5s",
    useCase: "Chatbots, Simple Queries",
    color: "#eab308", // Yellow to match dashboard
    highlight: false
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: <Gauge size={24} />,
    desc: "Best model. Most smart.",
    latency: "~60s",
    useCase: "Complex Reasoning, Best Results",
    color: "#3b82f6", // Blue to match dashboard
    highlight: true // Center card highlight
  },
  {
    id: "convo",
    name: "Convo",
    icon: <MessageSquare size={24} />,
    desc: "Trained for conversations.",
    latency: "~25s",
    useCase: "Natural Chat, Long Context",
    color: "#ec4899", // Pink to match dashboard
    highlight: false
  }
];

const ModelCompare: React.FC = () => {
  return (
    <section id="models" className="models-section">
      <div className="section-header">
        <h2 className="section-title">Three brains. One API.</h2>
        <p className="section-subtitle">Choose the right intelligence for every task.</p>
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
          </div>
        ))}
      </div>

      <style>{`
        .models-section {
          padding: 80px 20px;
          max-width: 1000px;
          margin: 0 auto;
          margin: 0 auto;
          position: relative;
        }

        /* Ensure content sits above the WebGL background */
        .section-header, .models-grid {
            position: relative;
            z-index: 2;
        }

        .models-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: center;
        }

        .model-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: transform 0.3s;
        }

        .model-card.highlight {
          border-color: transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #A855F7, #dd7a83) border-box;
          box-shadow: 0 20px 50px -12px rgba(168, 85, 247, 0.25);
          transform: scale(1.08);
          z-index: 10;
        }

        .model-card:hover {
            transform: translateY(-5px);
        }
        
        .model-card.highlight:hover {
            transform: scale(1.08) translateY(-5px);
        }

        .card-top {
          display: flex;
          align-items: center;
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
        }

        .model-stats {
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .stat-label { color: var(--color-text-tertiary); font-weight: 500; }
        .stat-val { color: var(--color-text-primary); font-weight: 600; text-align: right; }

        @media (max-width: 860px) {
           .models-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
           .model-card.highlight { transform: scale(1); }
        }
      `}</style>
    </section >
  );
};

export default ModelCompare;
