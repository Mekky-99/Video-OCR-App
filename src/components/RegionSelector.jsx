import React, { useState, useEffect, useRef } from 'react';
import './RegionSelector.css';

const RegionSelector = ({ containerRef, onRegionChange }) => {
    const [position, setPosition] = useState({ x: 10, y: 10, w: 200, h: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0, w: 0, h: 0 });

    const boxRef = useRef(null);

    // Notify parent of changes
    useEffect(() => {
        onRegionChange(position);
    }, [position, onRegionChange]);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ ...position });
    };

    const handleResizeDown = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ ...position });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();

            if (isDragging) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                let newX = initialPos.x + dx;
                let newY = initialPos.y + dy;

                // Bounds check
                newX = Math.max(0, Math.min(newX, containerRect.width - position.w));
                newY = Math.max(0, Math.min(newY, containerRect.height - position.h));

                setPosition(prev => ({ ...prev, x: newX, y: newY }));
            }

            if (isResizing) {
                const dx = e.clientX - resizeStart.x;
                const dy = e.clientY - resizeStart.y;

                let newW = initialPos.w + dx;
                let newH = initialPos.h + dy;

                // Min Size check
                newW = Math.max(50, Math.min(newW, containerRect.width - position.x));
                newH = Math.max(50, Math.min(newH, containerRect.height - position.y));

                setPosition(prev => ({ ...prev, w: newW, h: newH }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, resizeStart, initialPos, containerRef, position]);

    return (
        <div
            className="region-selector"
            ref={boxRef}
            style={{
                left: position.x,
                top: position.y,
                width: position.w,
                height: position.h
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="resize-handle" onMouseDown={handleResizeDown} />
            <span className="region-label">Capture Zone</span>
            <span className="region-coords">{Math.round(position.w)} x {Math.round(position.h)}</span>
        </div>
    );
};

export default RegionSelector;
