import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu, Zap, MessageSquare, ArrowLeft, Key,
    BarChart2, FileText, Plus, Trash2, Copy, Check, Atom
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


type ModelType = 'fast' | 'balanced' | 'convo' | 'physics';

interface ApiKey {
    id: string;
    model: string;
    created_at: string;
    api_key_prefix: string;
    name?: string;
    total_requests?: number;
    total_tokens?: number;
}

const MODELS = [
    {
        id: 'fast' as ModelType,
        name: 'Fast',
        description: 'Response time: ~5 seconds. Optimized for chatbots and simple queries.',
        icon: Zap,
        color: '#eab308'
    },
    {
        id: 'balanced' as ModelType,
        name: 'Balanced',
        description: 'Response time: ~60 seconds. Best model, most smart. Ideal for complex reasoning.',
        icon: Cpu,
        color: '#3b82f6'
    },
    {
        id: 'convo' as ModelType,
        name: 'Convo',
        description: 'Response time: ~25 seconds. Trained specifically for natural, engaging conversations.',
        icon: MessageSquare,
        color: '#ec4899'
    },
    {
        id: 'physics' as ModelType,
        name: 'Edyx-Physics',
        description: 'Response time: ~15 seconds. Scientific reasoning with large-scale physics vector index.',
        icon: Atom,
        color: '#06b6d4'
    }
];

