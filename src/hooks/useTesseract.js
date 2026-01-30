import { useState, useEffect, useCallback } from 'react';
import Tesseract from 'tesseract.js';

export const useTesseract = (language = 'eng+ara') => {
    const [worker, setWorker] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let workerInstance = null;

        const initWorker = async () => {
            try {
                console.log('Initializing Tesseract worker...');
                workerInstance = await Tesseract.createWorker(language);
                setWorker(workerInstance);
                setIsReady(true);
                console.log('Tesseract worker ready');
            } catch (err) {
                console.error('Failed to initialize Tesseract:', err);
                setError(err);
            }
        };

        initWorker();

        return () => {
            if (workerInstance) {
                console.log('Terminating Tesseract worker...');
                workerInstance.terminate();
            }
        };
    }, [language]); // Re-init if language changes

    const recognize = useCallback(async (imageDetails) => {
        if (!worker || !isReady) return null;
        try {
            // imageDetails can be a base64 string, blob, or canvas
            const ret = await worker.recognize(imageDetails);
            return ret.data;
        } catch (err) {
            console.error('Recognition error:', err);
            return null;
        }
    }, [worker, isReady]);

    return { isReady, recognize, error };
};
