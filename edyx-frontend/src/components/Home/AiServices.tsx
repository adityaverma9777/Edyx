import React from "react";
import { FileText, Image, Youtube, ArrowRight } from "lucide-react";

const services = [
    {
        id: "pdf-summary",
        name: "PDF Summarizer",
        icon: <FileText size={24} />,
        desc: "Instantly summarize long complex PDFs into clear, concise notes. Perfect for students, researchers, and professionals.",
        color: "#f43f5e", // Rose
        path: "/services/pdf-summarizer"
    },
    {
        id: "icon-gen",
        name: "AI Icon Generator",
        icon: <Image size={24} />,
        desc: "Generate beautiful, customizable SVG icons directly from text prompts. Choose styles, color palettes, and download in seconds.",
        color: "#10b981", // Emerald
        path: "/services/icon-generator"
    },
    {
        id: "youtube-transcribe",
        name: "YouTube Transcriber",
        icon: <Youtube size={24} />,
        desc: "Extract perfect transcripts from any YouTube video instantly. Save time and get actionable text from long videos.",
        color: "#eab308", // Yellow
        path: "/services/youtube-transcriber"
    }
];

const AiServices: React.FC = () => {
    return (
        <section id="ai-services" className="services-section">
            <div className="section-header">
                <div className="badge">No Login Required</div>
                <h2 className="section-title">AI Services</h2>
                <p className="section-subtitle">Powerful AI tools ready to use right now. Instantly boost your productivity without an account.</p>
            </div>

            <div className="services-grid">
                {services.map((service) => (
                    <div key={service.id} className="service-card" onClick={() => window.location.href = service.path}>
                        <div className="card-top">
                            <div className="service-icon" style={{ color: service.color, background: `${service.color}15` }}>
                                {service.icon}
                            </div>
                            <h3 className="service-name">{service.name}</h3>
                        </div>

                        <p className="service-desc">{service.desc}</p>

                        <div className="go-btn-container">
                            <span className="go-text" style={{ color: service.color }}>Try Now <ArrowRight size={16} style={{ marginLeft: 4, display: 'inline' }} /></span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .services-section {
          padding: 80px 20px;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }

        .section-header {
            margin-bottom: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
        }

        .badge {
            background: rgba(34, 197, 94, 0.1);
            color: #15803d;
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-text-primary);
            line-height: 1.1;
        }
        
        .section-subtitle {
            font-size: 1.1rem;
            color: var(--color-text-secondary);
            max-width: 600px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .service-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .service-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0), rgba(0,0,0,0.02));
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .service-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
            border-color: rgba(0,0,0,0.1);
        }
        
        .service-card:hover::after {
            opacity: 1;
        }

        .card-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .service-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .service-desc {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          flex: 1;
          position: relative;
          z-index: 2;
        }
        
        .go-btn-container {
           margin-top: 10px;
           display: flex;
           justify-content: flex-start;
           position: relative;
           z-index: 2;
        }

        .go-text {
           font-weight: 700;
           font-size: 0.95rem;
           display: flex;
           align-items: center;
        }

        @media (max-width: 860px) {
           .services-grid { grid-template-columns: repeat(2, 1fr); }
           .service-card { padding: 24px; }
        }

        @media (max-width: 600px) {
           .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </section>
    );
};

export default AiServices;
