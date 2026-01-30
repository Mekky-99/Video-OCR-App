import React from 'react';
import { Settings, Play, Pause, Download, FileJson } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ settings, setSettings, onStart, onStop, isRunning, isReady, onExportCSV, onExportJSON, hasData, onClear }) => {
    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="sidebar-content">
            <div className="sidebar-section">
                <h3><Settings size={18} /> Capture Settings</h3>

                <div className="control-group">
                    <label>Language</label>
                    <select
                        value={settings.language}
                        onChange={(e) => handleChange('language', e.target.value)}
                        className="custom-select"
                    >
                        <option value="ara">Arabic Only</option>
                        <option value="eng">English Only</option>
                        <option value="eng+ara">Arabic + English</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>Capture Interval: {settings.interval}s</label>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.interval}
                        onChange={(e) => handleChange('interval', parseInt(e.target.value))}
                        className="custom-slider"
                    />
                </div>

                <div className="control-group">
                    <label>Confidence Threshold: {settings.threshold}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.threshold}
                        onChange={(e) => handleChange('threshold', parseInt(e.target.value))}
                        className="custom-slider"
                    />
                </div>
            </div>

            <div className="sidebar-section action-section">
                {!isRunning ? (
                    <button
                        className="action-btn start-btn"
                        onClick={onStart}
                        disabled={!isReady}
                    >
                        <Play size={20} fill="currentColor" />
                        {isReady ? 'START EXTRACTION' : 'LOADING OCR...'}
                    </button>
                ) : (
                    <button
                        className="action-btn stop-btn"
                        onClick={onStop}
                    >
                        <Pause size={20} fill="currentColor" />
                        STOP
                    </button>
                )}
            </div>

            <div className="sidebar-section">
                <h3>Text Filters</h3>
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="no-empty"
                        checked={settings.noEmpty}
                        onChange={(e) => handleChange('noEmpty', e.target.checked)}
                    />
                    <label htmlFor="no-empty">Ignore empty captures</label>
                </div>
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="dedupe"
                        checked={settings.dedupe}
                        onChange={(e) => handleChange('dedupe', e.target.checked)}
                    />
                    <label htmlFor="dedupe">Remove duplicates</label>
                </div>
            </div>

            <div className="sidebar-section">
                <h3>Export Data</h3>
                <div className="button-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                        className="action-btn secondary-btn"
                        onClick={onExportCSV}
                        disabled={!hasData}
                        style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                        <Download size={16} /> CSV
                    </button>
                    <button
                        className="action-btn secondary-btn"
                        onClick={onExportJSON}
                        disabled={!hasData}
                        style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                        <FileJson size={16} /> JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
