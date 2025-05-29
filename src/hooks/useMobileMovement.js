import { useRef, useCallback } from 'react';

export const useMobileMovement = () => {
  const mobileInputRef = useRef({
    x: 0,
    y: 0,
    moving: false
  });

  const handleMobileMovement = useCallback((input) => {
    mobileInputRef.current = {
      x: input.x,
      y: -input.y, // Invert Y axis to match game coordinates
      moving: input.moving
    };
  }, []);

  // Function to check if mobile movement is active
  const isMobileMoving = useCallback(() => {
    return mobileInputRef.current.moving;
  }, []);

  // Function to get mobile movement direction
  const getMobileMovement = useCallback(() => {
    return mobileInputRef.current;
  }, []);

  // Function to simulate keyboard input for mobile
  const getMobileKeyState = useCallback(() => {
    const { x, y, moving } = mobileInputRef.current;
    
    if (!moving) {
      return {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ArrowUp: false,
        ArrowLeft: false,
        ArrowDown: false,
        ArrowRight: false
      };
    }

    // Convert joystick input to keyboard-like input
    // Threshold for diagonal movement
    const threshold = 0.3;
    
    return {
      KeyW: y < -threshold,          // Move forward
      KeyA: x < -threshold,          // Move left  
      KeyS: y > threshold,           // Move backward
      KeyD: x > threshold,           // Move right
      ArrowUp: y < -threshold,
      ArrowLeft: x < -threshold,
      ArrowDown: y > threshold,
      ArrowRight: x > threshold
    };
  }, []);

  return {
    handleMobileMovement,
    isMobileMoving,
    getMobileMovement,
    getMobileKeyState
  };
}; 