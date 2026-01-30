import React, { useRef, useEffect } from 'react';
import { Copy } from 'lucide-react';
import './LiveMonitor.css';

const LiveMonitor = ({ logs }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleCopy = () => {
        const text = logs.map(l => `[${l.videoTimestamp}] ${l.text}`).join('\n');
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="monitor-container">
            <div className="monitor-header">
                <h3>Live Output</h3>
                <button className="copy-btn" onClick={handleCopy} title="Copy All">
                    <Copy size={14} /> Copy
                </button>
            </div>
            <div className="logs-window">
                {logs.length === 0 ? (
                    <div className="empty-state">Waiting for captures...</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="log-entry">
                            <span className="log-time">[{log.videoTimestamp}]</span>
                            <span className="log-text" dir="auto">{log.text}</span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default LiveMonitor;
