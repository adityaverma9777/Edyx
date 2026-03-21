import React from "react";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";

const VoiceAssistantPromo: React.FC = () => {
    return (
        <section className="promo-container" onClick={() => window.location.href = '/assistant'}>
            <div className="promo-card">
                <div className="left-section">
                    <motion.div 
                        className="phone-container"
                        animate={{ 
                            rotate: [0, -10, 10, -10, 10, -5, 5, 0],
                            scale: [1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            repeatDelay: 1 
                        }}
                    >
                        <PhoneCall size={64} color="white" />
                    </motion.div>
                </div>
                
                <div className="middle-section">
                    <h3>Talk to our AI Agent</h3>
                    <p>
                        We have a tech agent to help you talk or chat and understand the platform, its functioning, 
                        and guide you about all the things related to Edyx. Check him out to get the best 
                        experience out of Edyx!
                    </p>
                </div>
                
                <div className="right-section">
                    <img 
                        src="/animoji-panda.gif" 
                        alt="Panda Assistant" 
                        className="panda-gif"
                    />
                </div>
            </div>

            <style>{`
                .promo-container {
                    padding: 80px 20px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
                    display: flex;
                    justify-content: center;
                    margin: 20px;
                    border-radius: 40px;
                    cursor: pointer;
                }

                .promo-card {
                    width: 100%;
                    max-width: 1100px;
                    background: white;
                    border-radius: 32px;
                    padding: 48px;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 48px;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .promo-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);
                }

                .left-section {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .phone-container {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3), inset 0 -4px 10px rgba(0,0,0,0.1);
                }

                .middle-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .middle-section h3 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    line-height: 1.2;
                    margin: 0;
                }

                .middle-section p {
                    font-size: 1.15rem;
                    color: var(--color-text-secondary);
                    line-height: 1.6;
                    margin: 0;
                }

                .right-section {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .panda-gif {
                    max-width: 180px;
                    height: auto;
                    object-fit: contain;
                }

                @media (max-width: 900px) {
                    .promo-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 30px;
                        padding: 40px 20px;
                    }

                    .right-section {
                        width: 100%;
                        padding: 20px;
                    }
                }
            `}</style>
        </section>
    );
};

export default VoiceAssistantPromo;
