import React from "react";
import { motion } from "framer-motion";
import { Heart, Sprout, ShieldCheck } from "lucide-react";


const BabyGrowth: React.FC = () => {
    return (
        <section className="baby-section" id="pricing">
            <div className="mission-wrapper">

                {/* free always card */}
                <div className="baby-container">
                    <div className="baby-content">
                        <h3>Free Forever. For the Builders.</h3>
                        <p>
                            We promise to always keep a <strong>generous free tier</strong>, even as we grow.
                            We believe hobbyists and students deserve a safe space to experiment—<strong>without credit cards</strong> or data privacy trade-offs.
                        </p>
                        <p>
                            Your curiosity shouldn't cost you a thing. We will always have a space for you to build, break, and create.
                            <strong>No hidden costs. No data selling. Just code.</strong>
                        </p>
                    </div>

                    <motion.div
                        className="avatar-container"
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <div className="pulse-ring blue"></div>
                        <img
                            src="/assets/memojis/free-forever.png"
                            alt="Friendly Bot"
                            className="big-memoji"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.style.background = '#e3bfc3';
                            }}
                        />
                        <div className="heart-badge blue-badge">
                            <ShieldCheck size={20} fill="white" color="white" />
                        </div>
                    </motion.div>
                </div>

                {/* initial baby phae release card */}
                <div className="baby-container">
                    <motion.div
                        className="avatar-container"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <div className="pulse-ring"></div>
                        <img
                            src="/assets/memojis/ai-memoji.webp"
                            alt="Friendly Bot"
                            className="big-memoji"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.style.background = '#e3bfc3';
                            }}
                        />
                        <div className="heart-badge">
                            <Heart size={20} fill="white" color="white" />
                        </div>
                    </motion.div>

                    <div className="baby-content">
                        <h3>Built with Heart, Growing with You.</h3>
                        <p>
                            We are a <strong>non-profit organization</strong>, driven by a passion for open AI access.
                            Right now, we're still a "baby" platform. We run on the free tiers of major providers to keep this service
                            completely <strong>free for you</strong>.
                        </p>
                        <p>
                            This means we might feel a little slow sometimes, but we are learning and growing every single day.
                            Thank you for your patience and for being part of our journey. <Sprout size={18} className="inline-icon" style={{ display: 'inline', marginBottom: -2 }} color="#16a34a" />
                        </p>
                    </div>
                </div>

            </div>

            <style>{`
                .baby-section {
                    padding: 80px 20px;
                    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
                    display: flex;
                    justify-content: center;
                    margin: 20px;
                    border-radius: 40px;
                }

                .mission-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                    width: 100%;
                    max-width: 900px;
                }

                .baby-container {
                    background: white;
                    border-radius: 32px;
                    padding: 48px;
                    display: flex;
                    align-items: center;
                    gap: 48px;
                    box-shadow: 
                        0 20px 40px -10px rgba(0,0,0,0.05),
                        0 0 0 1px rgba(0,0,0,0.02);
                    transition: transform 0.3s;
                }
                .baby-container:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);
                }

                .baby-container.reverse {
                    flex-direction: row-reverse;
                    background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%); /* Slight blue tint for fresh feel */
                    box-shadow: 
                        0 20px 40px -10px rgba(59, 130, 246, 0.1),
                        0 0 0 1px rgba(59, 130, 246, 0.05);
                }

                .avatar-container {
                    position: relative;
                    flex-shrink: 0;
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                }

                .pulse-ring {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 50%;
                    border: 2px solid rgba(221, 122, 131, 0.3);
                    animation: ringPulse 2s infinite;
                }
                .pulse-ring.blue { border-color: rgba(59, 130, 246, 0.3); }

                @keyframes ringPulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.3); opacity: 0; }
                }

                .big-memoji {
                    width: 100%; height: 100%; object-fit: cover;
                    border-radius: 50%;
                    background: #f0f0f0; 
                    position: relative;
                    z-index: 2;
                }

                .heart-badge {
                    position: absolute; bottom: 0; right: 0;
                    width: 40px; height: 40px;
                    background: #dd7a83;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 4px solid white;
                    z-index: 3;
                    animation: bounceHeart 1.5s infinite;
                }
                .heart-badge.blue-badge { background: #3B82F6; }

                @keyframes bounceHeart {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .baby-content {
                    flex: 1;
                    text-align: left;
                }

                .baby-content h3 {
                    font-size: 1.8rem;
                    color: #1d1d1f;
                    margin-bottom: 16px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .baby-content p {
                    font-size: 1.05rem;
                    color: #555;
                    line-height: 1.7;
                    margin-bottom: 16px;
                }
                .baby-content p:last-child { margin-bottom: 0; }

                @media (max-width: 768px) {
                    .baby-container, .baby-container.reverse { flex-direction: column !important; text-align: center; gap: 32px; padding: 32px; }
                    .baby-container:hover { transform: none; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); }
                    .baby-content { text-align: center; }
                    .avatar-container { width: 100px; height: 100px; }
                    .heart-badge { width: 32px; height: 32px; }
                    .baby-section { margin: 10px; border-radius: 24px; padding: 40px 16px; }
                }

                @media (max-width: 480px) {
                    .baby-container { padding: 24px; border-radius: 20px; }
                    .baby-content h3 { font-size: 1.4rem; }
                    .baby-content p { font-size: 0.95rem; }
                    .avatar-container { width: 80px; height: 80px; }
                    .heart-badge { width: 28px; height: 28px; border-width: 3px; }
                }
            `}</style>
        </section>
    );
}

export default BabyGrowth;
