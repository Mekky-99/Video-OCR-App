import React from 'react';
import './HistoryGrid.css';

const HistoryGrid = ({ history }) => {
    return (
        <div className="history-container">
            <div className="history-header">
                <h3>Recent Captures</h3>
                <span className="count-badge">{history.length}</span>
            </div>
            <div className="thumbnails-grid">
                {history.length === 0 ? (
                    <div className="empty-history">No history yet</div>
                ) : (
                    history.map(item => (
                        <div key={item.id} className="history-item">
                            <img src={item.image} alt={item.text} className="history-thumb" />
                            <div className="history-meta">
                                <span className="timestamp">{item.videoTimestamp}</span>
                                <span className={`confidence ${item.confidence < 70 ? 'low' : ''}`}>
                                    {Math.round(item.confidence)}%
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryGrid;
