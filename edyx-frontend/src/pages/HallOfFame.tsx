import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { contributors } from '../data/contributors';
import { ArrowUpRight, ArrowLeft, Search, X } from 'lucide-react';
import Footer from '../components/Layout/Footer';


const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    Implemented: { color: '#2E7D32', bg: '#E8F5E9', label: 'SHIPPED' },
    Approved: { color: '#1565C0', bg: '#E3F2FD', label: 'APPROVED' },
    'Under Consideration': { color: '#E65100', bg: '#FFF3E0', label: 'IN REVIEW' },
};


const ContributorRow = ({ c, i, isLast }: { c: typeof contributors[0]; i: number; isLast: boolean }) => {
    const [hovered, setHovered] = useState(false);
    const hasShipped = c.contributions.some(cb => cb.status === 'Implemented');

    const handleRowClick = () => {
        if (c.profileUrl) {
            window.open(c.profileUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <motion.div
            className={`contributor-row ${isLast ? 'last-item' : ''} ${c.profileUrl ? 'clickable' : ''}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleRowClick}
        >

            {!isLast && <div className="timeline-line" />}

            <div className="row-content">

                <div className="portrait-wrapper">
                    <div className="portrait-ring">
                        <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className={`portrait-img ${hovered ? 'color' : ''}`}
                        />
                    </div>
                    {hasShipped && (
                        <motion.div
                            className="verified-badge"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300 }}
                        >
                            ✦
                        </motion.div>
                    )}
                </div>


                <div className="row-details">
                    <div className="name-row">
                        <h3 className="contributor-name">{c.name}</h3>
                    </div>


                    <div className="contributions-list">
                        {c.contributions.map((contribution, ci) => {
                            const status = statusConfig[contribution.status] || statusConfig['Under Consideration'];
                            return (
                                <div key={ci} className="contribution-item">
                                    <div className="contribution-idea-row">
                                        <p className="contributor-idea">"{contribution.idea}"</p>
                                        <span
                                            className="status-pill"
                                            style={{ background: status.bg, color: status.color }}
                                        >
                                            <span className="status-dot" style={{ background: status.color }} />
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="meta-row">
                        <span className="meta-id">ID: #{c.id.padStart(3, '0')}</span>
                        <span className="meta-contributions">{c.contributions.length} CONTRIBUTION{c.contributions.length > 1 ? 'S' : ''}</span>
                        {c.profileUrl && (
                            <span className="profile-link">
                                VIEW PROFILE
                                <ArrowUpRight size={12} />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const HallOfFame: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showGuidelines, setShowGuidelines] = useState(false);
    const { scrollYProgress } = useScroll();
    const headerY = useTransform(scrollYProgress, [0, 0.12], [0, -30]);

    const implemented = contributors.reduce((sum, c) => sum + c.contributions.filter(cb => cb.status === 'Implemented').length, 0);

    const filteredContributors = contributors.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();

        return (
            c.name.toLowerCase().includes(q) ||
            c.id === q ||
            c.id.includes(q) ||
            c.contributions.some(cb => cb.idea.toLowerCase().includes(q))
        );
    });

    return (
        <div className="hof-root">

            <div className="grain-overlay" />


            <div className="back-btn-container">
                <button onClick={() => navigate('/')} className="back-home-btn">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </button>
            </div>


            <motion.header className="hero-header" style={{ y: headerY }}>
                <div className="hero-inner">
                    <motion.div
                        className="hero-rule"
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    />

                    <motion.p
                        className="hero-volume"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        The Edyx Archive — Contributors
                    </motion.p>

                    <div className="hero-heading-row">
                        <motion.h1
                            className="hero-heading"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            Hall of{' '}
                            <br className="hero-heading-br" />
                            <span className="hero-heading-italic">Fame</span>
                        </motion.h1>

                        <motion.div
                            className="hero-decoration"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <div className="scroll-container">
                                <div className="scroll-roller scroll-roller-top">
                                    <div className="roller-end roller-end-left" />
                                    <div className="roller-bar" />
                                    <div className="roller-end roller-end-right" />
                                </div>

                                <div className="scroll-body">
                                    <div className="scroll-parchment">
                                        <div className="scroll-content">
                                            <div className="scroll-ornament">✦</div>
                                            <p className="scroll-text">
                                                We honor<br />
                                                <em>every</em><br />
                                                contribution
                                            </p>
                                            <div className="scroll-divider" />
                                            <p className="scroll-sub">Est. 2025</p>
                                            <div className="scroll-seal">
                                                <img src="/edyx-logo-white.png" alt="Edyx" className="seal-logo" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="scroll-roller scroll-roller-bottom">
                                    <div className="roller-end roller-end-left" />
                                    <div className="roller-bar" />
                                    <div className="roller-end roller-end-right" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="hero-grid"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                    >
                        <div className="hero-quote">
                            <p>"Free, uncapped AI for everyone, built by the community that believes intelligence should have no limits."</p>
                        </div>
                        <div className="hero-desc">
                            <p>
                                This archive honors the individuals who have dedicated their time and intellect
                                to building Edyx. Every idea, every contribution earns a place in history.
                            </p>
                            <button
                                className="guidelines-trigger"
                                onClick={() => setShowGuidelines(true)}
                            >
                                Read Contribution Guidelines <ArrowUpRight size={14} />
                            </button>
                        </div>
                        <div className="hero-stats-col">
                            <div className="hero-stat">
                                <span className="hero-stat-num">{contributors.length}</span>
                                <span className="hero-stat-lbl">CONTRIBUTORS</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-num">{implemented}</span>
                                <span className="hero-stat-lbl">IDEAS SHIPPED</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.header>


            <motion.div
                className="search-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                <div className="search-bar-inner">
                    <div className="search-box">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, idea, or #ID..."
                            className="search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            <main className="contributors-main">
                <div className="contributors-list-container">
                    <AnimatePresence mode="wait">
                        {filteredContributors.length === 0 ? (
                            <motion.div
                                className="empty-state"
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <p>No contributors match your search.</p>
                            </motion.div>
                        ) : (
                            filteredContributors.map((c, i) => (
                                <ContributorRow
                                    key={c.id}
                                    c={c}
                                    i={i}
                                    isLast={i === filteredContributors.length - 1}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>


                <motion.div
                    className="record-count"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p>SHOWING {filteredContributors.length} OF {contributors.length} RECORDS</p>
                </motion.div>
            </main>


            <motion.section
                className="cta-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
            >
                <div className="cta-inner">
                    <div className="cta-icon">✦</div>
                    <h2 className="cta-heading">Inscribe Your Name</h2>
                    <p className="cta-desc">
                        History is written by those who contribute. Whether it is code, design, or ideas,
                        your work belongs in the archive.
                    </p>
                    <div className="cta-actions">
                        <a
                            href="https://github.com/adityaverma9777/Edyx"
                            target="_blank"
                            rel="noreferrer"
                            className="cta-btn-primary"
                        >
                            Start Contributing
                        </a>
                        <button
                            className="cta-btn-secondary"
                            onClick={() => setShowGuidelines(true)}
                        >
                            Read Guidelines
                        </button>
                    </div>
                </div>
            </motion.section>


            <Footer />


            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

                /* Override app-level constraints */
                #root { max-width: none !important; padding: 0 !important; text-align: left !important; }

                .hof-root {
                    --paper: #fdfdfb;
                    --ink: #1a1a1a;
                    --charcoal: #333333;
                    --stone: #666666;
                    --stone-light: #999999;
                    --border: #e5e5e5;
                    --border-light: #f0f0f0;
                    --gold: #D4AF37;
                    background: var(--paper);
                    color: var(--ink);
                    font-family: 'Inter', -apple-system, sans-serif;
                    min-height: 100vh;
                    position: relative;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                }

                ::selection {
                    background-color: #e8e8e8;
                    color: #000;
                }

                /* ── Grain Overlay ── */
                .grain-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    pointer-events: none;
                    opacity: 0.3;
                    background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.5%22/%3E%3C/svg%3E');
                }

                /* ── Back Button ── */
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
                    font-family: 'Inter', sans-serif;
                }
                .back-home-btn:hover {
                    transform: translateX(-4px);
                    background: white;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
                    color: #111;
                }

                /* ── Hero ── */
                .hero-header {
                    position: relative;
                    z-index: 10;
                    padding: 160px 24px 80px;
                }
                .hero-inner {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .hero-rule {
                    height: 1px;
                    background: var(--ink);
                    margin-bottom: 32px;
                    display: none;
                }
                @media (min-width: 768px) {
                    .hero-rule { display: block; }
                }

                .hero-volume {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    color: var(--stone);
                    margin: 80px 0 28px;
                    text-align: center;
                }
                @media (min-width: 768px) {
                    .hero-volume {
                        margin: 0 0 28px;
                        text-align: left;
                    }
                }

                .hero-heading-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 24px;
                    margin-bottom: 56px;
                }
                @media (min-width: 768px) {
                    .hero-heading-row {
                        flex-direction: row;
                        justify-content: space-between;
                        gap: 40px;
                    }
                }

                .hero-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.5rem, 9vw, 8rem);
                    font-weight: 400;
                    line-height: 0.92;
                    letter-spacing: -0.02em;
                    color: var(--ink);
                    margin: 0;
                    flex-shrink: 0;
                    white-space: nowrap;
                }
                .hero-heading-br { display: none; }
                @media (min-width: 768px) {
                    .hero-heading-br { display: block; }
                    .hero-heading {
                         white-space: normal;
                         font-size: clamp(3.5rem, 9vw, 8rem);
                    }
                }
                .hero-heading-italic {
                    font-style: italic;
                    color: #b0b0b0;
                    font-weight: 300;
                }

                .hero-decoration {
                    flex-shrink: 0;
                    transform: scale(0.72);
                    transform-origin: center center;
                }
                @media (min-width: 768px) {
                    .hero-decoration {
                        transform: scale(1);
                    }
                }

                /* ── Scroll Container ── */
                .scroll-container {
                    width: 240px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.08));
                }

                /* ── Rollers ── */
                .scroll-roller {
                    display: flex;
                    align-items: center;
                    width: 260px;
                    z-index: 5;
                    position: relative;
                }
                .roller-bar {
                    flex: 1;
                    height: 16px;
                    background: linear-gradient(
                        180deg,
                        #c9a96e 0%,
                        #dfc08a 20%,
                        #f0daa8 40%,
                        #dfc08a 60%,
                        #b8944f 80%,
                        #a07d3a 100%
                    );
                    border-top: 1px solid rgba(255, 255, 255, 0.3);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
                    box-shadow:
                        0 2px 4px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }
                .roller-end {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 40% 35%,
                        #e8d29e 0%,
                        #c9a96e 40%,
                        #9a7a3c 100%
                    );
                    border: 1px solid rgba(0, 0, 0, 0.15);
                    box-shadow:
                        0 2px 4px rgba(0, 0, 0, 0.15),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                }

                /* ── Scroll Body (unroll animation) ── */
                .scroll-body {
                    width: 230px;
                    overflow: hidden;
                    animation: scroll-unroll 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
                }
                @keyframes scroll-unroll {
                    from {
                        max-height: 0;
                        opacity: 0.3;
                    }
                    to {
                        max-height: 400px;
                        opacity: 1;
                    }
                }

                .scroll-parchment {
                    background:
                        linear-gradient(
                            180deg,
                            #f5e6c8 0%,
                            #faf0dc 8%,
                            #f8ecce 50%,
                            #faf0dc 92%,
                            #f5e6c8 100%
                        );
                    border-left: 1px solid rgba(180, 150, 100, 0.25);
                    border-right: 1px solid rgba(180, 150, 100, 0.25);
                    position: relative;
                    box-shadow:
                        inset 4px 0 8px rgba(0, 0, 0, 0.04),
                        inset -4px 0 8px rgba(0, 0, 0, 0.04);
                }
                .scroll-parchment::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0.35;
                    pointer-events: none;
                    background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');
                }

                /* ── Scroll Content ── */
                .scroll-content {
                    padding: 32px 24px;
                    text-align: center;
                    position: relative;
                    z-index: 2;
                }

                .scroll-ornament {
                    font-size: 16px;
                    color: #c9a96e;
                    margin-bottom: 16px;
                    animation: ornament-fade-in 0.5s ease 1.8s both;
                    letter-spacing: 0.3em;
                }
                @keyframes ornament-fade-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }

                .scroll-text {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.35rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: #5a4a2e;
                    margin: 0;
                    animation: text-reveal 0.8s ease 1.6s both;
                }
                .scroll-text em {
                    font-style: italic;
                    color: #8b6914;
                    font-size: 1.55rem;
                }
                @keyframes text-reveal {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .scroll-divider {
                    width: 40px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #c9a96e, transparent);
                    margin: 16px auto;
                    animation: text-reveal 0.6s ease 2s both;
                }

                .scroll-sub {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.6rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #9a8560;
                    margin: 0 0 20px;
                    animation: text-reveal 0.6s ease 2.1s both;
                }

                /* Wax Seal */
                .scroll-seal {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto;
                    border-radius: 50%;
                    background: radial-gradient(circle at 40% 35%,
                        #d4453a 0%,
                        #b83230 50%,
                        #8b1a1a 100%
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow:
                        0 2px 8px rgba(139, 26, 26, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.2),
                        0 0 0 2px rgba(139, 26, 26, 0.1);
                    animation: seal-stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 2.3s both;
                }
                .seal-logo {
                    width: 24px;
                    height: 24px;
                    object-fit: contain;
                    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
                }
                @keyframes seal-stamp {
                    from { opacity: 0; transform: scale(2) rotate(-20deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }

                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                    border-top: 1px solid var(--border);
                    padding-top: 40px;
                }
                @media (min-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 4fr 5fr 2fr;
                        gap: 48px;
                    }
                }

                .hero-quote p {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 1.2rem;
                    line-height: 1.6;
                    color: var(--charcoal);
                    margin: 0;
                }

                .hero-desc p {
                    font-size: 0.9rem;
                    line-height: 1.8;
                    color: var(--stone);
                    font-weight: 300;
                    margin: 0;
                }

                .hero-stats-col {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    justify-content: flex-start;
                }
                .hero-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .hero-stat-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem;
                    font-weight: 600;
                    color: var(--ink);
                    line-height: 1;
                }
                .hero-stat-lbl {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.6rem;
                    letter-spacing: 0.15em;
                    color: var(--stone-light);
                    text-transform: uppercase;
                }

                /* ── Search Bar ── */
                .search-bar {
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    background: rgba(253, 253, 251, 0.92);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    padding: 16px 0;
                }
                .search-bar-inner {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 48px;
                    display: flex;
                    justify-content: center;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 6px;
                    width: 100%;
                    max-width: 400px;
                }
                .search-icon { color: var(--stone-light); flex-shrink: 0; }
                .search-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 0.9rem;
                    color: var(--ink);
                }
                .search-input::placeholder {
                    color: rgba(102, 102, 102, 0.5);
                }

                /* ── Contributors List ── */
                .contributors-main {
                    position: relative;
                    z-index: 10;
                    padding: 64px 24px 80px;
                }
                .contributors-list-container {
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .contributor-row {
                    position: relative;
                    padding-left: 48px;
                    padding-bottom: 56px;
                    transition: transform 0.2s ease;
                }
                .contributor-row.clickable {
                    cursor: pointer;
                }
                .contributor-row.clickable:hover {
                    transform: translateX(4px);
                }
                @media (min-width: 768px) {
                    .contributor-row { padding-left: 72px; }
                }

                .timeline-line {
                    position: absolute;
                    left: 35px;
                    top: 56px;
                    bottom: 0;
                    width: 1px;
                    background: var(--border);
                    z-index: 0;
                }
                @media (min-width: 768px) {
                    .timeline-line { left: 59px; }
                }
                .last-item .timeline-line { display: none; }

                .row-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                @media (min-width: 768px) {
                    .row-content {
                        flex-direction: row;
                        gap: 32px;
                        align-items: flex-start;
                    }
                }

                /* Portrait */
                .portrait-wrapper {
                    position: relative;
                    flex-shrink: 0;
                    z-index: 5;
                }
                .portrait-ring {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
                    background: #f5f5f5;
                }
                @media (min-width: 768px) {
                    .portrait-ring { width: 88px; height: 88px; }
                }
                .portrait-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    filter: grayscale(100%) contrast(1.1);
                    transition: filter 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                @media (max-width: 768px) {
                    .portrait-img {
                        filter: grayscale(0%) contrast(1);
                    }
                }
                .contributor-row:hover .portrait-img,
                .portrait-img.color {
                    filter: grayscale(0%) contrast(1);
                    transform: scale(1.05);
                }

                .verified-badge {
                    position: absolute;
                    right: -4px;
                    bottom: -4px;
                    width: 24px;
                    height: 24px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--gold);
                    z-index: 20;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
                }

                /* Details */
                .row-details {
                    flex-grow: 1;
                    padding-top: 4px;
                }

                .name-row {
                    display: flex;
                    flex-direction: row;
                    align-items: baseline;
                    gap: 14px;
                    margin-bottom: 16px;
                }

                .contributor-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.7rem;
                    font-weight: 400;
                    color: var(--ink);
                    margin: 0;
                    transition: all 0.3s ease;
                    line-height: 1.2;
                }
                .contributor-row:hover .contributor-name {
                    text-decoration: underline;
                    text-decoration-thickness: 1px;
                    text-underline-offset: 4px;
                    text-decoration-color: #ccc;
                }

                /* Contributions list */
                .contributions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .contribution-item {
                    /* Each contribution in the user's list */
                }

                .contribution-idea-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-left: 16px;
                    border-left: 2px solid #e0e0e0;
                }
                @media (min-width: 640px) {
                    .contribution-idea-row {
                        flex-direction: row;
                        align-items: center;
                        gap: 16px;
                    }
                }

                .contributor-idea {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 0.92rem;
                    line-height: 1.65;
                    color: var(--stone);
                    margin: 0;
                    flex: 1;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.58rem;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 100px;
                    letter-spacing: 0.06em;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .status-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    animation: pulse-status 2.5s ease-in-out infinite;
                }
                @keyframes pulse-status {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    border-top: 1px solid var(--border-light);
                    padding-top: 14px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.68rem;
                    font-variant-numeric: tabular-nums;
                    color: var(--stone);
                    letter-spacing: 0.04em;
                }
                .meta-id, .meta-contributions {
                    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                    font-size: 0.65rem;
                }

                .profile-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--stone);
                    text-decoration: none;
                    font-size: 0.65rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    margin-left: auto;
                    transition: color 0.2s;
                }
                .profile-link:hover { color: var(--ink); }
                .profile-link:hover svg {
                    transform: translate(1px, -1px);
                    transition: transform 0.2s;
                }

                .record-count {
                    text-align: center;
                    margin-top: 48px;
                    padding-top: 32px;
                    border-top: 1px solid var(--border);
                }
                .record-count p {
                    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                    font-size: 0.65rem;
                    letter-spacing: 0.12em;
                    color: var(--stone-light);
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                }
                .empty-state p {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 1.1rem;
                    color: var(--stone-light);
                }

                /* ── CTA Section ── */
                .cta-section {
                    position: relative;
                    z-index: 10;
                    background: #f8f8f6;
                    border-top: 1px solid var(--border);
                    padding: 96px 24px;
                }
                .cta-inner {
                    max-width: 680px;
                    margin: 0 auto;
                    text-align: center;
                }
                .cta-icon {
                    font-size: 1.8rem;
                    color: #ccc;
                    margin-bottom: 24px;
                    animation: gentle-float 3s ease-in-out infinite;
                }
                @keyframes gentle-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }

                .cta-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.2rem, 5vw, 3.5rem);
                    font-weight: 400;
                    color: var(--ink);
                    margin: 0 0 16px;
                    letter-spacing: -0.01em;
                }
                .cta-desc {
                    font-size: 0.95rem;
                    color: var(--stone);
                    font-weight: 300;
                    line-height: 1.7;
                    margin: 0 0 40px;
                    max-width: 520px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .cta-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: center;
                }
                @media (min-width: 640px) {
                    .cta-actions { flex-direction: row; justify-content: center; gap: 16px; }
                }
                .cta-btn-primary {
                    display: inline-block;
                    padding: 14px 36px;
                    background: var(--ink);
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: background 0.3s;
                }
                .cta-btn-primary:hover {
                    background: var(--charcoal);
                }
                .cta-btn-secondary {
                    display: inline-block;
                    padding: 14px 36px;
                    border: 1px solid #ccc;
                    color: var(--ink);
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: border-color 0.3s;
                    background: transparent;
                    cursor: pointer;
                }
                .cta-btn-secondary:hover {
                    border-color: var(--ink);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-header { padding: 100px 16px 48px; }
                    .hero-inner { padding: 0 8px; }
                    .hero-heading { margin-bottom: 36px; }
                    .search-bar-inner { padding: 0 24px; }
                    .contributor-row { padding-left: 20px; }
                    .timeline-line { left: 7px; }
                    .search-box { max-width: 100%; }
                    .cta-section { padding: 64px 24px; }
                }
            `}</style>

            <AnimatePresence>
                {showGuidelines && (
                    <motion.div
                        className="hof-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowGuidelines(false)}
                    >
                        <motion.div
                            className="guidelines-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="guidelines-header">
                                <h3>Participation Guidelines</h3>
                                <button className="guidelines-close" onClick={() => setShowGuidelines(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="guidelines-content">
                                <ul className="guidelines-list">
                                    <li>
                                        <strong>Equal Valuation</strong>
                                        <p>We value every contribution equally. There is no bias based on scope or size—whether big or small, every contribution is honored here.</p>
                                    </li>
                                    <li>
                                        <strong>Diverse Inputs</strong>
                                        <p>All forms of input are considered valid contributions: code, feature requests, bug reports, design ideas, or optimization suggestions.</p>
                                    </li>
                                    <li>
                                        <strong>Merit-Based Adoption</strong>
                                        <p>Adoption of ideas is solely at the discretion of project leads, based on genuine improvement to performance or aesthetics. Useful changes are implemented promptly.</p>
                                    </li>
                                    <li>
                                        <strong>Community-Led Design</strong>
                                        <p>Frontend overhauls are encouraged but subject to public preview and community voting. Final implementation decisions rest with the Frontend Lead, <em>Manika Kutiyal</em>.</p>
                                    </li>
                                    <li>
                                        <strong>Secure Collaboration</strong>
                                        <p>Backend optimizations are welcome, but direct access to secrets (env files, deployments) is restricted. Code reviews are handled by the Backend Lead, <em>Aditya Verma</em>.</p>
                                    </li>
                                    <li>
                                        <strong>Open Source Promise</strong>
                                        <p>This project is ego-free and open-source. The initial 4 models will remain free forever. Future changes will be communicated in advance.</p>
                                    </li>
                                    <li>
                                        <strong>Respect & Recognition</strong>
                                        <p>Whether accepted or not, every idea is respected. We honor the spirit of contribution in all its forms and every user has a place here.</p>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                /* ── Modal Styles ── */
                .hof-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .guidelines-modal {
                    background: var(--paper);
                    width: 100%;
                    max-width: 600px;
                    max-height: 85vh;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }
                .guidelines-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.5);
                }
                .guidelines-header h3 {
                    margin: 0;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    color: var(--ink);
                }
                .guidelines-close {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--stone);
                    transition: color 0.2s;
                    padding: 4px;
                    display: flex;
                }
                .guidelines-close:hover {
                    color: var(--ink);
                }
                .guidelines-content {
                    padding: 32px;
                    overflow-y: auto;
                }
                .guidelines-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .guidelines-list li strong {
                    display: block;
                    font-size: 1rem;
                    color: var(--ink);
                    margin-bottom: 6px;
                    font-family: 'Playfair Display', serif;
                }
                .guidelines-list li p {
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: var(--stone);
                }
                .guidelines-list li em {
                    color: var(--gold);
                    font-style: normal;
                    font-weight: 600;
                }

                /* Dark Mode overrides for modal */
                @media (prefers-color-scheme: dark) {
                    .guidelines-modal {
                        background: #1a1a1a;
                        /* border: 1px solid rgba(255, 255, 255, 0.1); */
                    }
                    .guidelines-header {
                        background: rgba(255, 255, 255, 0.03);
                        border-bottom-color: rgba(255, 255, 255, 0.1);
                    }
                    .guidelines-header h3 { color: #f0f0f0; }
                    .guidelines-list li strong { color: #fff; }
                    .guidelines-list li p { color: #a0a0a0; }
                }

                .guidelines-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    color: #c9a96e;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0;
                    margin-top: 16px;
                    transition: all 0.2s;
                }
                .guidelines-trigger:hover {
                    opacity: 0.8;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
};

export default HallOfFame;
