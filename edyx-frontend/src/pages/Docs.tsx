import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { motion } from 'framer-motion';
import { Book, Shield, Cpu, Settings, Terminal } from 'lucide-react';

const Docs: React.FC = () => {
    return (
        <div className="docs-page">
            <Navbar />

            <main className="docs-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="docs-header"
                >
                    <h1>Documentation</h1>
                    <p>Everything you need to know about Edyx models, APIs, and policies.</p>
                </motion.div>

                <div className="docs-grid">

                    <aside className="docs-sidebar">
                        <nav>
                            <a href="#models" className="active">Models</a>
                            <a href="#personalization">Personalization</a>
                            <a href="#api">API Usage</a>
                            <a href="#usage-policy">Usage Policy</a>
                            <a href="#security">Security</a>
                        </nav>
                    </aside>


                    <div className="docs-sections">


                        <section id="models" className="doc-section">
                            <div className="section-icon"><Cpu size={24} /></div>
                            <h2>Edyx Models</h2>
                            <p>Edyx offers a suite of specialized models optimized for different use cases. Each model is accessible via the same API endpoint by specifying the <code>model</code> parameter.</p>

                            <div className="model-card">
                                <div className="card-header">
                                    <h3>Convo 2.0</h3>
                                    <span className="model-id"><code>model: "convo"</code></span>
                                </div>
                                <p>Our most capable reasoning model. Excellent for complex problem solving, coding, and nuanced conversation. It uses a larger context window and deeper reasoning chains.</p>
                                <div className="tags"><span className="tag">Complex Reasoning</span> <span className="tag">Coding</span> <span className="tag">7B Parameters</span></div>
                            </div>

                            <div className="model-card">
                                <div className="card-header">
                                    <h3>Balanced</h3>
                                    <span className="model-id"><code>model: "balanced"</code></span>
                                </div>
                                <p>The perfect middle ground between speed and intelligence. Based on Llama architecture, it serves as a reliable general-purpose assistant for drafting, summarizing, and Q&A.</p>
                                <div className="tags"><span className="tag">General Purpose</span> <span className="tag">Llama-based</span></div>
                            </div>

                            <div className="model-card">
                                <div className="card-header">
                                    <h3>Fast</h3>
                                    <span className="model-id"><code>model: "fast"</code></span>
                                </div>
                                <p>Optimized for ultra-low latency. Based on Qwen architecture, it delivers instant responses for simple queries, classifications, and chat interactions where speed is critical.</p>
                                <div className="tags"><span className="tag">Low Latency</span> <span className="tag">Real-time</span> <span className="tag">Qwen-based</span></div>
                            </div>

                            <div className="model-card">
                                <div className="card-header">
                                    <h3>Edyx-Physics</h3>
                                    <span className="model-id"><code>model: "physics"</code></span>
                                </div>
                                <p>A retrieval-grounded scientific reasoning system powered by a 630M-parameter Qwen model and a large-scale physics vector index. Ideal for physics questions, scientific explanations, and academic research.</p>
                                <div className="tags"><span className="tag">Scientific</span> <span className="tag">RAG-powered</span> <span className="tag">Physics</span> <span className="tag">Vector Index</span></div>
                            </div>
                        </section>


                        <section id="api" className="doc-section">
                            <div className="section-icon"><Terminal size={24} /></div>
                            <h2>API Reference</h2>
                            <p>Integrate Edyx directly into your applications using our simple REST API. All requests must be authenticated via a Bearer token.</p>

                            <div className="api-details">
                                <div className="endpoint-badge">POST</div>
                                <code className="endpoint-url">https://edyx-backend.onrender.com/chat/</code>
                            </div>

                            <h3>Authentication</h3>
                            <p>Include your API Key in the <code>Authorization</code> header. Keys always start with <code>edyx_live_</code>.</p>
                            <div className="code-block">
                                <pre>{`Authorization: Bearer edyx_live_a1b2c3d4...`}</pre>
                            </div>

                            <h3>Request Body</h3>
                            <p>The API accepts a JSON body with the model ID and a list of messages.</p>

                            <div className="code-block">
                                <div className="code-header">
                                    <span>cURL Example</span>
                                </div>
                                <pre>
                                    {`curl -X POST https://edyx-backend.onrender.com/chat/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "convo",
    "messages": [
      { "role": "system", "content": "You are a helpful coding assistant." },
      { "role": "user", "content": "Explain React hooks in one sentence." }
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'`}
                                </pre>
                            </div>

                            <h3>Response Format</h3>
                            <p>The API returns a standard JSON response compatible with most LLM clients.</p>
                            <div className="code-block">
                                <pre>
                                    {`{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "React hooks allow you to use state and other React features..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 15,
    "total_tokens": 39
  }
}`}
                                </pre>
                            </div>

                            <h3>Edyx-Physics API (Different Endpoint)</h3>
                            <p>The Physics model uses a specialized retrieval-augmented endpoint for scientific queries.</p>

                            <div className="api-details">
                                <div className="endpoint-badge">POST</div>
                                <code className="endpoint-url">https://edyxapi-edyx-phy.hf.space/v1/query</code>
                            </div>

                            <div className="code-block">
                                <div className="code-header">
                                    <span>Physics API - cURL Example</span>
                                </div>
                                <pre>
                                    {`curl -X POST https://edyxapi-edyx-phy.hf.space/v1/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What is Newton's second law of motion?",
    "top_k": 5,
    "max_tokens": 512
  }'`}
                                </pre>
                            </div>

                            <h4>Physics API Response Format</h4>
                            <div className="code-block">
                                <pre>
                                    {`{
  "answer": "Newton's second law states that F = ma...",
  "sources_used": 5
}`}
                                </pre>
                            </div>
                        </section>


                        <section id="personalization" className="doc-section">
                            <div className="section-icon"><Settings size={24} /></div>
                            <h2>Personalization & Settings</h2>
                            <p>You can fine-tune your API interactions using optional parameters in the request body.</p>
                            <ul className="feature-list">
                                <li><strong>System Prompts:</strong> Use the <code>system</code> role in your messages array to define the AI's persona and constraints.</li>
                                <li><strong>Temperature:</strong> Adjust creativity (0.0 to 1.0). Lower values are more deterministic, higher values are more creative. Default is <code>0.7</code>.</li>
                                <li><strong>Max Tokens:</strong> Limit the response length to save costs or ensure brevity. Default is <code>4096</code>.</li>
                            </ul>
                        </section>


                        <section id="usage-policy" className="doc-section">
                            <div className="section-icon"><Book size={24} /></div>
                            <h2>Usage Policy</h2>
                            <p>Edyx is designed for safe, productive, and creative use. By using our API, you agree to the following:</p>
                            <div className="policy-grid-layout">
                                <div className="policy-card warning">
                                    <h4>🚫 Prohibited</h4>
                                    <ul>
                                        <li>Generation of illegal, harmful, or sexually explicit content.</li>
                                        <li>Automated abuse, scraping, or spamming of the API.</li>
                                        <li>Reverse engineering or attempting to extract model weights.</li>
                                    </ul>
                                </div>
                                <div className="policy-card success">
                                    <h4>✅ Encouraged</h4>
                                    <ul>
                                        <li>Building creative apps, tools, and workflows.</li>
                                        <li>Educational validation and research.</li>
                                        <li>Commercial integration (with Enterprise plan).</li>
                                    </ul>
                                </div>
                            </div>
                        </section>


                        <section id="security" className="doc-section">
                            <div className="section-icon"><Shield size={24} /></div>
                            <h2>Security & Privacy</h2>
                            <p>Your trust is our priority. Our infrastructure is designed with a "security-first" mindset.</p>
                            <div className="security-grid">
                                <div className="sec-item">
                                    <strong>Zero Retention</strong>
                                    <p>We do not train on your API data. Chat history is transient during processing and is not stored permanently on model servers.</p>
                                </div>
                                <div className="sec-item">
                                    <strong>Indigenous Cloud</strong>
                                    <p>Models are hosted on private Hugging Face Spaces with strict isolation. No data is sent to OpenAI or Anthropic.</p>
                                </div>
                                <div className="sec-item">
                                    <strong>API Key Security</strong>
                                    <p>Keys are essentially passwords. Do not expose them in client-side code. Use a backend proxy for production apps.</p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

            </main>

            <Footer />

            <style>{`
        .docs-page {
            background: #fcfcfc;
            min-height: 100vh;
            padding-top: 100px;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            color: #1d1d1f;
        }

        .docs-header {
            text-align: center;
            margin-bottom: 60px;
            padding: 0 20px;
        }
        .docs-header h1 { font-size: 3rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 16px; }
        .docs-header p { font-size: 1.2rem; color: #666; max-width: 600px; margin: 0 auto; }

        .docs-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 60px;
            padding: 0 40px 100px;
        }

        .docs-sidebar {
            position: sticky;
            top: 120px;
            height: fit-content;
        }
        .docs-sidebar nav { display: flex; flex-direction: column; gap: 8px; }
        .docs-sidebar a {
            color: #666; text-decoration: none; font-size: 0.95rem; padding: 8px 16px;
            border-radius: 8px; transition: all 0.2s; font-weight: 500;
        }
        .docs-sidebar a:hover, .docs-sidebar a.active {
            color: #1d1d1f; background: rgba(0,0,0,0.05);
        }

        .docs-sections { display: flex; flex-direction: column; gap: 80px; }

        .doc-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.02em; }
        .doc-section p { font-size: 1.05rem; color: #444; line-height: 1.7; margin-bottom: 24px; }
        
        .section-icon { 
            width: 48px; height: 48px; background: #f5f5f7; 
            display: flex; align-items: center; justify-content: center; 
            border-radius: 12px; margin-bottom: 20px; color: #1d1d1f;
        }

        .model-card {
            background: white; border: 1px solid rgba(0,0,0,0.08);
            padding: 24px; border-radius: 16px; margin-bottom: 20px;
            transition: transform 0.2s;
        }
        .model-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .model-card h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; }
        .tags { display: flex; gap: 8px; margin-top: 16px; }
        .tag { 
            font-size: 0.75rem; font-weight: 600; padding: 4px 12px;
            background: #f5f5f7; border-radius: 100px; color: #666;
        }

        .api-details {
            display: flex; align-items: center; gap: 12px; margin: 24px 0;
            background: #1e1e1e; padding: 12px 16px; border-radius: 8px;
            width: fit-content;
        }
        .endpoint-badge {
            background: #22c55e; color: black; font-weight: 800; font-size: 0.8rem;
            padding: 4px 8px; border-radius: 4px;
        }
        .endpoint-url { color: white; font-family: monospace; font-size: 0.95rem; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .model-id { background: #f0f0f0; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; color: #666; }
        
        .policy-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
        .policy-card {
            padding: 24px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06);
        }
        .policy-card.warning { background: #fff5f5; border-color: #fecaca; }
        .policy-card.success { background: #f0fdf4; border-color: #bbf7d0; }
        
        .policy-card h4 { font-size: 1.1rem; margin-bottom: 12px; font-weight: 700; }
        .policy-card ul { padding-left: 20px; color: #444; }
        .policy-card li { margin-bottom: 8px; }

        .code-header { background: #333; padding: 8px 20px; font-size: 0.8rem; color: #bbb; border-bottom: 1px solid #444; }
        .code-block pre { padding: 20px; margin: 0; color: #a9b7c6; }


        @media (max-width: 768px) {
            .docs-grid { grid-template-columns: 1fr; }
            .docs-sidebar { display: none; } /* Hide sidebar on mobile for now */
            .security-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default Docs;
