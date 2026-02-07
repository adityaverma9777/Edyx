import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectData } from '../data/projectData';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, ArrowLeft, Info } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';


const FileTreeItem = ({ item, onSelect, selectedPath, depth = 0 }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = selectedPath === item.path;


    const currentPath = item.path || item.name;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onSelect(item);
        }
    };

    return (
        <div style={{ paddingLeft: depth * 12 }}>
            <div
                onClick={handleToggle}
                className={`file-tree-item ${isSelected ? 'selected' : ''}`}
            >
                <span className="icon">
                    {item.type === 'folder' ? (
                        isOpen ? <FolderOpen size={16} color="#58a6ff" /> : <Folder size={16} color="#58a6ff" />
                    ) : (
                        <FileCode size={16} color="#8b949e" />
                    )}
                </span>
                <span className="name">{item.name}</span>
                {item.type === 'folder' && (
                    <span className="chevron">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}
            </div>

            {isOpen && item.children && (
                <div className="file-tree-children">
                    {item.children.map((child: any) => (
                        <FileTreeItem
                            key={child.name}
                            item={{ ...child, path: `${currentPath}/${child.name}` }}
                            onSelect={onSelect}
                            selectedPath={selectedPath}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AboutProject: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Simple check for mobile screen width
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (selectedFile) {
            Prism.highlightAll();
        }
    }, [selectedFile]);

    if (isMobile) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0d1117',
                color: '#c9d1d9',
                padding: '20px',
                textAlign: 'center',
                fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif'
            }}>
                <p>This page is made for Desktop view only.</p>
            </div>
        );
    }

    return (
        <div className="about-project-container">

            <div className="about-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <div>
                    <h1>Project Explorer</h1>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>
                        This panel explains what each file does. Please refer to this before contributing.
                    </p>
                </div>
            </div>

            <div className="explorer-layout">

                <div className="panel left-panel">
                    <div className="panel-header">EXPLORER</div>
                    <div className="file-tree-content">
                        {projectData.map((folder) => (
                            <FileTreeItem
                                key={folder.name}
                                item={{ ...folder, path: folder.name }}
                                onSelect={(file: any) => setSelectedFile(file)}
                                selectedPath={selectedFile ? (selectedFile.path || selectedFile.name) : ""}
                            />
                        ))}
                    </div>
                </div>


                <div className="panel center-panel">
                    <div className="panel-header">
                        {selectedFile ? selectedFile.name : "Select a file to view"}
                    </div>
                    <div className="code-content">
                        {selectedFile ? (
                            <pre className="line-numbers">
                                <code className="language-tsx">
                                    {selectedFile.content}
                                </code>
                            </pre>
                        ) : (
                            <div className="empty-state">
                                <FileCode size={48} color="#333" />
                                <p>Select a file from the explorer to view its source code.</p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="panel right-panel">
                    <div className="panel-header">
                        <Info size={16} />
                        <span>EXPLANATION</span>
                    </div>
                    <div className="explanation-content">
                        {selectedFile ? (
                            <div className="explanation-card">
                                <h3>{selectedFile.name}</h3>
                                <p className="description">{selectedFile.explanation}</p>
                            </div>
                        ) : (
                            <div className="empty-state-text">
                                <p>Select a file to see a detailed explanation of its purpose and functionality.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .about-project-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: #0d1117; /* GitHub Dark canvas */
            color: #c9d1d9; /* GitHub Dark fg */
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
            overflow: hidden;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 1000;
        }

        .about-header {
            height: 50px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            background: #161b22; /* GitHub header bg */
            border-bottom: 1px solid #30363d; /* GitHub border */
            gap: 16px;
        }

        .about-header h1 {
            font-size: 14px;
            font-weight: 600;
            color: #c9d1d9;
            margin: 0;
        }

        .back-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #21262d; /* GitHub button bg */
            border: 1px solid #30363d;
            color: #c9d1d9;
            cursor: pointer;
            font-size: 12px;
            padding: 3px 12px;
            border-radius: 6px;
            transition: all 0.2s;
            height: 28px;
            line-height: 20px;
        }

        .back-btn:hover {
            background: #30363d;
            border-color: #8b949e;
        }

        .explorer-layout {
            display: flex;
            height: calc(100vh - 50px);
            width: 100%;
        }

        .panel {
            display: flex;
            flex-direction: column;
            border-right: 1px solid #30363d;
        }

        .panel-header {
            height: 35px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-size: 12px;
            font-weight: 600;
            color: #8b949e; /* GitHub muted text */
            background: #161b22; /* GitHub sub-header */
            border-bottom: 1px solid #30363d;
            text-transform: none; /* GitHub doesn't uppercase usually, but VS Code does. Keeping mix logic or stick to GitHub? GitHub uses "Files" in headers. */
            gap: 8px;
        }

        /* LEFT PANEL */
        .left-panel {
            width: 280px;
            min-width: 280px;
            background: #0d1117;
        }

        .file-tree-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        }

        .file-tree-item {
            display: flex;
            align-items: center;
            padding: 4px 16px 4px 0;
            cursor: pointer;
            color: #c9d1d9;
            font-size: 13px;
            transition: background 0.1s;
            user-select: none;
            gap: 8px;
            height: 32px;
        }

        .file-tree-item:hover {
            background: #161b22;
        }

        .file-tree-item.selected {
            background: #1f6feb33; /* Selected item bg (blue tint) */
            color: #c9d1d9;
            position: relative;
        }
        
        .file-tree-item.selected:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #f78166; /* Orange accent bar */
        }

        .file-tree-item .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 16px;
        }
        
        .file-tree-item .chevron {
             margin-left: auto;
             opacity: 0.7;
             color: #8b949e;
        }

        /* CENTER PANEL */
        .center-panel {
            flex: 1;
            background: #0d1117;
            overflow: hidden;
        }

        .code-content {
            flex: 1;
            overflow: auto;
            position: relative;
        }

        /* Override Prism styles for better fit */
        pre[class*="language-"] {
            margin: 0 !important;
            border-radius: 0 !important;
            height: 100%;
            background: #0d1117 !important; /* GitHub canvas */
            font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
        }

        .empty-state {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8b949e;
            gap: 16px;
        }

        /* Line Numbers Overrides */
        pre.line-numbers {
            padding-left: 3.8em !important;
            position: relative;
        }
        
        pre.line-numbers > code {
            display: block;
            width: 100%;
        }

        .line-numbers .line-numbers-rows {
            border-right: 1px solid #30363d !important;
            background: #0d1117 !important;
            padding-top: 1em !important; /* Align with code */
        }
        
        .line-numbers-rows > span:before {
            color: #6e7681 !important; /* GitHub line number color */
        }

        /* RIGHT PANEL */
        .right-panel {
            width: 320px;
            min-width: 320px;
            background: #0d1117;
            border-left: 1px solid #30363d;
        }
        
        .explanation-content {
            padding: 24px;
        }

        .explanation-card {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
        }

        .explanation-card h3 {
            margin-top: 0;
            color: #58a6ff; /* GitHub Blue */
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;
            border-bottom: 1px solid #30363d;
            padding-bottom: 8px;
        }

        .explanation-card .description {
            line-height: 1.6;
            color: #c9d1d9;
            font-size: 13px;
        }

        .empty-state-text {
            color: #8b949e;
            text-align: center;
            margin-top: 40px;
            font-size: 13px;
            line-height: 1.5;
        }

        /* Scrollbars - matching GitHub dark */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #30363d;
            border-radius: 10px;
            border: 2px solid #0d1117; /* Creates padding effect */
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #8b949e;
        }

      `}</style>
        </div>
    );
};

export default AboutProject;
