import React from "react";
import Layout from "../components/Layout/Layout";
import Hero from "../components/Home/Hero";
import ChatDemo from "../components/Home/ChatDemo";
import OtpLogin from "../components/Auth/OtpLogin";
import FeatureDeepDive from "../components/Home/FeatureDeepDive";
import PhoneMockup from "../components/Home/PhoneMockup";
import ModelCompare from "../components/Home/ModelCompare";
import Trust from "../components/Home/Trust";
import Narrative from "../components/Home/Narrative";
import MacbookMockup from "../components/Home/MacbookMockup";
import BabyGrowth from "../components/Home/BabyGrowth";

const LandingPage: React.FC = () => {
  const handleLoginSuccess = (email: string, token: string) => {
    console.log("Login Success:", email, token);

    window.location.href = "/dashboard";
  };

  return (
    <Layout>
      <div className="landing-page">
        <Hero />

        <div className="interaction-area">
          <div className="login-wrapper">
            <OtpLogin onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>

        <Narrative />

        <div style={{ height: 60 }} />

        <MacbookMockup />


        <FeatureDeepDive />

        <div className="spacer-lg" />

        <PhoneMockup />

        <ModelCompare />


        <ChatDemo />

        <div className="spacer-lg" />

  
        <BabyGrowth />

        <div className="spacer-lg" />

        <Trust />
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
        
        .spacer-lg {
           height: 100px;
           background: white;
        }
      `}</style>
    </Layout>
  );
};

export default LandingPage;