const Dashboard: React.FC = () => {

    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
    const [activeTab, setActiveTab] = useState<'docs' | 'keys' | 'metrics'>('docs');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [selectedKeyForMetrics, setSelectedKeyForMetrics] = useState<string | 'all'>('all');


    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
        } else {
            fetchKeys();
        }
    }, []);

    const fetchKeys = async () => {
        setIsLoadingKeys(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch("https://edyx-backend.onrender.com/keys", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setKeys(data.keys || []);
            }
        } catch (error) {
            console.error("Failed to fetch keys", error);
        } finally {
            setIsLoadingKeys(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim() || !selectedModel) return;
        setIsCreatingKey(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch("https://edyx-backend.onrender.com/keys", { // Updated to /keys to match backend mount
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newKeyName, model: selectedModel })
            });

            const data = await res.json();

            if (res.ok) {
                setGeneratedKey(data.api_key);
                fetchKeys();
                setNewKeyName('');
            } else {
                alert(data.error || "Failed to create key");
            }
        } catch (error) {
            console.error("Failed to create key", error);
            alert("Network error occurred");
        } finally {
            setIsCreatingKey(false);
        }
    };

    const handleDeleteKey = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this API key? This cannot be undone.")) return;

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`https://edyx-backend.onrender.com/keys/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchKeys();
        } catch (error) {
            console.error("Failed to delete key", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };


    const viewKeyMetrics = (keyId: string) => {
        setSelectedKeyForMetrics(keyId);
        setActiveTab('metrics');
    };



    const renderModelSelection = () => (
        <div className="model-selection">
            <header className="dash-header">
                <h2>Select a Model</h2>
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </header>

            <div className="models-grid">
                {MODELS.map(model => (
                    <motion.div
                        key={model.id}
                        className="model-card"
                        whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                        onClick={() => setSelectedModel(model.id)}
                    >
                        <div className="model-icon" style={{ background: `${model.color}20`, color: model.color }}>
                            <model.icon size={32} />
                        </div>
                        <h3>{model.name}</h3>
                        <p>{model.description}</p>
                        <div className="card-arrow"><ArrowRightIcon /></div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderModelDetails = () => {
        const model = MODELS.find(m => m.id === selectedModel);
        if (!model) return null;

        const filteredKeys = keys.filter(k => k.model === selectedModel);

        // Metrics Calculation
        let metricsKeys = filteredKeys;
        if (selectedKeyForMetrics !== 'all') {
            metricsKeys = filteredKeys.filter(k => k.id === selectedKeyForMetrics);
        }

        const totalRequests = metricsKeys.reduce((acc, k) => acc + (k.total_requests || 0), 0);
        const totalTokens = metricsKeys.reduce((acc, k) => acc + (k.total_tokens || 0), 0);

        // Find selected key name 
        const selectedKeyName = selectedKeyForMetrics !== 'all'
            ? filteredKeys.find(k => k.id === selectedKeyForMetrics)?.name
            : "All Keys";

        return (
            <div className="model-details">
                <header className="details-header">
                    <button className="back-btn" onClick={() => setSelectedModel(null)}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="header-info">
                        <model.icon size={24} color={model.color} />
                        <h2>{model.name}</h2>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                </header>

                <div className="details-tabs">
                    <Tab active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={FileText}>Documentation</Tab>
                    <Tab active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} icon={Key}>API Keys</Tab>
                    <Tab active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} icon={BarChart2}>Metrics</Tab>
                </div>

                <div className="tab-content">
                    {/* DOCUMENTATION */}
                    {activeTab === 'docs' && (
                        <div className="docs-content">
                            <h3>Integration Guide</h3>
                            <p>Connect to the <strong>{model.name}</strong> model using standard HTTP requests. Select your preferred language below.</p>

                            <CodeTabs modelId={model.id} />

                            <div className="persona-section">
                                <h3>🎭 Customizing Personas</h3>
                                <p>You can completely change how the AI behaves by setting a <code>system</code> message at the start of your conversation. This is the "Persona File" concept.</p>

                                <div className="persona-example">
                                    <h4>Example: Creating a Math Tutor</h4>
                                    <div className="code-block" style={{ marginTop: '12px' }}>
                                        <pre>{`{
  "model": "${model.id}",
  "messages": [
    { 
      "role": "system", 
      "content": "You are a helpful math tutor. You only answer in rhymes." 
    },
    { 
      "role": "user", 
      "content": "What is the square root of 144?" 
    }
  ]
}`}</pre>
                                    </div>
                                    <p className="tip-text">
                                        <strong>💡 Pro Tip:</strong> The system message should always be the <strong>first</strong> object in the <code>messages</code> array.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API KEYS */}
                    {activeTab === 'keys' && (
                        <div className="keys-content">
                            <div className="create-key-box">
                                <h3>Generate New Key (Max 10)</h3>
                                <div className="input-row">
                                    <input
                                        type="text"
                                        placeholder="Key Name (e.g. My App Prod)"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        className="key-input"
                                    />
                                    <button
                                        className="generate-btn"
                                        onClick={handleCreateKey}
                                        disabled={isCreatingKey}
                                        style={{ minWidth: '130px', justifyContent: 'center' }}
                                    >
                                        {isCreatingKey ? <LoadingSpinner /> : <><Plus size={16} /> Generate</>}
                                    </button>
                                </div>
                            </div>

                            {generatedKey && (
                                <motion.div
                                    className="new-key-display"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="warning-text">⚠️ Copy this key now. You won't see it again.</p>
                                    <div className="key-value-box">
                                        <code>{generatedKey}</code>
                                        <button onClick={() => copyToClipboard(generatedKey)}>
                                            {copiedKey === generatedKey ? <Check size={16} color="green" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <button className="close-key" onClick={() => setGeneratedKey(null)}>Done</button>
                                </motion.div>
                            )}

                            <div className="keys-list">
                                <h3>Your Keys ({filteredKeys.length}/10)</h3>
                                {isLoadingKeys ? <p>Loading...</p> : (
                                    filteredKeys.length === 0 ? <p className="empty-state">No keys generated for this model yet.</p> :
                                        filteredKeys.map(key => (
                                            <div
                                                key={key.id}
                                                className="key-item clickable"
                                                onClick={() => viewKeyMetrics(key.id)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to view metrics"
                                            >
                                                <div className="key-info">
                                                    <span className="key-name">{key.name || "Untitled"}</span>
                                                    <span className="key-prefix">{key.api_key_prefix}</span>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                                        {key.total_requests} reqs • {(key.total_tokens || 0).toLocaleString()} tokens
                                                    </div>
                                                </div>
                                                <div className="key-actions">
                                                    <span className="key-date">{new Date(key.created_at).toLocaleDateString()}</span>
                                                    <button className="delete-btn" onClick={(e) => handleDeleteKey(key.id, e)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* METRICS */}
                    {activeTab === 'metrics' && (
                        <div className="metrics-content">
                            <div className="metrics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3>Metrics: <span style={{ color: '#3b82f6' }}>{selectedKeyName}</span></h3>
                                <CustomSelect
                                    value={selectedKeyForMetrics}
                                    onChange={(val) => setSelectedKeyForMetrics(val)}
                                    options={[
                                        { id: 'all', label: 'All Keys' },
                                        ...filteredKeys.map(k => ({ id: k.id, label: `${k.name} (${k.api_key_prefix.slice(0, 8)}...)` }))
                                    ]}
                                />
                            </div>

                            <div className="stats-grid">
                                <StatCard label="Total Requests" value={totalRequests.toLocaleString()} change="Real-time" />
                                <StatCard label="Tokens Used" value={(totalTokens / 1000).toFixed(1) + 'k'} change="Real-time" />
                                <StatCard label="Avg Latency" value={model.id === 'fast' ? '~5s' : model.id === 'convo' ? '~25s' : model.id === 'physics' ? '~15s' : '~60s'} change="Est." good />
                            </div>

                            <div className="chart-section" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#1d1d1f' }}>Usage Breakdown by Key</h4>
                                {metricsKeys.length > 0 ? (
                                    <UsageChart data={metricsKeys.map(k => ({
                                        name: k.name || 'Untitled',
                                        tokens: k.total_tokens || 0,
                                        requests: k.total_requests || 0
                                    }))} />
                                ) : (
                                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No usage data available to chart.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>


            </div>
        );
    };



    return (
        <Layout>
            <div className="dashboard-container">
                <div className="glass-backdrop" />

                <AnimatePresence mode="wait">
                    {!selectedModel ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                            className="selection-wrapper"
                        >
                            {renderModelSelection()}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="details-wrapper"
                        >
                            {renderModelDetails()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .dashboard-container {
                    padding: 120px 20px 60px;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    position: relative;
                    /* Background handled globally by body, but added subtle depth here */
                }
                
                .glass-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; height: 100vh;
                    background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4), transparent 70%);
                    pointer-events: none;
                    z-index: 0;
                    will-change: transform;
                }

                .selection-wrapper, .details-wrapper {
                    width: 100%;
                    max-width: 1100px;
                    position: relative;
                    z-index: 1;
                    will-change: opacity, transform;
                }

                .dash-header, .details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 48px;
                }
                .dash-header h2, .details-header h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    color: var(--color-text-primary);
                    background: linear-gradient(135deg, #1d1d1f 60%, #434344 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .models-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 32px;
                }

                .model-card {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    padding: 40px;
                    border-radius: 32px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.8);
                    cursor: pointer;
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.5);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    will-change: transform;
                }
                .model-card:hover { 
                    transform: translateY(-8px) scale(1.01);
                    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1);
                    background: rgba(255, 255, 255, 0.85);
                }
                
                .model-icon {
                    width: 72px; height: 72px;
                    border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 28px;
                }
                .model-card h3 { 
                    font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; 
                    letter-spacing: -0.02em;
                }
                .model-card p { 
                    color: var(--color-text-secondary); 
                    line-height: 1.6; font-size: 1.05rem;
                }
                .card-arrow { 
                    position: absolute; bottom: 32px; right: 32px; 
                    opacity: 0; transform: translateX(-10px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    color: var(--color-text-primary);
                }
                .model-card:hover .card-arrow { opacity: 1; transform: translateX(0); }

                /* Details View */
                .details-header { margin-bottom: 32px; }
                .header-info { display: flex; align-items: center; gap: 20px; }
                .back-btn {
                    display: flex; align-items: center; gap: 8px;
                    background: white; border: 1px solid rgba(0,0,0,0.05);
                    padding: 8px 16px; border-radius: 100px;
                    color: var(--color-text-secondary); font-weight: 600; cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }
                .back-btn:hover { color: var(--color-text-primary); transform: translateX(-4px); }

                .logout-btn {
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px;
                    color: #ef4444;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    backdrop-filter: blur(10px);
                }
                .logout-btn:hover { background: #fef2f2; border-color: #ef4444; }

                .details-tabs {
                    display: inline-flex; 
                    background: rgba(118, 118, 128, 0.12);
                    padding: 4px; border-radius: 16px;
                    margin-bottom: 40px;
                    backdrop-filter: blur(20px);
                }
                
                .tab-content {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    padding: 48px;
                    border-radius: 32px;
                    min-height: 500px;
                    box-shadow: var(--shadow-md), inset 0 0 0 1px rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.4);
                }

                /* Documentation */
                .docs-content h3 { font-size: 1.25rem; margin-bottom: 16px; font-weight: 600; }
                .docs-content p { color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 24px; }
                .code-block {
                    background: #1e1e24; color: #f8fafc;
                    padding: 28px; border-radius: 20px;
                    overflow-x: auto;
                    margin: 32px 0;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 0.95rem;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                /* Keys */
                .create-key-box {
                    background: #f5f5f7; padding: 32px; 
                    border-radius: 24px; margin-bottom: 40px;
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .create-key-box h3 { font-size: 1.1rem; margin-bottom: 16px; }
                
                .input-row { display: flex; gap: 16px; }
                .key-input { 
                    flex: 1; padding: 16px 20px; border-radius: 14px; 
                    border: 1px solid transparent; 
                    background: white;
                    font-size: 1rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                    transition: all 0.2s;
                }
                .key-input:focus { outline: none; border-color: var(--color-text-primary); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }

                .generate-btn {
                    background: var(--color-text-primary); color: white; padding: 0 32px;
                    border-radius: 14px; font-weight: 600; font-size: 1rem;
                    display: flex; align-items: center; gap: 10px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                
                .key-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 24px; border-bottom: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.2s; border-radius: 16px;
                }
                .key-item:hover { background: rgba(0,0,0,0.02); }
                
                .key-info { display: flex; flex-direction: column; gap: 6px; }
                .key-name { font-weight: 700; color: var(--color-text-primary); font-size: 1.05rem; }
                .key-prefix { font-family: monospace; color: var(--color-text-tertiary); font-size: 0.9rem; letter-spacing: 0.05em; }
                
                .key-actions { display: flex; align-items: center; gap: 24px; }
                .key-date { color: var(--color-text-tertiary); font-size: 0.9rem; }
                .delete-btn { 
                    width: 36px; height: 36px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    color: #ef4444; background: rgba(239, 68, 68, 0.1);
                    transition: all 0.2s; border: none; cursor: pointer;
                }
                .delete-btn:hover { background: #fee2e2; transform: scale(1.05); } 
                /* Replaced rotation with simple scale bump for cleaner look */

                /* New Key Display */
                .new-key-display {
                    background: #f0fdf4; border: 1px solid #bbf7d0;
                    padding: 32px; border-radius: 20px; margin-bottom: 40px;
                    box-shadow: 0 10px 30px -5px rgba(22, 163, 74, 0.1);
                }
                .warning-text { color: #15803d; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
                
                .key-value-box {
                    display: flex; justify-content: space-between; align-items: center;
                    background: white; padding: 20px; border-radius: 12px; 
                    border: 1px dashed #22c55e;
                    font-family: monospace; font-size: 1.1rem; color: #15803d;
                }
                .close-key { 
                    margin-top: 20px; background: #15803d; color: white; border: none; 
                    padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; 
                }

                /* Metrics */
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 40px; }

                /* Mobile Styles */
                @media (max-width: 768px) {
                    .dashboard-container { padding: 100px 12px 40px; }
                    .dash-header, .details-header { 
                        flex-direction: column; 
                        gap: 16px; 
                        align-items: flex-start;
                        margin-bottom: 32px;
                    }
                    .dash-header h2, .details-header h2 { font-size: 1.8rem; }
                    .models-grid { 
                        grid-template-columns: 1fr; 
                        gap: 20px;
                    }
                    .model-card { 
                        padding: 28px; 
                        border-radius: 24px;
                    }
                    .model-card:hover { transform: none; }
                    .model-icon { width: 56px; height: 56px; margin-bottom: 20px; }
                    .model-card h3 { font-size: 1.25rem; }
                    .model-card p { font-size: 0.95rem; }
                    .card-arrow { display: none; }
                    
                    .details-tabs { 
                        width: 100%; 
                        justify-content: center;
                        margin-bottom: 24px;
                    }
                    .tab-content { 
                        padding: 24px 16px; 
                        border-radius: 20px;
                        min-height: auto;
                    }
                    
                    .create-key-box { padding: 20px; border-radius: 16px; margin-bottom: 24px; }
                    .input-row { flex-direction: column; gap: 12px; }
                    .key-input { padding: 14px 16px; }
                    .generate-btn { width: 100%; justify-content: center; padding: 14px; }
                    
                    .key-item { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        gap: 16px;
                        padding: 20px 16px;
                    }
                    .key-actions { 
                        width: 100%; 
                        justify-content: space-between;
                    }
                    
                    .new-key-display { padding: 20px; border-radius: 16px; }
                    .key-value-box { 
                        flex-direction: column; 
                        gap: 12px;
                        font-size: 0.85rem;
                        word-break: break-all;
                    }
                    
                    .stats-grid { 
                        grid-template-columns: 1fr; 
                        gap: 16px; 
                    }
                    
                    .code-block { 
                        padding: 16px; 
                        border-radius: 12px; 
                        font-size: 0.75rem;
                    }
                    .code-block pre { white-space: pre-wrap; word-break: break-all; }
                    
                    .header-info { gap: 12px; }
                    .back-btn { padding: 6px 12px; font-size: 0.85rem; }
                    .logout-btn { padding: 8px 16px; font-size: 0.9rem; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 90px 8px 32px; }
                    .dash-header h2, .details-header h2 { font-size: 1.5rem; }
                    .model-card { padding: 20px; }
                    .model-icon { width: 48px; height: 48px; border-radius: 14px; }
                    .tab-content { padding: 16px 12px; }
                    .create-key-box { padding: 16px; }
                    .code-block { font-size: 0.7rem; padding: 12px; }
                }
            `}</style>
        </Layout>
    );
};



const ArrowRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const ChevronDown = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const LoadingSpinner = () => (
    <svg className="spinner" width="20" height="20" viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
        <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .spinner circle { stroke-dasharray: 150; stroke-dashoffset: 75; }
        `}</style>
    </svg>
);

const Tab = ({ active, onClick, icon: Icon, children }: any) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 24px',
            borderRadius: '12px',
            color: active ? '#1d1d1f' : '#86868b',
            fontWeight: active ? 600 : 500,
            background: active ? 'white' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: 'none',
            fontSize: '0.95rem',
            boxShadow: active ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
    >
        <Icon size={16} strokeWidth={2.5} />
        {children}
    </button>
);

const StatCard = ({ label, value, change, good }: any) => (
    <div style={{
        background: 'white', padding: '32px', borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)'
    }}>
        <p style={{ color: '#86868b', fontSize: '0.95rem', marginBottom: '12px', fontWeight: 500 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#1d1d1f' }}>{value}</h3>
            <span style={{
                color: (good && change.startsWith('-')) || (!good && change.startsWith('+')) ? '#ef4444' : '#10b981',
                fontSize: '0.95rem', fontWeight: 700, padding: '4px 8px', borderRadius: '8px',
                background: (good && change.startsWith('-')) || (!good && change.startsWith('+')) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            }}>
                {change}
            </span>
        </div>
    </div>
);

// Dropdown
const CustomSelect = ({ options, value, onChange }: { options: { id: string, label: string }[], value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find(o => o.id === value)?.label || "Select";

    return (
        <div className="custom-select-container" style={{ position: 'relative', width: '220px' }}>
            <button
                className="select-trigger"
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={16} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="select-dropdown"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                    >
                        {options.map(opt => (
                            <div
                                key={opt.id}
                                className={`select-option ${value === opt.id ? 'selected' : ''}`}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                            >
                                {opt.label}
                                {value === opt.id && <Check size={14} color="#3b82f6" />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .select-trigger {
                    width: 100%; display: flex; justify-content: space-between; align-items: center;
                    background: white; border: 1px solid rgba(0,0,0,0.08);
                    padding: 10px 16px; border-radius: 12px;
                    font-size: 0.95rem; color: var(--color-text-primary);
                    cursor: pointer; transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                }
                .select-trigger:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
                
                .select-dropdown {
                    position: absolute; top: 100%; left: 0; right: 0;
                    background: white; border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    margin-top: 8px; z-index: 50;
                    padding: 6px; overflow: hidden;
                }
                .select-option {
                    padding: 10px 12px; border-radius: 8px;
                    font-size: 0.9rem; color: var(--color-text-secondary);
                    cursor: pointer; display: flex; justify-content: space-between; align-items: center;
                    transition: all 0.15s;
                }
                .select-option:hover { background: #f8fafc; color: var(--color-text-primary); }
                .select-option.selected { background: #eff6ff; color: #3b82f6; font-weight: 600; }
            `}</style>
        </div>
    );
};



