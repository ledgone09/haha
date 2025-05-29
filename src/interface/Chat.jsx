import React, { useState, useRef, useEffect } from 'react';
import useMultiplayer from '../stores/useMultiplayer';
import '../style/chat.css';

export const Chat = ({ isVisible, onToggle }) => {
  const [message, setMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const chatRef = useRef();
  const inputRef = useRef();
  
  const { 
    chatMessages, 
    sendChatMessage, 
    isConnected,
    playerCount,
    joinTradingBattle,
    createMemeCoin 
  } = useMultiplayer();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;

    // Handle special commands
    if (message.startsWith('/')) {
      handleCommand(message);
    } else {
      sendChatMessage(message);
    }
    
    setMessage('');
  };

  const handleCommand = (command) => {
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case '/help':
        // Local help message
        break;
      case '/coin':
        // Create a meme coin
        const coinName = parts.slice(1).join(' ') || 'Diamond Hands Coin';
        createMemeCoin({
          name: coinName,
          symbol: coinName.split(' ').map(w => w[0]).join('').toUpperCase(),
          initialPrice: Math.random() * 0.01,
          description: `A pump.fun meme coin created by a true degen! 🚀`
        });
        break;
      case '/battle':
        // Start trading battle
        joinTradingBattle('main');
        break;
      default:
        sendChatMessage(command); // Send as regular message if not recognized
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessage = (msg) => {
    return {
      ...msg,
      color: msg.color || { r: 1, g: 1, b: 1 }
    };
  };

  if (!isVisible) {
    return (
      <button 
        className="chat-toggle-btn"
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06FFA5, #8B5CF6)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(6, 255, 165, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span>💬 Pump.Fun Chat</span>
          <div className="player-count">
            {isConnected ? `${playerCount} online` : 'Connecting...'}
          </div>
        </div>
        <button className="chat-close-btn" onClick={onToggle}>
          ✕
        </button>
      </div>
      
      <div className="chat-messages" ref={chatRef}>
        {chatMessages.map((msg) => {
          const formattedMsg = formatMessage(msg);
          return (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}
            >
              <span className="chat-timestamp">
                {formatTime(msg.timestamp)}
              </span>
              <span 
                className="chat-username"
                style={{
                  color: `rgb(${Math.floor(formattedMsg.color.r * 255)}, ${Math.floor(formattedMsg.color.g * 255)}, ${Math.floor(formattedMsg.color.b * 255)})`
                }}
              >
                {msg.username}:
              </span>
              <span className="chat-text">{msg.message}</span>
            </div>
          );
        })}
        
        {!isConnected && (
          <div className="chat-message system-message">
            <span className="chat-text">🔌 Connecting to multiplayer...</span>
          </div>
        )}
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={isConnected ? "Type a message... (or /help for commands)" : "Connecting..."}
          disabled={!isConnected}
          className="chat-input"
          maxLength={200}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || !isConnected}
          className="chat-send-btn"
        >
          🚀
        </button>
      </form>
      
      <div className="chat-commands-hint">
        💡 Commands: /coin [name], /battle, /help
      </div>
    </div>
  );
}; 