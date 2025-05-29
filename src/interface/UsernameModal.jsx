import React, { useState, useEffect } from 'react';
import useMultiplayer from '../stores/useMultiplayer';
import '../style/username-modal.css';

export const UsernameModal = ({ isVisible, onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isConnected, username: currentUsername } = useMultiplayer();

  // Load current username or saved username from localStorage
  useEffect(() => {
    if (isVisible) {
      const savedUsername = localStorage.getItem('pumpfun-username');
      // Use current username if available, otherwise saved username
      const initialUsername = currentUsername || savedUsername || '';
      setUsername(initialUsername);
      setError('');
    }
  }, [isVisible, currentUsername]);

  const validateUsername = (name) => {
    if (!name.trim()) {
      return 'Username cannot be empty';
    }
    if (name.length < 2) {
      return 'Username must be at least 2 characters';
    }
    if (name.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return 'Username can only contain letters, numbers, _ and -';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    const validationError = validateUsername(trimmedUsername);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Save to localStorage
      localStorage.setItem('pumpfun-username', trimmedUsername);
      
      // Set username in the game
      onUsernameSet(trimmedUsername);
      
    } catch (err) {
      setError('Failed to set username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = ['Diamond', 'Moon', 'Rocket', 'Degen', 'Pump', 'Hodl', 'Based', 'Chad', 'Alpha', 'Sigma'];
    const nouns = ['Trader', 'Holder', 'Ape', 'Bull', 'Hunter', 'Lord', 'King', 'Master', 'Whale', 'Legend'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  const handleRandomUsername = () => {
    const randomName = generateRandomUsername();
    setUsername(randomName);
  };

  const handleClose = () => {
    // Only allow closing if user already has a username
    if (currentUsername) {
      onUsernameSet(currentUsername); // This will close the modal
    }
  };

  if (!isVisible) return null;

  const isFirstTime = !currentUsername;

  return (
    <div className="username-modal-overlay">
      <div className="username-modal">
        <div className="username-modal-header">
          {!isFirstTime && (
            <button className="username-modal-close" onClick={handleClose}>
              ✕
            </button>
          )}
          <h2>
            {isFirstTime ? '🚀 Welcome to Pump.Fun World!' : '👤 Change Your Username'}
          </h2>
          <p>
            {isFirstTime 
              ? 'Choose your degen username to start pumping! 💎'
              : 'Update your username to a new degen identity! 🔥'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="username-form">
          <div className="username-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className={`username-input ${error ? 'error' : ''}`}
              maxLength={20}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={handleRandomUsername}
              className="random-username-btn"
              disabled={isLoading}
              title="Generate random username"
            >
              🎲
            </button>
          </div>
          
          {error && (
            <div className="username-error">
              ⚠️ {error}
            </div>
          )}
          
          <div className="username-requirements">
            💡 2-20 characters, letters, numbers, _ and - only
          </div>
          
          <button
            type="submit"
            className="username-submit-btn"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                {isFirstTime ? 'Connecting...' : 'Updating...'}
              </>
            ) : (
              <>
                {isFirstTime ? '🚀 Enter the Pump Zone' : '💎 Update Username'}
              </>
            )}
          </button>
        </form>
        
        <div className="username-modal-footer">
          <div className="connection-status">
            {isConnected ? (
              <span className="connected">🟢 Connected to server</span>
            ) : (
              <span className="connecting">🟡 Connecting to server...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 