import React from "react";
import { CheckCircle2 } from "lucide-react";

const Trust: React.FC = () => {
  return (
    <section className="trust-section">
      <div className="trust-container">
        <h2 className="trust-title">Why Developers Trust Edyx</h2>

        <div className="trust-grid">
          <div className="trust-item">
            <CheckCircle2 color="var(--color-accent-primary)" size={24} />
            <div className="trust-content">
              <h3>No Credit Card Required</h3>
              <p>Start building without handing over sensitive payment info.</p>
            </div>
          </div>

          <div className="trust-item">
            <CheckCircle2 color="var(--color-accent-primary)" size={24} />
            <div className="trust-content">
              <h3>Transparent Usage</h3>
              <p>See exactly how many tokens you use per request.</p>
            </div>
          </div>

          <div className="trust-item">
            <CheckCircle2 color="var(--color-accent-primary)" size={24} />
            <div className="trust-content">
              <h3>Revoke Anytime</h3>
              <p>Leaked a key? Kill it instantly from your dashboard.</p>
            </div>
          </div>

          <div className="trust-item">
            <CheckCircle2 color="var(--color-accent-primary)" size={24} />
            <div className="trust-content">
              <h3>99.9% Uptime</h3>
              <p>Reliable infrastructure scaling on Cloudflare & Render.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .trust-section {
          padding: 100px 20px;
          background: #fbfbfd;
          margin: 20px;
          border-radius: 40px;
        }

        .trust-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .trust-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 50px;
          color: var(--color-text-primary);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px 60px;
        }

        .trust-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .trust-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--color-text-primary);
        }

        .trust-content p {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
           .trust-grid { grid-template-columns: 1fr; gap: 40px; }
           .trust-section { margin: 10px; border-radius: 24px; padding: 60px 20px; }
        }

        @media (max-width: 480px) {
           .trust-section { padding: 40px 16px; }
           .trust-title { font-size: 1.6rem; margin-bottom: 32px; }
           .trust-content h3 { font-size: 1rem; }
           .trust-content p { font-size: 0.9rem; }
        }
      `}</style>
    </section>
  );
};

export default Trust;
