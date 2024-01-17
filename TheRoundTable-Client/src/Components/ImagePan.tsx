import React, { useState, useRef } from 'react';

const ImageZoomPan = ({ src, anchorPoints }) => {
  const [scale, setScale] = useState(1);
  const [isPanning, setPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const calculateBoundaries = (newPosition, newScale) => {
    if (!containerRef.current) return { x: 0, y: 0 };
  
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const imageWidth = containerRef.current.firstChild.offsetWidth;
    const imageHeight = containerRef.current.firstChild.offsetHeight;
  
    // Calculate the scaled dimensions of the image
    const scaledImageWidth = imageWidth * newScale;
    const scaledImageHeight = imageHeight * newScale;
  
    // Calculate the maximum allowed position offsets
    const maxX = Math.max(0, (scaledImageWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledImageHeight - containerHeight) / 2);
  
    // Adjust the position to ensure it's within the calculated bounds
    const boundedX = Math.min(maxX, Math.max(newPosition.x, -maxX));
    let boundedY = Math.min(maxY, Math.max(newPosition.y, -maxY));
  
    // Additional adjustment for the top boundary misalignment
    if (boundedY > 0) {
      boundedY = 0; // Prevent the image from moving too far up
    }
  
    return {
      x: boundedX,
      y: boundedY
    };
  };
  
  
  
  

  const handleWheel = (e) => {
    const scaleAmount = 0.1;
    const newScale = e.deltaY > 0 ? Math.max(1, scale - scaleAmount) : Math.min(3, scale + scaleAmount);
    const boundedPosition = calculateBoundaries(position, newScale);
    setScale(newScale);
    setPosition(boundedPosition);
  };

  const handleMouseDown = (e) => {
    e.preventDefault()
    setPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;
    const boundedPosition = calculateBoundaries({ x: newX, y: newY }, scale);
    setPosition(boundedPosition);
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  const goToAnchorPoint = (anchor) => {
    setScale(anchor.scale);
    setPosition({ x: anchor.x, y: anchor.y });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', willChange: 'transform' }}
    >
      <img
        src={src}
        alt="Zoomable"
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.2s',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      />
      {anchorPoints && anchorPoints.map((anchor, index) => (
        <button key={index} onClick={() => goToAnchorPoint(anchor)} style={{ position: 'absolute', top: anchor.buttonY, left: anchor.buttonX }}>
          {anchor.label}
        </button>
      ))}
    </div>
  );
};

export default ImageZoomPan;
