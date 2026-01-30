import React, { useState, useRef } from 'react';
import './App.css';
import { Activity, X, BarChart2 } from 'lucide-react';
import VideoUploader from './components/VideoUploader';
import VideoPlayer from './components/VideoPlayer';
import RegionSelector from './components/RegionSelector';
import Sidebar from './components/Sidebar';
import LiveMonitor from './components/LiveMonitor';
import HistoryGrid from './components/HistoryGrid';
import { useVideoOCR } from './hooks/useVideoOCR';
import { downloadCSV, downloadJSON } from './utils/exportUtils';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  // eslint-disable-next-line
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [captureRegion, setCaptureRegion] = useState(null);

  // App Settings State
  const [settings, setSettings] = useState({
    language: 'eng+ara',
    interval: 3,
    threshold: 70,
    noEmpty: true,
    dedupe: true,
    isRunning: false,
    region: null // Will be synced with captureRegion
  });

  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);

  // Hook handles OCR Logic
  // We sync captureRegion to settings.region just before processing or reactively
  // Better to pass captureRegion directly to hook if it changes often?
  // Our hook takes 'settings' object. Let's make sure we pass the latest region.

  const hookSettings = { ...settings, region: captureRegion };
  const { logs, history, stats, isReady, clearSession } = useVideoOCR(videoRef, hookSettings);

  const handleVideoUpload = (file, url) => {
    setVideoFile(file);
    setVideoUrl(url);
  };

  const handleCloseVideo = () => {
    setSettings(prev => ({ ...prev, isRunning: false }));
    setVideoFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setCaptureRegion(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const handleStart = () => {
    if (!captureRegion) {
      alert("Please select a capture region first.");
      return;
    }
    setSettings(prev => ({ ...prev, isRunning: true }));
  };

  const handleStop = () => {
    setSettings(prev => ({ ...prev, isRunning: false }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <Activity className="icon-logo" size={24} color="var(--color-accent)" />
          <h1>Video OCR <span className="highlight">Extract</span></h1>
        </div>
      </header>

      <main className="main-grid">
        <div className="left-panel">
          <div className="video-section" ref={videoContainerRef}>
            {!videoUrl ? (
              <VideoUploader onVideoUpload={handleVideoUpload} />
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                <VideoPlayer
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                />
                <RegionSelector
                  containerRef={videoContainerRef}
                  onRegionChange={setCaptureRegion}
                />
                <button className="close-video-btn" onClick={handleCloseVideo}>
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="system-status-placeholder" style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-panel)' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>CAPTURES</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.totalCaptures}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>DETECTED</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.successful}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>EMPTY</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>{stats.empty}</p>
              </div>
            </div>
            <div>
              <BarChart2 size={24} color="var(--color-accent)" />
            </div>
          </div>
        </div>

        <div className="right-panel">
          <aside className="settings-sidebar" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <Sidebar
              settings={settings}
              setSettings={setSettings}
              onStart={handleStart}
              onStop={handleStop}
              isRunning={settings.isRunning}
              isReady={isReady && videoUrl}
              hasData={history.length > 0}
              onExportCSV={() => downloadCSV(history)}
              onExportJSON={() => downloadJSON(history)}
              onClear={() => {
                if (window.confirm('Are you sure you want to clear all data?')) {
                  clearSession();
                }
              }}
            />
          </aside>

          <div className="monitor-section">
            <LiveMonitor logs={logs} />
          </div>

          <div className="history-section">
            <HistoryGrid history={history} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
