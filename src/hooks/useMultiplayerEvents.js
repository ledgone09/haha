import { useEffect } from 'react';
import multiplayerService from '../services/multiplayerService';
import useMultiplayer from '../stores/useMultiplayer';
import useGame from '../stores/useGame';

export const useMultiplayerEvents = () => {
  const {
    setConnectionStatus,
    setConnectionError,
    addPlayer,
    removePlayer,
    updatePlayer,
    setAllPlayers,
    addChatMessage,
    addTradingBattle,
    updateTradingBattle,
    updateArcadeGame,
    updateNpcInteraction
  } = useMultiplayer();

  const {
    addPumpCoins,
    addDegenXP,
    createMemeCoin,
    updateTradingStats
  } = useGame();

  useEffect(() => {
    // Connection events
    const unsubscribeConnected = multiplayerService.on('connected', (data) => {
      console.log('🚀 Connected to multiplayer!');
      setConnectionStatus(multiplayerService.getConnectionStatus());
    });

    const unsubscribeDisconnected = multiplayerService.on('disconnected', (data) => {
      console.log('🔌 Disconnected from multiplayer');
      setConnectionStatus(multiplayerService.getConnectionStatus());
    });

    const unsubscribeConnectionError = multiplayerService.on('connectionError', (data) => {
      console.error('❌ Connection error:', data.error);
      setConnectionError(data.error);
    });

    // Game state events
    const unsubscribeGameState = multiplayerService.on('gameState', (data) => {
      console.log('🎮 Game state received:', data);
      setAllPlayers(data.players);
      setConnectionStatus(multiplayerService.getConnectionStatus());
    });

    const unsubscribePlayerJoined = multiplayerService.on('playerJoined', (player) => {
      console.log(`👋 ${player.username} joined the game!`);
      addPlayer(player);
      
      // Show notification
      addChatMessage({
        id: `system_${Date.now()}`,
        playerId: 'system',
        username: 'System',
        message: `${player.username} joined the game! 🚀`,
        timestamp: Date.now(),
        color: { r: 0.06, g: 1.0, b: 0.65 },
        isSystem: true
      });
    });

    const unsubscribePlayerLeft = multiplayerService.on('playerLeft', (data) => {
      const player = multiplayerService.getPlayer(data.playerId);
      const username = player?.username || 'Unknown';
      
      console.log(`👋 ${username} left the game`);
      removePlayer(data.playerId);
      
      // Show notification
      addChatMessage({
        id: `system_${Date.now()}`,
        playerId: 'system',
        username: 'System',
        message: `${username} left the game 💎`,
        timestamp: Date.now(),
        color: { r: 0.8, g: 0.8, b: 0.8 },
        isSystem: true
      });
    });

    const unsubscribePlayerUpdate = multiplayerService.on('playerUpdate', (data) => {
      updatePlayer(data);
    });

    const unsubscribePlayerStatsUpdate = multiplayerService.on('playerStatsUpdate', (data) => {
      updatePlayer({ id: data.id, stats: data.stats });
    });

    // Chat events
    const unsubscribeChatMessage = multiplayerService.on('chatMessage', (data) => {
      addChatMessage(data);
    });

    // Meme coin events
    const unsubscribeMemeAcoinCreated = multiplayerService.on('memeAcoinCreated', (data) => {
      const creatorName = multiplayerService.getPlayer(data.creatorId)?.username || 'Unknown';
      
      // Add to local game state
      createMemeCoin(data);
      
      // Show notification
      addChatMessage({
        id: `memecoin_${Date.now()}`,
        playerId: 'system',
        username: 'System',
        message: `💰 ${creatorName} created a new meme coin: ${data.name || 'Diamond Hands Coin'}! 🚀`,
        timestamp: Date.now(),
        color: { r: 1.0, g: 0.8, b: 0.0 },
        isSystem: true
      });

      // Award XP for creating meme coins
      if (data.creatorId === multiplayerService.playerId) {
        addDegenXP(50);
        addPumpCoins(100);
      }
    });

    // Trading battle events
    const unsubscribeTradingBattleInvite = multiplayerService.on('tradingBattleInvite', (data) => {
      const initiatorName = data.initiator?.username || 'Unknown';
      
      addChatMessage({
        id: `battle_invite_${Date.now()}`,
        playerId: 'system',
        username: 'System',
        message: `⚔️ ${initiatorName} wants to start a trading battle! Type /join to participate 💎`,
        timestamp: Date.now(),
        color: { r: 1.0, g: 0.2, b: 0.6 },
        isSystem: true
      });

      addTradingBattle(data);
    });

    const unsubscribeTradingBattleStart = multiplayerService.on('tradingBattleStart', (data) => {
      updateTradingBattle(data);
      
      addChatMessage({
        id: `battle_start_${Date.now()}`,
        playerId: 'system',
        username: 'System',
        message: `⚔️ Trading battle has started! May the best degen win! 🚀`,
        timestamp: Date.now(),
        color: { r: 1.0, g: 0.2, b: 0.6 },
        isSystem: true
      });
    });

    // Arcade game events
    const unsubscribeArcadeGameUpdate = multiplayerService.on('arcadeGameUpdate', (data) => {
      updateArcadeGame(data);
    });

    // NPC interaction events
    const unsubscribeNpcInteractionUpdate = multiplayerService.on('npcInteractionUpdate', (data) => {
      updateNpcInteraction(data);
      
      const playerName = multiplayerService.getPlayer(data.playerId)?.username || 'Unknown';
      
      if (data.action === 'talk') {
        addChatMessage({
          id: `npc_${Date.now()}`,
          playerId: 'system',
          username: 'System',
          message: `💬 ${playerName} is talking to an NPC`,
          timestamp: Date.now(),
          color: { r: 0.4, g: 0.8, b: 1.0 },
          isSystem: true
        });
      }
    });

    // Cleanup function
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeConnectionError();
      unsubscribeGameState();
      unsubscribePlayerJoined();
      unsubscribePlayerLeft();
      unsubscribePlayerUpdate();
      unsubscribePlayerStatsUpdate();
      unsubscribeChatMessage();
      unsubscribeMemeAcoinCreated();
      unsubscribeTradingBattleInvite();
      unsubscribeTradingBattleStart();
      unsubscribeArcadeGameUpdate();
      unsubscribeNpcInteractionUpdate();
    };
  }, [
    setConnectionStatus,
    setConnectionError,
    addPlayer,
    removePlayer,
    updatePlayer,
    setAllPlayers,
    addChatMessage,
    addTradingBattle,
    updateTradingBattle,
    updateArcadeGame,
    updateNpcInteraction,
    addPumpCoins,
    addDegenXP,
    createMemeCoin,
    updateTradingStats
  ]);
}; 