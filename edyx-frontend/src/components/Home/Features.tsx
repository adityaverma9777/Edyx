import React from "react";
import { motion } from "framer-motion";
import { Unlock, ShieldCheck, BarChart3, Cloud } from "lucide-react";

const features = [
  {
    icon: <Unlock size={24} />,
    title: "Uncapped & Free",
    desc: "No credit card required. Generate keys and start building instantly without hitting paywalls.",
    delay: 0
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "OTP-Based Login",
    desc: "Secure, passwordless authentication. Your email is your only key.",
    delay: 0.1
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Deep Analytics",
    desc: "Track every token and request alongside model latency in real-time.",
    delay: 0.2
  },
  {
    icon: <Cloud size={24} />,
    title: "Multi-Model API",
    desc: "Switch between Convo, Balanced, and Fast models with a single parameter.",
    delay: 0.3
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="features-section">
      <div className="section-header">
        <h2 className="section-title">Built for builders.</h2>
        <p className="section-subtitle">Everything you need to power your next big idea.</p>
      </div>

      <div className="features-grid">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: feature.delay }}
          >
            <div className="icon-wrapper">
              {feature.icon}
            </div>
            <h3 className="card-title">{feature.title}</h3>
            <p className="card-desc">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <style>{`
        .features-section {
          padding: 100px 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 1.15rem;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .feature-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: flex-start; /* Left align for premium feel */
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(221, 122, 131, 0.4);
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: var(--surface-secondary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-primary);
          margin-bottom: 20px;
          transition: all 0.3s;
        }

        .feature-card:hover .icon-wrapper {
            background: linear-gradient(135deg, #dd7a83, #e3bfc3);
            color: white;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text-primary);
        }

        .card-desc {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
           .section-title { font-size: 2rem; }
           .features-grid { grid-template-columns: 1fr; }
           .feature-card { align-items: center; text-align: center; }
        }
      `}</style>
    </section>
  );
};

export default Features;
