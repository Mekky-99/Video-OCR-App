import { useState, useEffect, useRef, useCallback } from 'react';
import { useTesseract } from './useTesseract';
import { get, set, clear } from 'idb-keyval';

const DB_KEY = 'ocr_session_data';

export const useVideoOCR = (videoRef, settings) => {
    const { interval = 3, threshold = 70, language = 'eng+ara', isRunning, region, noEmpty = true, dedupe = true } = settings;
    const { isReady, recognize } = useTesseract(language);

    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ totalCaptures: 0, successful: 0, empty: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const intervalRef = useRef(null);
    const lastTextRef = useRef('');

    // Load session on mount
    useEffect(() => {
        const loadSession = async () => {
            try {
                const session = await get(DB_KEY);
                if (session) {
                    setLogs(session.logs || []);
                    setHistory(session.history || []);
                    setStats(session.stats || { totalCaptures: 0, successful: 0, empty: 0 });
                }
            } catch (e) {
                console.error("Failed to load session", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSession();
    }, []);

    // Save session periodically (every 5 seconds if changed)
    useEffect(() => {
        if (!isLoaded) return;

        const saveInterval = setInterval(() => {
            if (logs.length > 0) {
                set(DB_KEY, { logs, history, stats });
            }
        }, 5000); // Auto-save every 5s

        return () => clearInterval(saveInterval);
    }, [logs, history, stats, isLoaded]);

    // Clear session wrapper
    const clearSession = async () => {
        await clear();
        setLogs([]);
        setHistory([]);
        setStats({ totalCaptures: 0, successful: 0, empty: 0 });
        lastTextRef.current = '';
    };

    const captureFrame = useCallback(async () => {
        if (!videoRef.current || !region || !isReady || isProcessing) return;

        setIsProcessing(true);
        const video = videoRef.current;

        // Canvas setup
        const rect = video.getBoundingClientRect();
        const scaleX = video.videoWidth / rect.width;
        const scaleY = video.videoHeight / rect.height;

        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = video.videoWidth;
        fullCanvas.height = video.videoHeight;
        const fullCtx = fullCanvas.getContext('2d');
        fullCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const cropX = region.x * scaleX;
        const cropY = region.y * scaleY;
        const cropW = region.w * scaleX;
        const cropH = region.h * scaleY;

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const derivedImage = canvas.toDataURL('image/png');

        try {
            const result = await recognize(derivedImage);

            const timestamp = new Date().toLocaleTimeString();
            const videoTimestamp = new Date(video.currentTime * 1000).toISOString().substr(11, 8); // HH:MM:SS

            const confidence = result.confidence;
            const text = result.text.trim();

            const hasText = text.length > 0 && confidence > threshold;

            if (hasText) {
                // Deduplication
                if (dedupe && lastTextRef.current === text) {
                    setStats(prev => ({ ...prev, totalCaptures: prev.totalCaptures + 1 }));
                    return;
                }

                lastTextRef.current = text;

                const entry = {
                    id: Date.now(),
                    timestamp: timestamp,
                    videoTime: videoTimestamp,
                    text: text,
                    confidence: confidence,
                    image: derivedImage
                };

                setLogs(prev => [entry, ...prev].slice(0, 100));
                setHistory(prev => [entry, ...prev].slice(0, 50));
                setStats(prev => ({ ...prev, totalCaptures: prev.totalCaptures + 1, successful: prev.successful + 1 }));
            } else {
                setStats(prev => ({ ...prev, totalCaptures: prev.totalCaptures + 1, empty: prev.empty + 1 }));

                // If NOT ignoring empty, we save the empty result
                if (!noEmpty) {
                    const entry = {
                        id: Date.now(),
                        timestamp: timestamp,
                        videoTime: videoTimestamp,
                        text: '[NO TEXT DETECTED]',
                        confidence: confidence,
                        image: derivedImage
                    };
                    setLogs(prev => [entry, ...prev].slice(0, 100));
                    setHistory(prev => [entry, ...prev].slice(0, 50));
                }
            }

        } catch (e) {
            console.error("Capture error", e);
        } finally {
            setIsProcessing(false);
        }

    }, [videoRef, region, isReady, recognize, isProcessing, threshold, dedupe, noEmpty]);

    useEffect(() => {
        if (isRunning && isReady) {
            intervalRef.current = setInterval(captureFrame, interval * 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [isRunning, isReady, interval, captureFrame]);

    return { logs, history, stats, isReady, clearSession };
};
