import React from "react";
import { motion } from "framer-motion";
import CustomWebGLScene from "../Effects/CustomWebGLScene";

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="hero-title"
          >
            Free, uncapped AI APIs. <br />
            <span className="text-gradient">Built for developers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hero-subtitle"
          >
            No credit card. No limits. No passwords. <br className="mobile-break" />
            Just pure intelligence.
          </motion.p>
        </div>

        <div className="hero-visual">
          <div className="visual-wrapper">
            <CustomWebGLScene />
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          padding: 80px 20px 60px;
          display: flex;
          justify-content: center;
          overflow: hidden; /* Ensure WebGL doesn't overflow */
        }

        .hero-container {
          max-width: 1200px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
          z-index: 2; /* Ensure text is above any potential overlap */
        }

        .hero-visual {
          flex: 1;
          height: 500px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end; /* Align to the right */
        }

        .visual-wrapper {
            width: 100%;
            max-width: 500px; /* Constrain width to push center towards right */
            height: 100%;
            position: relative;
            border-radius: 20px;
            overflow: hidden; 
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 24px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .badge-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          color: var(--color-text-primary);
          text-align: left;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--color-text-primary) 30%, var(--color-text-tertiary) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--color-text-secondary);
          font-weight: 400;
          text-align: left;
        }

        .mobile-break {
          display: none;
        }

        @media (max-width: 968px) {
           .hero-container {
             flex-direction: column;
             text-align: center;
           }

           .hero-content {
             max-width: 100%;
             margin-bottom: 40px;
             display: flex;
             flex-direction: column;
             align-items: center;
           }

           .hero-title, .hero-subtitle {
             text-align: center;
           }

           .hero-visual {
             width: 100%;
             height: 400px;
           }
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 40px;
          }
          
          .hero-title {
            font-size: 2.8rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .mobile-break {
            display: inline;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