const CodeTabs = ({ modelId }: { modelId: string }) => {
    const [lang, setLang] = useState<'curl' | 'powershell' | 'python' | 'node'>('curl');

    const isPhysics = modelId === 'physics';

    const physicsSnippets = {
        curl: `curl -X POST https://edyxapi-edyx-phy.hf.space/v1/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What is Newton'\\''s second law of motion?",
    "top_k": 5,
    "max_tokens": 512
  }'`,
        powershell: `$body = @{
    question = "What is Newton's second law of motion?"
    top_k = 5
    max_tokens = 512
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://edyxapi-edyx-phy.hf.space/v1/query" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

$response | ConvertTo-Json -Depth 10 | Out-String -Width 4096`,
        python: `import requests

url = "https://edyxapi-edyx-phy.hf.space/v1/query"
headers = {"Content-Type": "application/json"}
data = {
    "question": "What is Newton's second law of motion?",
    "top_k": 5,
    "max_tokens": 512
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
        node: `const fetch = require('node-fetch');

async function queryPhysics() {
  const response = await fetch("https://edyxapi-edyx-phy.hf.space/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "What is Newton's second law of motion?",
      top_k: 5,
      max_tokens: 512
    })
  });

  const data = await response.json();
  console.log(data);
}

queryPhysics();`
    };

    const chatSnippets = {
        curl: `curl -X POST https://edyx-backend.onrender.com/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello world!"}
    ],
    "max_tokens": 512,
    "temperature": 0.7
  }'`,
        powershell: `$apiKey = "YOUR_API_KEY"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$body = @{
    model       = "${modelId}"
    messages    = @(
        @{ role = "system"; content = "You are a helpful assistant." },
        @{ role = "user"; content = "Hello world!" }
    )
    max_tokens  = 512
    temperature = 0.7
} | ConvertTo-Json -Depth 4

$response = Invoke-RestMethod -Uri "https://edyx-backend.onrender.com/chat" -Method Post -Headers $headers -Body $body
Write-Output $response.text`,
        python: `import requests

api_key = "YOUR_API_KEY"
url = "https://edyx-backend.onrender.com/chat"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "model": "${modelId}",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello world!"}
    ],
    "max_tokens": 2048,
    "temperature": 0.7 
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
        node: `const fetch = require('node-fetch');
