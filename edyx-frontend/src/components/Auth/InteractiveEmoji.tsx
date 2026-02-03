import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface InteractiveEmojiProps {
    isFocused: boolean;
    isValid: boolean;
    mousePos: { x: number; y: number };
    step?: "email" | "otp";
}

const InteractiveEmoji: React.FC<InteractiveEmojiProps> = ({ isFocused, isValid, mousePos, step = "email" }) => {
    const faceRef = useRef<HTMLDivElement>(null);
    const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Stop tracking if valid (Happy state logic) or in OTP step (Shy/Hidden logic)
        if (!faceRef.current || isValid || step === "otp") return;

        // Calculate eye movement limited to a radius
        const rect = faceRef.current.getBoundingClientRect();
        const faceCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        const dx = mousePos.x - faceCenter.x;
        const dy = mousePos.y - faceCenter.y;

        // Limit movement
        const maxDist = 15;
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 100); // Input distance
        const eyeDist = (dist / 100) * maxDist; // Map to eye movement

        setEyePos({
            x: Math.cos(angle) * eyeDist,
            y: Math.sin(angle) * eyeDist
        });

    }, [mousePos]);

    // Override eye position if focused on input
    const currentEyePos = isFocused
        ? { x: -8, y: 12 } // Look down-left towards input
        : eyePos;

    return (
        <div className="emoji-container" ref={faceRef}>
            <motion.div
                className="emoji-face"
                animate={{
                    backgroundColor: isValid ? "#FECaca" : "#FFE4E6", // Pinkish blush when valid
                    scale: isValid ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* Eyes Container */}
                <motion.div
                    className="eyes-row"
                    animate={{
                        opacity: step === "otp" ? 0 : 1,
                        scale: step === "otp" ? 0.8 : 1
                    }}
                    transition={{
                        opacity: { delay: 0.4, duration: 0.1 }, // Hide after glasses drop
                        scale: { duration: 0.3 }
                    }}
                >
                    {/* Left Eye */}
                    <motion.div className="eye-bg">
                        <motion.div
                            className="pupil"
                            animate={{ x: currentEyePos.x, y: currentEyePos.y }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        {isValid && (
                            <motion.div
                                className="happy-curve"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                            />
                        )}
                    </motion.div>

                    {/* Right Eye */}
                    <motion.div className="eye-bg">
                        <motion.div
                            className="pupil"
                            animate={{ x: currentEyePos.x, y: currentEyePos.y }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        {isValid && (
                            <motion.div
                                className="happy-curve"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                            />
                        )}
                    </motion.div>
                </motion.div>

                {/* Mouth */}
                <motion.div
                    className="mouth"
                    animate={{
                        height: step === "otp" ? 12 : (isValid ? 40 : 10),
                        width: step === "otp" ? 40 : (isValid ? 60 : 20),
                        borderRadius: step === "otp" ? "0 0 10px 30px" : (isValid ? "0 0 40px 40px" : "20px"),
                        y: step === "otp" ? 2 : (isValid ? 5 : 0),
                        x: step === "otp" ? 5 : 0, // Slight offset for smirk
                        rotate: step === "otp" ? -5 : 0
                    }}
                />

                {/* Savage Glasses (Deal with it) for OTP */}
                {step === "otp" && (
                    <>
                        <motion.div
                            className="glasses-container"
                            initial={{ y: -200, opacity: 0, rotate: -20 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                        >
                            <div className="glasses-lens left"></div>
                            <div className="glasses-bridge"></div>
                            <div className="glasses-lens right"></div>
                        </motion.div>

                        <motion.div
                            className="blind-text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -45 }} /* Floating above head */
                            transition={{ delay: 0.8 }}
                        >
                            I'm blind now 🕶️
                        </motion.div>
                    </>
                )}

                {/* Blush */}
                <motion.div className="blush left" animate={{ opacity: isValid ? 1 : 0 }} />
                <motion.div className="blush right" animate={{ opacity: isValid ? 1 : 0 }} />

            </motion.div>

            <style>{`
                .emoji-container {
                    width: 200px;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .emoji-face {
                    width: 160px;
                    height: 160px;
                    background-color: #fca5a5; /* Base Red/Pink */
                    border-radius: 50%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 
                        0 20px 40px -10px rgba(252, 165, 165, 0.5),
                        inset 0 -10px 20px rgba(0,0,0,0.1);
                    gap: 20px;
                }

                .eyes-row {
                    display: flex;
                    gap: 30px;
                    z-index: 2;
                }

                .eye-bg {
                    width: 36px;
                    height: 48px;
                    background: white;
                    border-radius: 50%;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
                }

                .pupil {
                    width: 14px;
                    height: 14px;
                    background: #1d1d1f;
                    border-radius: 50%;
                }

                .mouth {
                    background: #1d1d1f;
                    border-radius: 20px;
                    transform-origin: center;
                }

                .blush {
                    position: absolute;
                    width: 30px;
                    height: 15px;
                    background: rgba(255, 0, 0, 0.2);
                    border-radius: 50%;
                    top: 100px;
                }
                .blush.left { left: 20px; }
                .blush.right { right: 20px; }

                /* Happy Eye Curve (Masking for squint) - Simplified as overlay */
                .happy-curve {
                    position: absolute;
                    bottom: -50%;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #fca5a5; /* Match face */
                    border-radius: 50%;
                    transform-origin: bottom;
                }

                /* Savage Glasses */
                .glasses-container {
                    position: absolute;
                    top: 50px; /* Align with eyes */
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20;
                    pointer-events: none;
                }
                .glasses-lens {
                    width: 45px;
                    height: 25px;
                    background: #000;
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                    position: relative;
                }
                .glasses-lens::after {
                    content: '';
                    position: absolute;
                    top: 5px; 
                    right: 8px;
                    width: 10px; height: 3px;
                    background: rgba(255,255,255,0.3);
                }
                .glasses-bridge {
                    width: 20px;
                    height: 5px;
                    background: #000;
                    margin-top: -20px;
                }
                
                /* Caption */
                .blind-text {
                    position: absolute;
                    top: 0;
                    background: #1d1d1f;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                    z-index: 30;
                }
                .blind-text::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 6px 6px 0;
                    border-style: solid;
                    border-color: #1d1d1f transparent transparent transparent;
                }
            `}</style>
        </div>
    );
};

export default InteractiveEmoji;
