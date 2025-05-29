import React, { useRef, useEffect, useState } from 'react';
import '../style/mobile-controls.css';

export const MobileControls = ({ onMovement }) => {
  const joystickRef = useRef();
  const knobRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const joystick = joystickRef.current;
    const knob = knobRef.current;
    
    if (!joystick || !knob) return;

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Get touch or mouse position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate distance from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Joystick radius (half of joystick size minus knob size)
    const maxDistance = (rect.width / 2) - 20;
    
    // Limit knob to joystick boundary
    let knobX = deltaX;
    let knobY = deltaY;
    
    if (distance > maxDistance) {
      knobX = (deltaX / distance) * maxDistance;
      knobY = (deltaY / distance) * maxDistance;
    }

    // Update knob position
    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // Calculate movement direction (normalized)
    const normalizedX = knobX / maxDistance;
    const normalizedY = knobY / maxDistance;

    // Send movement data to parent component
    onMovement({
      x: normalizedX,
      y: normalizedY,
      moving: distance > 10 // Only consider moving if moved significantly
    });
  };

  const handleEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Reset knob position
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    
    // Stop movement
    onMovement({ x: 0, y: 0, moving: false });
  };

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <div className="mobile-controls">
      <div 
        ref={joystickRef}
        className="virtual-joystick"
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div ref={knobRef} className="joystick-knob">
          <div className="knob-inner"></div>
        </div>
        <div className="joystick-instructions">Move</div>
      </div>
    </div>
  );
}; 