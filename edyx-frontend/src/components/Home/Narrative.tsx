import React from "react";
import { motion } from "framer-motion";

const Narrative: React.FC = () => {
    return (
        <section className="narrative-section">
            <div className="container">
                <motion.div
                    className="narrative-content"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="narrative-heading">
                        Intelligence, <br />
                        <span className="sculpted-text">Sculpted for Code.</span>
                    </h2>
                    <p className="narrative-text">
                        We built Edyx because we were tired of "good enough" AI APIs.
                        We wanted models that understand nuance, respect context, and reason deeply—without the latency tax.
                    </p>
                    <p className="narrative-text">
                        Whether you're building a next-gen assistant or a complex data pipeline,
                        Edyx provides the cognitive infrastructure you need to scale.
                    </p>
                </motion.div>
            </div>

            <style>{`
        .narrative-section {
          padding: 120px 20px;
          background: radial-gradient(circle at 50% 50%, rgba(221, 122, 131, 0.03) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .narrative-heading {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 40px;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
        }

        .sculpted-text {
          background: linear-gradient(135deg, #1d1d1f 0%, #dd7a83 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .narrative-text {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 768px) {
           .narrative-heading { font-size: 2.5rem; }
           .narrative-text { font-size: 1.1rem; }
        }
      `}</style>
        </section>
    );
};

export default Narrative;
