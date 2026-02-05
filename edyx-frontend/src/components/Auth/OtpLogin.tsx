import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface OtpLoginProps {
    onLoginSuccess: (email: string, token: string) => void;
    onEmailFocus?: () => void;
    onEmailBlur?: () => void;
    onEmailChange?: (email: string) => void;
    onStepChange?: (step: "email" | "otp") => void;
}

const OtpLogin: React.FC<OtpLoginProps> = ({ onLoginSuccess, onEmailFocus, onEmailBlur, onEmailChange, onStepChange }) => {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("https://edyx-backend.onrender.com/auth/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send code");
            }

            setStep("otp");
            onStepChange?.("otp");
        } catch (err: any) {
            setError(err.message || "Failed to send code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow numbers
        if (value.length > 1) {
            
            const chars = value.split('').slice(0, 6 - index);
            const newOtp = [...otp];
            chars.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + chars.length, 5);
            document.getElementById(`otp-${nextIndex}`)?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // If current is empty, move back and delete
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                document.getElementById(`otp-${index - 1}`)?.focus();
            } else if (otp[index]) {
                
            }
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const otpCode = otp.join("");
            const response = await fetch("https://edyx-backend.onrender.com/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid Verification Code");
            }

            // Success
            onLoginSuccess(email, data.token);

        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <AnimatePresence mode="wait">
                {step === "email" ? (
                    <motion.form
                        key="email-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleEmailSubmit}
                        className="login-form"
                    >
                        <h3 className="form-title">Get Started</h3>
                        <p className="form-desc">Enter your email to sign in or create an account.</p>

                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    onEmailChange?.(e.target.value);
                                }}
                                onFocus={onEmailFocus}
                                onBlur={onEmailBlur}
                                className="nice-input"
                                required
                            />
                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? <Loader2 className="spin" size={20} /> : <ArrowRight size={20} />}
                            </button>
                        </div>
                        {error && <p className="error-text">{error}</p>}
                    </motion.form>
                ) : (
                    <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleOtpSubmit}
                        className="login-form"
                    >
                        <h3 className="form-title">Check your inbox</h3>
                        <p className="form-desc">We sent a code to <span className="email-highlight">{email}</span></p>

                        <div className="otp-grid">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="otp-input"
                                    autoFocus={idx === 0}
                                />
                            ))}
                        </div>

                        <button type="submit" className="verify-btn" disabled={isLoading || otp.includes("")}>
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </button>

                        <p className="spam-notice">
                            Check your spam folder! 🕵️‍♂️ Google hasn't discovered us yet (their loss).
                            Please mark us as <strong>Not Spam</strong> so we can stay out of the void!
                        </p>

                        <button type="button" onClick={() => {
                            setStep("email");
                            onStepChange?.("email");
                        }} className="back-btn">
                            Use a different email
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <style>{`
          .login-container {
             width: 100%;
             max-width: 400px;
             margin: 40px auto 0;
             text-align: center;
          }

          .form-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .form-desc {
            color: var(--color-text-secondary);
            font-size: 0.95rem;
            margin-bottom: 24px;
          }

          .input-group {
            position: relative;
            display: flex;
            align-items: center;
          }

          .nice-input {
            width: 100%;
            padding: 16px 50px 16px 20px;
            border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.1);
            background: white;
            font-size: 1rem;
            transition: all 0.2s;
            box-shadow: var(--shadow-sm);
          }
          .nice-input:focus {
            outline: none;
            border-color: var(--color-text-primary);
            box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
          }

          .submit-btn {
            position: absolute;
            right: 8px;
            width: 40px; 
            height: 40px;
            background: var(--color-text-primary);
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
          }
          .submit-btn:hover { transform: scale(1.05); }
          .submit-btn:disabled { opacity: 0.7; }

          .otp-grid {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-bottom: 24px;
          }

          .otp-input {
            width: 45px;
            height: 55px;
            border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.1);
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            background: white;
            transition: all 0.2s;
          }
          .otp-input:focus {
            outline: none;
            border-color: var(--color-accent-primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .verify-btn {
            width: 100%;
            padding: 16px;
            border-radius: 16px;
            background: var(--color-text-primary);
            color: white;
            font-weight: 600;
            margin-bottom: 12px;
            transition: opacity 0.2s;
          }
           .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .back-btn {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            text-decoration: underline;
          }
          
          .email-highlight { color: var(--color-text-primary); font-weight: 600; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }

          .spam-notice {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            margin-bottom: 20px;
            line-height: 1.4;
            background: #f9f9f9;
            padding: 10px;
            border-radius: 12px;
            border: 1px dashed #e5e5e5;
          }
          .spam-notice strong { color: var(--color-text-primary); }
       `}</style>
        </div>
    );
};

export default OtpLogin;
