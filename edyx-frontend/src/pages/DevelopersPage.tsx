import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Settings, GitCommit, ExternalLink, ArrowLeft } from 'lucide-react';
import Footer from '../components/Layout/Footer';

interface Commit {
    sha: string;
    commit: {
        author: {
            name: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
}

const DevelopersPage: React.FC = () => {
    const navigate = useNavigate();
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/adityaverma9777/Edyx/commits?per_page=100');
                if (response.ok) {
                    const data = await response.json();
                    setCommits(data);
                }
            } catch (error) {
                console.error('Error fetching commits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommits();
    }, []);

    const developers = [
        {
            name: "Manika Kutiyal",
            role: "Product Strategist & UX Architect",
            description: "The visionary backbone of Edyx. Manika drives the complex brainstorming and product architecture phases, defining the core logic and solving intricate user flow challenges before development begins. She orchestrates the entire platform experience, ensuring our technology solves real-world problems with intuitive elegance.",
            image: "/assets/manika.webp",
            portfolio: "https://my-portfolio-five-ashy-95.vercel.app/",
            email: "kutiyalmanika@gmail.com",
            align: "left"
        },
        {
            name: "Aditya Verma",
            role: "Software Architect",
            description: "The technical executioner of the Edyx ecosystem. Aditya translated the complex product vision into a robust reality, implementing the complete full-stack infrastructure. He engineered the backend systems, middleware, and frontend interfaces to bring the strategic roadmap to life.",
            image: "/assets/aditya.png",
            portfolio: "https://www.adityavermaworks.in/",
            email: "adityaverma9777@gmail.com",
            align: "right"
        }
    ];

    return (
        <div className="developers-page">

            <div className="tech-grid"></div>


            <div className="code-particles">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: -100,
                            opacity: 0
                        }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                    >
                        {Math.random() > 0.5 ? '0' : '1'}
                    </motion.div>
                ))}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={`hex-${i}`}
                        className="particle hex"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0
                        }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        style={{
                            left: `${Math.random() * 90}%`,
                            top: `${Math.random() * 90}%`
                        }}
                    >
                        0x{Math.floor(Math.random() * 16777215).toString(16).slice(0, 4)}
                    </motion.div>
                ))}
            </div>

            <div className="gears-container">
                <motion.div
                    className="gear large-gear"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={500} strokeWidth={0.5} opacity={0.08} />
                </motion.div>
                <motion.div
                    className="gear small-gear"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={300} strokeWidth={0.5} opacity={0.08} />
                </motion.div>
                <motion.div
                    className="gear medium-gear"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={200} strokeWidth={0.5} opacity={0.06} />
                </motion.div>
            </div>

            <div className="back-btn-container">
                <button onClick={() => navigate('/')} className="back-home-btn">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </button>
            </div>

            <div className="content-container">
                <header className="page-header">
                    <motion.div
                        className="header-decoration"
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        transition={{ delay: 0.5 }}
                    ></motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        The Minds Behind Edyx
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="subtitle"
                    >
                        Architecting Intelligence. <span className="highlight">Compiling Future.</span>
                    </motion.p>
                </header>

                <section className="cards-section">
                    <div className="cards-grid">
                        {developers.map((dev, index) => (
                            <motion.div
                                key={dev.name}
                                className={`developer-card ${dev.align}`}
                                initial={{ opacity: 0, x: dev.align === 'left' ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                onClick={() => window.open(dev.portfolio, '_blank')}
                                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
                            >
                                <div className="card-image-container">
                                    <div className="tech-overlay"></div>
                                    <img src={dev.image} alt={dev.name} className="dev-avatar" />
                                    <div className="card-overlay">
                                        <span>View Portfolio</span>
                                        <ExternalLink size={16} />
                                    </div>
                                    <div className="corner-accents">
                                        <div className="corner c-tl"></div>
                                        <div className="corner c-br"></div>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="role-badge">{dev.role}</div>
                                    <h3>{dev.name}</h3>
                                    <p className="dev-desc">{dev.description}</p>

                                    <div className="card-actions">
                                        <button
                                            className="mail-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `mailto:${dev.email}`;
                                            }}
                                        >
                                            <Mail size={18} />
                                            <span>Contact</span>
                                        </button>
                                        <button className="portfolio-link-btn">
                                            Portfolio
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="history-section">
                    <motion.div
                        className="history-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <GitCommit size={24} className="git-icon" />
                        <h2>Our Evolution Log</h2>
                    </motion.div>

                    <div className="commits-list">
                        {loading ? (
                            <div className="loading-terminal">
                                <span className="blink">{">"} Fetching origin/main...</span>
                            </div>
                        ) : (
                            commits.map((commit, i) => (
                                <motion.div
                                    key={commit.sha}
                                    className="commit-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="commit-marker"></div>
                                    <div className="commit-info">
                                        <span className="commit-message">{commit.commit.message}</span>
                                        <div className="commit-meta">
                                            <span className="commit-date">{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={commit.html_url} target="_blank" rel="noreferrer" className="commit-hash">
                                        {commit.sha.substring(0, 7)}
                                    </a>
                                </motion.div>
                            ))
                        )}
                        <div className="timeline-line"></div>
                    </div>
                </section>
            </div>

            <Footer />

            <style>{`
        .back-btn-container {
            position: absolute;
            top: 24px;
            left: 24px;
            z-index: 100;
        }

        .back-home-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(0,0,0,0.1);
            padding: 10px 20px;
            border-radius: 100px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #333;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .back-home-btn:hover {
            transform: translateX(-4px);
            background: white;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
            color: #111;
        }

        .developers-page {
          min-height: 100vh;
          background: #f8f9fa; /* Slightly cooler grey */
          position: relative;
          overflow: hidden;
          padding-top: 100px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1d1d1f;
        }
        
        /* Tech Grid Background */
        .tech-grid {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: 0;
            pointer-events: none;
        }

        .gears-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .gear {
          position: absolute;
          color: #111;
        }

        .large-gear { top: -150px; right: -150px; }
        .small-gear { bottom: 50px; left: -80px; }
        .medium-gear { top: 40%; left: 50%; opacity: 0.02; }

        .particle {
            position: absolute;
            color: rgba(59, 130, 246, 0.2);
            font-family: monospace;
            font-size: 14px;
            user-select: none;
            z-index: 0;
        }
        .particle.hex {
            font-size: 10px;
            color: rgba(16, 185, 129, 0.15);
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          padding: 0 20px 80px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 80px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .header-decoration {
            height: 4px;
            background: #3b82f6;
            margin-bottom: 20px;
            border-radius: 2px;
        }
        
        .page-header h1 {
          font-size: 3.5rem;
          margin-bottom: 16px;
          color: #111;
          letter-spacing: -0.03em;
          font-weight: 800;
        }
        
        .mono-text {
            color: #3b82f6;
            font-family: monospace;
            font-weight: 400;
            font-size: 2.5rem;
            vertical-align: middle;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #666;
          font-weight: 400;
        }
        
        .highlight {
            color: #111;
            font-weight: 600;
            position: relative;
        }
        .highlight::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; width: 100%; height: 6px;
            background: rgba(59, 130, 246, 0.1);
            z-index: -1;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          margin-bottom: 100px;
        }

        .developer-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .developer-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 4px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            opacity: 0;
            transition: opacity 0.3s;
        }
        .developer-card:hover::before { opacity: 1; }

        .card-image-container {
          height: 320px;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .tech-overlay {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(#ccc 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.3;
        }

        .dev-avatar {
          height: 85%;
          width: auto;
          object-fit: contain;
          transition: transform 0.4s ease;
          z-index: 1;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
        }

        .developer-card:hover .dev-avatar {
          transform: scale(1.08) translateY(-5px);
        }

        .card-overlay {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(17, 17, 17, 0.9);
          color: white;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 2;
          backdrop-filter: blur(4px);
        }

        .developer-card:hover .card-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        
        .corner-accents .corner {
            position: absolute;
            width: 20px; height: 20px;
            border: 2px solid rgba(0,0,0,0.1);
            transition: all 0.3s;
        }
        .c-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .c-br { bottom: 10px; right: 10px; border-left: none; border-top: none; }
        
        .developer-card:hover .c-tl { top: 15px; left: 15px; border-color: #3b82f6; }
        .developer-card:hover .c-br { bottom: 15px; right: 15px; border-color: #3b82f6; }

        .card-content {
          padding: 36px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .role-badge {
            display: inline-block;
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
            width: fit-content;
        }

        .card-content h3 {
          font-size: 2rem;
          margin-bottom: 12px;
          color: #111;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .dev-desc {
          font-size: 1.05rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 32px;
          flex-grow: 1;
        }

        .card-actions {
          display: flex;
          gap: 16px;
        }

        .mail-btn, .portfolio-link-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mail-btn {
          background: #111;
          color: white;
          border: 1px solid #111;
        }
        
        .mail-btn:hover {
          background: #333;
          border-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .portfolio-link-btn {
          background: white;
          color: #111;
          border: 1px solid #e5e5e5;
        }

        .portfolio-link-btn:hover {
          background: #f9f9f9;
          border-color: #ccc;
          transform: translateY(-2px);
        }

        /* History Section */
        .history-section {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 50px;
        }

        .history-header h2 {
          font-size: 1.8rem;
          color: #111;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .live-badge {
            background: #ef4444;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 800;
            animation: pulse 2s infinite;
        }

        .commits-list {
          position: relative;
          padding-left: 24px;
        }

        .timeline-line {
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e5e5;
          z-index: 0;
        }

        .commit-item {
          position: relative;
          z-index: 1;
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 16px 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }

        .commit-item:hover {
          transform: translateX(8px);
          border-color: #3b82f6;
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.08);
        }

        .commit-marker {
          position: absolute;
          left: -24px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 0 4px white;
          z-index: 2;
        }

        .commit-message {
          display: block;
          font-weight: 600;
          color: #111;
          margin-bottom: 6px;
          font-size: 1.05rem;
          font-family: monospace;
        }

        .commit-meta {
          font-size: 0.85rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .commit-author {
            color: #3b82f6;
            font-weight: 600;
            background: rgba(59, 130, 246, 0.05);
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .separator { color: #ccc; }

        .commit-hash {
          font-family: monospace;
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #475569;
          text-decoration: none;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .commit-hash:hover {
            background: #e2e8f0;
            color: #1e293b;
        }

        .loading-terminal {
          text-align: center;
          color: #666;
          padding: 40px;
          font-family: monospace;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .blink { animation: blink 1s infinite; }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
           .page-header h1 { font-size: 2.5rem; }
           .mono-text { font-size: 1.8rem; }
        }
      `}</style>
        </div>
    );
};

export default DevelopersPage;
