import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import OtpLogin from "../components/Auth/OtpLogin";
import InteractiveEmoji from "../components/Auth/InteractiveEmoji";

const LoginPage: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [step, setStep] = useState<"email" | "otp">("email");

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleLoginSuccess = (email: string, token: string) => {
        console.log("Login Success:", email, token);
        localStorage.setItem("authToken", token);
        window.location.href = "/dashboard";
    };

    const handleEmailChange = (email: string) => {
        // Simple regex to check for valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValid(emailRegex.test(email));
    };

    return (
        <Layout>
            <div className="login-page">
                <div className="login-split-card">
                    {/* Left Side: Form */}
                    <div className="login-left">
                        <OtpLogin
                            onLoginSuccess={handleLoginSuccess}
                            onEmailFocus={() => setIsFocused(true)}
                            onEmailBlur={() => setIsFocused(false)}
                            onEmailChange={handleEmailChange}
                            onStepChange={setStep}
                        />
                    </div>

                    {/* Right Side: Emoji */}
                    <div className="login-right">
                        <div className="emoji-wrapper">
                            <InteractiveEmoji
                                mousePos={mousePos}
                                isFocused={isFocused}
                                isValid={isValid}
                                step={step}
                            />
                            {isValid && step === 'email' && <div className="happy-msg">That looks correct!</div>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .login-page {
                    min-height: 85vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    background: #fafafa;
                }
                
                .login-split-card {
                     width: 100%;
                     max-width: 900px;
                     background: white;
                     border-radius: 32px;
                     box-shadow: 0 40px 80px -20px rgba(0,0,0,0.1);
                     display: flex;
                     overflow: hidden;
                     min-height: 500px;
                }

                .login-left {
                    flex: 1;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .login-right {
                    flex: 1;
                    background: #fff5f5; /* Light pink/red background for emoji area */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 24px;
                    position: relative;
                }

                .happy-msg {
                    font-weight: 600;
                    color: #e11d48;
                    background: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.1);
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }

                @media (max-width: 768px) {
                    .login-split-card { flex-direction: column-reverse; }
                    .login-right { padding: 40px; min-height: 300px; }
                    .login-left { padding: 40px 20px; }
                }
            `}</style>
        </Layout>
    );
};

export default LoginPage;
