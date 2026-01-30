import React, { forwardRef, useEffect } from 'react';

const VideoPlayer = forwardRef(({ src, onLoadedMetadata, onTimeUpdate }, ref) => {
    return (
        <div className="video-player-container" style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
            <video
                ref={ref}
                src={src}
                className="main-video"
                controls
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
            />
        </div>
    );
});

export default VideoPlayer;
