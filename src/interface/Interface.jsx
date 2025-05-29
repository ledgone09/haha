import { useEffect, useState } from 'react';
import { Howl } from 'howler';
import useGame from '../stores/useGame.js';
import useMultiplayer from '../stores/useMultiplayer.js';
import Instructions from './instructions/Instructions.jsx';
import ChatButton from './actionButtons/ChatButton.jsx';
import ScanButton from './actionButtons/ScanButton.jsx';
import { Chat } from './Chat.jsx';
import { UsernameModal } from './UsernameModal.jsx';
import { MobileControls } from './MobileControls.jsx';

export default function Interface() {
  const sound = useGame((state) => state.sound);
  const toggleSound = useGame((state) => state.toggleSound);
  const playing = useGame((state) => state.playing);
  const togglePlaying = useGame((state) => state.togglePlaying);
  const isNearNpc = useGame((state) => state.isNearNpc);
  const isNearArcade = useGame((state) => state.isNearArcade);
  const qrScanned = useGame((state) => state.qrScanned);
  const isChatting = useGame((state) => state.isChatting);
  const instructionsShown = useGame((state) => state.instructionsShown);
  const hideInstructions = useGame((state) => state.hideInstructions);
  
  // Pump.Fun game state
  const pumpCoins = useGame((state) => state.pumpCoins);
  const degenLevel = useGame((state) => state.degenLevel);
  const degenXP = useGame((state) => state.degenXP);
  const tradingStats = useGame((state) => state.tradingStats);
  const inPumpBattle = useGame((state) => state.inPumpBattle);

  // Multiplayer state
  const { isConnected, isUsernameSet, setUsername, username, resetUsername } = useMultiplayer();

  // Chat visibility state
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Debug - Connection state:', { isConnected, isUsernameSet, username });
  }, [isConnected, isUsernameSet, username]);

  // Only show username modal on first connection if no username exists
  useEffect(() => {
    if (isConnected && !isUsernameSet && !localStorage.getItem('pumpfun-username')) {
      console.log('👤 First time connection - showing username modal');
      setShowUsernameModal(true);
    }
  }, [isConnected, isUsernameSet]);

  useEffect(() => {
    setTimeout(() => {
      hideInstructions();
    }, 12000);
  }, []);

  // Auto-set saved username ONLY once when connecting
  useEffect(() => {
    if (isConnected && !isUsernameSet) {
      const savedUsername = localStorage.getItem('pumpfun-username');
      console.log('💾 Checking saved username:', savedUsername);
      
      if (savedUsername && savedUsername.trim()) {
        console.log('✅ Auto-setting saved username:', savedUsername);
        // Auto-set saved username without showing modal
        setUsername(savedUsername);
      }
    }
  }, [isConnected]); // Only run when connection changes

  /**
   * Pump.Fun Gaming Soundtrack
   */
  const [soundtrack] = useState(
    () =>
      new Howl({
        src: ['./sound/pump_fun_beats.mp3'],
        loop: true,
        html5: true,
      })
  );

  if (sound === true && playing === false) {
    soundtrack.play();
    togglePlaying();
  } else if (sound === false && playing === true) {
    soundtrack.stop();
    togglePlaying();
  }

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleUsernameSet = (newUsername) => {
    console.log('🎯 Setting username:', newUsername);
    setUsername(newUsername);
    setShowUsernameModal(false);
  };

  // Function to open username modal
  const openUsernameModal = () => {
    console.log('👤 Opening username modal');
    setShowUsernameModal(true);
  };

  return (
    <>
      {/* Username Modal */}
      <UsernameModal 
        isVisible={showUsernameModal}
        onUsernameSet={handleUsernameSet}
      />

      {/* Pump.Fun Logo */}
      <div className="logo">
        <span className="pump-fun">PUMP.FUN</span>
        <br />
        WORLD
      </div>
      
      {/* Pump.Fun Game Stats HUD */}
      <div className="pump-hud">
        <div className="pump-stat">
          <span className="pump-icon">🪙</span>
          <span className="pump-value">{pumpCoins.toLocaleString()}</span>
        </div>
        <div className="pump-stat">
          <span className="pump-icon">💎</span>
          <span className="pump-value">LVL {degenLevel}</span>
        </div>
        <div className="pump-stat">
          <span className="pump-icon">📈</span>
          <span className="pump-value">{tradingStats.wins}W/{tradingStats.losses}L</span>
        </div>
        {inPumpBattle && (
          <div className="pump-battle-indicator">
            <span className="battle-text">🔥 PUMP BATTLE 🔥</span>
          </div>
        )}
      </div>

      {/* Control Buttons (top-right) */}
      <div className="control-buttons">
        {/* Username Management Button */}
        {isConnected && (
          <div className="control-button" id="username" onClick={openUsernameModal} title={username ? `Current: ${username}` : 'Set Username'}>
            <div className="username-control-icon">
              👤
            </div>
          </div>
        )}
        <div className="control-button" id="sound" onClick={toggleSound}>
          {sound ? (
            <img src="./icons/sound_on.svg" />
          ) : (
            <img src="./icons/sound_off.svg" />
          )}
        </div>
        <div className="control-button" id="menu">
          <img src="./icons/menu.svg" />
        </div>
      </div>

      {/* Phone Tumbnail Area (bottom-right) */}
      <div className="phone-thumbnail-area" onClick={() => window.open('https://twitter.com/pumpdotfun', '_blank')}>
        <img
          className="phone-thumbnail"
          src="./images/phone_small.png"
          alt="phone thumbnail"
        />
        <div className="phone-shadow"></div>
        <div className="phone-thumbnail-area-background"></div>
      </div>
      {isNearNpc && !isChatting && <ChatButton />}
      {isNearArcade && !qrScanned && <ScanButton />}
      {/* Instructions */}
      {instructionsShown && <Instructions />}
      
      {/* Multiplayer Chat */}
      <Chat 
        isVisible={isChatVisible} 
        onToggle={toggleChat} 
      />
      
      {/* Mobile Controls */}
      <MobileControls />
    </>
  );
}