const apiKey = "YOUR_API_KEY";

async function chat() {
  const response = await fetch("https://edyx-backend.onrender.com/chat", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${apiKey}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "${modelId}",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello world!" }
      ],
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  const data = await response.json();
  console.log(data);
}

chat();`
    };

    const snippets = isPhysics ? physicsSnippets : chatSnippets;

    return (
        <div className="code-tabs-container">
            <div className="lang-switcher">
                {['curl', 'powershell', 'python', 'node'].map((l) => (
                    <button
                        key={l}
                        className={`lang-btn ${lang === l ? 'active' : ''}`}
                        onClick={() => setLang(l as any)}
                    >
                        {l === 'node' ? 'Node.js' : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                ))}
            </div>
            <div className="code-block snippet-block">
                <button
                    className="copy-snippet-btn"
                    onClick={() => navigator.clipboard.writeText(snippets[lang])}
                    title="Copy Code"
                >
                    <Copy size={14} />
                </button>
                <pre>{snippets[lang]}</pre>
            </div>
            <style>{`
                .code-tabs-container { margin: 24px 0 40px; }
                .lang-switcher { display: flex; gap: 8px; margin-bottom: 0; }
                .lang-btn {
                    background: rgba(0,0,0,0.05); border: none;
                    padding: 8px 16px; border-radius: 8px 8px 0 0;
                    color: var(--color-text-secondary); font-size: 0.9rem; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                }
                .lang-btn:hover { background: rgba(0,0,0,0.08); color: var(--color-text-primary); }
                .lang-btn.active { background: #1e1e24; color: #fff; }
                
                .snippet-block { 
                    margin-top: 0; border-top-left-radius: 0; 
                    position: relative;
                }
                .copy-snippet-btn {
                    position: absolute; top: 12px; right: 12px;
                    background: rgba(255,255,255,0.1); border: none;
                    color: rgba(255,255,255,0.6); padding: 6px;
                    border-radius: 6px; cursor: pointer; transition: all 0.2s;
                }
                .copy-snippet-btn:hover { background: rgba(255,255,255,0.2); color: white; }

                .persona-section { border-top: 1px solid rgba(0,0,0,0.08); padding-top: 32px; }
                .persona-example h4 { margin-top: 0; font-size: 1rem; color: #3b82f6; }
                .tip-text { margin-top: 16px; font-size: 0.95rem; background: #fffbeb; padding: 12px; border-radius: 8px; color: #92400e; border: 1px solid #fcd34d; }
            `}</style>
        </div>
    );
};

const UsageChart = ({ data }: { data: { name: string, tokens: number, requests: number }[] }) => {

    const chartData = data.map(d => ({
        name: d.name.length > 10 ? d.name.slice(0, 10) + '...' : d.name,
        Tokens: d.tokens,
        Requests: d.requests
    }));

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="Tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar yAxisId="right" dataKey="Requests" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
            <style>{`
                .chart-container { width: 100%; height: 300px; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default Dashboard;
