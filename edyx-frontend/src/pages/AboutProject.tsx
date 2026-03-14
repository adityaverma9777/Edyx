import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, ArrowLeft, MessageSquare, Send, Loader2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import { formatDistanceToNow } from 'date-fns';
import { jwtDecode } from 'jwt-decode';

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://edyx-backend.onrender.com";

const getAvatarColor = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
};

interface GithubNode {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: TreeNode[];
    url?: string;
}

interface Comment {
    id: string;
    file_path: string;
    username: string;
    comment_text: string;
    created_at: string;
}

const buildTree = (nodes: GithubNode[]): TreeNode[] => {
    const root: { [key: string]: any } = {};

    nodes.forEach(node => {
        const parts = node.path.split('/');
        let currentLevel = root;

        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                    type: index === parts.length - 1 && node.type === 'blob' ? 'file' : 'folder',
                    children: {}
                };
            }
            currentLevel = currentLevel[part].children;
        });
    });

    const convertToArray = (obj: any): TreeNode[] => {
        return Object.values(obj).map((node: any) => ({
            name: node.name,
            path: node.path,
            type: node.type,
            children: Object.keys(node.children).length > 0 ? convertToArray(node.children) : undefined
        })).sort((a: TreeNode, b: TreeNode) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
    };

    return convertToArray(root);
};

