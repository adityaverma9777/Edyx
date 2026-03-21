import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Layout from "../components/Layout/Layout";
import Hero from "../components/Home/Hero";
import OtpLogin from "../components/Auth/OtpLogin";
import PhoneMockup from "../components/Home/PhoneMockup";
import Narrative from "../components/Home/Narrative";
import MacbookMockup from "../components/Home/MacbookMockup";
import AiApiModels from "../components/Home/AiApiModels";
import AiServices from "../components/Home/AiServices";
import WhyChooseEdyx from "../components/Home/WhyChooseEdyx";
import BabyGrowth from "../components/Home/BabyGrowth";
import Trust from "../components/Home/Trust";
import VoiceAssistantPromo from "../components/Home/VoiceAssistantPromo";

const LandingPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (email: string, token: string) => {
    console.log("Login Success:", email, token);
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
  };

  return (
    <Layout>
      <div className="landing-page">
        <Hero />

        <div className="interaction-area">
          <div className="login-wrapper">
            {isLoggedIn ? (
              <div className="dashboard-prompt">
                <div className="prompt-content">
                  <h3>Welcome back!</h3>
                  <p>You're already signed in to Edyx.</p>
                  <button
                    className="go-dashboard-btn"
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <OtpLogin onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        </div>

        <Narrative />

        <div style={{ height: 60 }} />

        <MacbookMockup />

        <div className="spacer-md" />

        <AiApiModels />

        <div className="spacer-md" />

        <AiServices />

        <div className="spacer-md" />

        <WhyChooseEdyx />

        <div className="spacer-lg" />

        <PhoneMockup />

        <BabyGrowth />

        <Trust />

        <VoiceAssistantPromo />

      </div>

      <style>{`
        .landing-page {
          padding-bottom: 0px;
        }

        .interaction-area {
          margin-top: -20px;
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding: 0 20px;
          margin-bottom: 100px;
        }

        .login-wrapper {
          display: flex;
          justify-content: center;
        }
        
        .dashboard-prompt {
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          animation: fadeIn 0.5s ease-out;
        }

        .prompt-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }

        .prompt-content p {
          color: var(--color-text-secondary);
          margin-bottom: 32px;
          font-size: 0.95rem;
        }

        .go-dashboard-btn {
          width: 100%;
          padding: 16px;
          background: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.05rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .go-dashboard-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spacer-lg {
           height: 100px;
           background: white;
        }
        
        .spacer-md {
           height: 60px;
           background: transparent;
        }
      `}</style>
    </Layout>
  );
};

export default LandingPage;
