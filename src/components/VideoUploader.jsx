import React, { useRef, useState } from 'react';
import { Upload, FileVideo } from 'lucide-react';
import './VideoUploader.css';

const VideoUploader = ({ onVideoUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            onVideoUpload(file, url);
        } else {
            alert('Please upload a valid video file (MP4, MOV, AVI, WebM)');
        }
    };

    return (
        <div
            className={`video-uploader ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="video/*"
            />

            <div className="upload-content">
                <div className="icon-circle">
                    <Upload size={32} />
                </div>
                <h3>Drop video file here or click to browse</h3>
                <p>Supports MP4, MOV, AVI, WebM</p>
            </div>
        </div>
    );
};

export default VideoUploader;