const FileTreeItem = ({ item, onSelect, selectedPath, depth = 0 }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = selectedPath === item.path;

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
                            key={child.path}
                            item={child}
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
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [isLoadingCode, setIsLoadingCode] = useState(false);

    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeUsername, setActiveUsername] = useState<string | null>(null);
    const [isLoadingTree, setIsLoadingTree] = useState(true);

    // Edit state
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const token = localStorage.getItem("authToken");
        if (token) {
            setIsLoggedIn(true);
            try {
                const decoded = jwtDecode<{ email: string }>(token);
                if (decoded && decoded.email) {
                    setActiveUsername(decoded.email.split('@')[0]);
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        } else {
            setIsLoggedIn(false);
            setActiveUsername(null);
        }

        fetchGithubTree();

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchGithubTree = async () => {
        try {
            const res = await fetch('https://api.github.com/repos/adityaverma9777/Edyx/git/trees/master?recursive=1');
            const data = await res.json();
            if (data && data.tree) {
                const builtTree = buildTree(data.tree);
                setTreeData(builtTree);
            }
        } catch (error) {
            console.error('Failed to fetch tree from GitHub:', error);
        } finally {
            setIsLoadingTree(false);
        }
    };

    const handleFileSelect = async (file: TreeNode) => {
        setSelectedFile(file);
        setFileContent('');
        setIsLoadingCode(true);
        fetchComments(file.path);

        try {
            const codeRes = await fetch(`https://raw.githubusercontent.com/adityaverma9777/Edyx/master/${file.path}`);
            if (codeRes.ok) {
                const text = await codeRes.text();
                setFileContent(text);
                setTimeout(() => Prism.highlightAll(), 0);
            } else {
                setFileContent('// Failed to load file from GitHub');
            }
        } catch (error) {
            setFileContent('// Error loading file');
        } finally {
            setIsLoadingCode(false);
        }
    };

    const fetchComments = async (filePath: string) => {
        setIsLoadingComments(true);
        try {
            const res = await fetch(`${BACKEND_URL}/comments?file_path=${encodeURIComponent(filePath)}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedFile) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        setIsPosting(true);
        try {
            const res = await fetch(`${BACKEND_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    file_path: selectedFile.path,
                    comment_text: newComment.trim()
                })
            });

            if (res.ok) {
                const data = await res.json();
                setComments([...comments, data.comment]);
                setNewComment('');
            } else if (res.status === 401) {
                navigate('/login');
            }
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${BACKEND_URL}/comments/${commentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            } else {
                console.error("Failed to delete");
            }
        } catch (err) {
            console.error("DELETE error", err);
        }
    };

    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.comment_text);
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!editCommentText.trim()) return;

        const token = localStorage.getItem('authToken');
        setIsUpdating(true);
        try {
            const res = await fetch(`${BACKEND_URL}/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ comment_text: editCommentText.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setComments(comments.map(c => c.id === commentId ? { ...c, comment_text: data.comment.comment_text } : c));
                setEditingCommentId(null);
            }
        } catch (err) {
            console.error("PUT error", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getLanguageClass = (filename: string) => {
        if (!filename) return 'language-none';
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx': return 'language-jsx';
            case 'ts':
            case 'tsx': return 'language-tsx';
            case 'json': return 'language-json';
            case 'css': return 'language-css';
            case 'html': return 'language-markup';
            case 'md': return 'language-markdown';
            case 'sh': return 'language-bash';
            default: return 'language-none';
        }
    };

    if (isMobile) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#c9d1d9', padding: '20px', textAlign: 'center' }}>
                <p>This page is made for Desktop view only.</p>
            </div>
        );
    }

    return (
        <div className="about-project-container">
            <div className="about-header">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ArrowLeft size={16} />
                    <span>Back Home</span>
                </button>
                <div>
                    <h1>Explore Codebase</h1>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>
                        Live synced with GitHub. Read the code and leave comments for the community!
                    </p>
                </div>
            </div>

            <div className="explorer-layout">
                {/* LEFT PANEL */}
                <div className="panel left-panel">
                    <div className="panel-header">EXPLORER</div>
                    <div className="file-tree-content">
                        {isLoadingTree ? (
                            <div className="loading-state"><Loader2 className="spin" size={24} /></div>
                        ) : (
                            treeData.map((node) => (
                                <FileTreeItem
                                    key={node.path}
                                    item={node}
                                    onSelect={handleFileSelect}
                                    selectedPath={selectedFile?.path || ""}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* CENTER PANEL */}
                <div className="panel center-panel">
                    <div className="panel-header">
                        {selectedFile ? selectedFile.name : "Select a file to view"}
                    </div>
                    <div className="code-content">
                        {!selectedFile ? (
                            <div className="empty-state">
                                <FileCode size={48} color="#333" />
                                <p>Select a file from the explorer to view its live source code.</p>
                            </div>
                        ) : isLoadingCode ? (
                            <div className="loading-state"><Loader2 className="spin" size={32} /></div>
                        ) : (
                            <pre className="line-numbers">
                                <code className={getLanguageClass(selectedFile.name)}>
                                    {fileContent}
                                </code>
                            </pre>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL - COMMENTS */}
                <div className="panel right-panel">
                    <div className="panel-header">
                        <MessageSquare size={16} />
                        <span>COMMENTS</span>
                    </div>

                    <div className="comments-layout">
                        {selectedFile ? (
                            <>
                                <div className="comments-list">
                                    {isLoadingComments ? (
                                        <div className="loading-state"><Loader2 className="spin" size={20} /></div>
                                    ) : comments.length > 0 ? (
                                        <>
                                            {comments.map(c => (
                                                <div key={c.id} className="comment-card">
                                                    <div className="comment-header">
                                                        {c.username === 'adityaverma9777' || c.username === 'kutiyalmanika' ? (
                                                            <img src="/edyx-logo-white.png" alt="Founder" className="comment-avatar-img founder-ring" />
                                                        ) : (
                                                            <div className="comment-avatar" style={{ backgroundColor: getAvatarColor(c.username) }}>
                                                                {c.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="comment-author" style={c.username === 'adityaverma9777' || c.username === 'kutiyalmanika' ? { color: '#58a6ff' } : {}}>@{c.username}</span>
                                                        <span className="comment-time">{formatDistanceToNow(new Date(c.created_at))} ago</span>

                                                        {activeUsername === c.username && (
                                                            <div className="comment-actions">
                                                                <button onClick={() => handleStartEdit(c)} className="action-btn">Edit</button>
                                                                <button onClick={() => handleDeleteComment(c.id)} className="action-btn delete-btn">Delete</button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {editingCommentId === c.id ? (
                                                        <div className="edit-comment-area">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                className="edit-textarea"
                                                                autoFocus
                                                            />
                                                            <div className="edit-actions">
                                                                <button
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className="btn-cancel"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSaveEdit(c.id)}
                                                                    disabled={isUpdating || !editCommentText.trim()}
                                                                    className="btn-save"
                                                                >
                                                                    {isUpdating ? "Saving..." : "Save"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="comment-body">{c.comment_text}</div>
                                                    )}
                                                </div>
                                            ))}
                                            <div ref={commentsEndRef} />
                                        </>
                                    ) : (
                                        <div className="empty-state-text">
                                            No comments yet on this file. Be the first!
                                        </div>
                                    )}
                                </div>

                                <div className="comment-input-area">
                                    {isLoggedIn ? (
                                        <form onSubmit={handlePostComment} className="comment-form">
                                            <textarea
                                                placeholder="Add a comment or explanation..."
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                rows={3}
                                            />
                                            <button type="submit" disabled={isPosting || !newComment.trim()} className="post-comment-btn">
                                                {isPosting ? <Loader2 size={16} className="spin" /> : <><Send size={14} /> Post</>}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="login-prompt">
                                            <p>You must be logged in to leave a comment.</p>
                                            <button onClick={() => navigate('/login')} className="btn-login-small">Log in</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state-text" style={{ padding: '40px 20px' }}>
                                <MessageSquare size={48} color="#333" style={{ margin: '0 auto 16px', display: 'block' }} />
                                <p>Select a file to view and participate in community discussions about it.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .about-project-container {
            height: 100vh; display: flex; flex-direction: column;
            background: #0d1117; color: #c9d1d9;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;
            overflow: hidden; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000;
        }

        .about-header {
            height: 50px; display: flex; align-items: center; padding: 0 16px;
            background: #161b22; border-bottom: 1px solid #30363d; gap: 16px;
        }
        .about-header h1 { font-size: 14px; font-weight: 600; color: #c9d1d9; margin: 0; }

        .back-btn {
            display: flex; align-items: center; gap: 8px;
            background: #21262d; border: 1px solid #30363d; color: #c9d1d9;
            cursor: pointer; font-size: 12px; padding: 3px 12px; border-radius: 6px;
            height: 28px; transition: all 0.2s;
        }
        .back-btn:hover { background: #30363d; border-color: #8b949e; }

        .explorer-layout { display: flex; height: calc(100vh - 50px); width: 100%; }
        .panel { display: flex; flex-direction: column; border-right: 1px solid #30363d; }
        
        .panel-header {
            height: 35px; min-height: 35px; display: flex; align-items: center; padding: 0 16px;
            font-size: 11px; font-weight: 600; color: #8b949e; background: #161b22;
            border-bottom: 1px solid #30363d; gap: 8px; text-transform: uppercase;
        }

        /* LEFT PANEL */
        .left-panel { width: 280px; min-width: 280px; background: #0d1117; }
        .file-tree-content { flex: 1; overflow-y: auto; padding: 8px 0; }
        .file-tree-item {
            display: flex; align-items: center; padding: 4px 16px 4px 0;
            cursor: pointer; color: #c9d1d9; font-size: 13px;
            user-select: none; gap: 8px; height: 28px; white-space: nowrap; overflow: hidden;
        }
        .file-tree-item:hover { background: #161b22; }
        .file-tree-item.selected { background: #1f6feb33; color: #c9d1d9; position: relative; }
        .file-tree-item.selected:before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #f78166;
        }
        .file-tree-item .icon { display: flex; align-items: center; justify-content: center; min-width: 16px; }
        .file-tree-item .name { text-overflow: ellipsis; overflow: hidden; }
        .file-tree-item .chevron { margin-left: auto; opacity: 0.7; color: #8b949e; }

        /* CENTER PANEL */
        .center-panel { flex: 1; background: #0d1117; overflow: hidden; }
        .code-content { flex: 1; overflow: auto; position: relative; }
        pre[class*="language-"] {
            margin: 0 !important; border-radius: 0 !important; height: 100%; background: #0d1117 !important;
            font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace !important;
            font-size: 12px !important; line-height: 1.5 !important;
        }
        pre.line-numbers { padding-left: 3.8em !important; position: relative; }
        pre.line-numbers > code { display: block; width: 100%; }
        .line-numbers .line-numbers-rows {
            border-right: 1px solid #30363d !important; background: #0d1117 !important; padding-top: 1em !important;
        }
        .line-numbers-rows > span:before { color: #6e7681 !important; }

        /* RIGHT PANEL - COMMENTS */
        .right-panel { width: 340px; min-width: 340px; background: #0d1117; border-left: 1px solid #30363d; }
        .comments-layout { display: flex; flex-direction: column; height: calc(100% - 35px); }
        .comments-list {
            flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;
        }
        
        .comment-card {
            background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px 14px;
        }
        .comment-header {
            display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
        }
        .comment-avatar {
            width: 20px; height: 20px; border-radius: 50%; background: #238636;
            color: #fff; display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: bold; flex-shrink: 0;
        }
        .comment-avatar-img {
            width: 20px; height: 20px; border-radius: 50%; object-fit: contain; flex-shrink: 0; background: #000;
        }
        .founder-ring {
            box-shadow: 0 0 0 2px #d4af37;
            margin: 2px;
        }
        .comment-author { font-size: 13px; font-weight: 600; color: #c9d1d9; }
        .comment-time { font-size: 11px; color: #8b949e; margin-left: auto; }
        .comment-body { font-size: 13px; color: #e6edf3; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
        
        .comment-actions { display: flex; gap: 8px; margin-left: 8px; }
        .action-btn { background: none; border: none; font-size: 11px; color: #8b949e; cursor: pointer; padding: 0; }
        .action-btn:hover { color: #c9d1d9; text-decoration: underline; }
        .delete-btn:hover { color: #f85149; }

        .edit-comment-area { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
        .edit-textarea { 
            width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; 
            padding: 8px; color: #c9d1d9; font-size: 13px; font-family: inherit; resize: vertical; min-height: 60px;
        }
        .edit-textarea:focus { outline: none; border-color: #58a6ff; box-shadow: 0 0 0 1px #58a6ff; }
        .edit-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .btn-cancel { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 5px; padding: 4px 10px; font-size: 11px; cursor: pointer; }
        .btn-cancel:hover { background: #30363d; }
        .btn-save { background: #238636; border: 1px solid rgba(240,246,252,0.1); color: #fff; border-radius: 5px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; }
        .btn-save:hover:not(:disabled) { background: #2ea043; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .comment-input-area {
            padding: 16px; background: #161b22; border-top: 1px solid #30363d;
        }
        .comment-form { display: flex; flex-direction: column; gap: 12px; }
        .comment-form textarea {
            width: 100%; background: #0d1117; border: 1px solid #30363d;
            border-radius: 6px; padding: 10px; color: #c9d1d9; font-size: 13px;
            font-family: inherit; resize: vertical; min-height: 80px;
        }
        .comment-form textarea:focus { outline: none; border-color: #58a6ff; box-shadow: 0 0 0 1px #58a6ff; }
        
        .post-comment-btn {
            align-self: flex-end; display: flex; align-items: center; gap: 6px;
            background: #238636; color: #fff; border: 1px solid rgba(240,246,252,0.1);
            border-radius: 6px; padding: 5px 16px; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: background 0.2s; height: 32px;
        }
        .post-comment-btn:hover:not(:disabled) { background: #2ea043; }
        .post-comment-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-prompt {
            text-align: center; padding: 16px; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
        }
        .login-prompt p { font-size: 13px; color: #8b949e; margin-bottom: 12px; }
        .btn-login-small {
            background: #21262d; border: 1px solid #30363d; color: #c9d1d9;
            padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;
        }
        .btn-login-small:hover { background: #30363d; }

        .empty-state, .empty-state-text {
            color: #8b949e; text-align: center; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .empty-state-text { font-size: 13px; line-height: 1.5; }
        .loading-state {
            display: flex; justify-content: center; align-items: center; height: 100%; color: #8b949e;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Scrollbars */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; border: 2px solid #0d1117; }
        ::-webkit-scrollbar-thumb:hover { background: #8b949e; }
      `}</style>
        </div>
    );
};

export default AboutProject;
