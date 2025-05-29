import { io } from 'socket.io-client';

class MultiplayerService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.playerId = null;
    this.players = new Map();
    this.callbacks = new Map();
    
    // Event listeners
    this.eventListeners = {
      playerJoined: [],
      playerLeft: [],
      playerUpdate: [],
      gameState: [],
      chatMessage: [],
      memeAcoinCreated: [],
      tradingBattleInvite: [],
      tradingBattleStart: [],
      arcadeGameUpdate: [],
      npcInteractionUpdate: [],
      playerStatsUpdate: []
    };
  }

  // Initialize connection to multiplayer server
  connect() {
    if (this.socket) {
      return;
    }

    // Determine server URL based on environment
    const serverUrl = import.meta.env.PROD 
      ? window.location.origin  // Use same origin in production
      : 'http://localhost:3001'; // Local development server

    console.log(`🚀 Connecting to Pump.Fun World server: ${serverUrl}`);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('💎 Connected to Pump.Fun World!');
      this.isConnected = true;
      this.playerId = this.socket.id;
      this.emit('connected', { playerId: this.playerId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.emit('connectionError', { error });
    });

    // Game state events
    this.socket.on('gameState', (data) => {
      console.log('🎮 Received game state:', data);
      this.playerId = data.yourId;
      
      // Update players map
      this.players.clear();
      data.players.forEach(player => {
        this.players.set(player.id, player);
      });

      this.emit('gameState', data);
    });

    this.socket.on('playerJoined', (player) => {
      console.log(`👋 Player joined: ${player.username} (${player.id})`);
      this.players.set(player.id, player);
      this.emit('playerJoined', player);
    });

    this.socket.on('playerLeft', (playerId) => {
      console.log(`👋 Player left: ${playerId}`);
      this.players.delete(playerId);
      this.emit('playerLeft', { playerId });
    });

    this.socket.on('playerUpdate', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        Object.assign(player, data);
        this.emit('playerUpdate', data);
      }
    });

    this.socket.on('playerStatsUpdate', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        player.stats = { ...player.stats, ...data.stats };
        this.emit('playerStatsUpdate', data);
      }
    });

    // Chat events
    this.socket.on('chatMessage', (data) => {
      this.emit('chatMessage', data);
    });

    // Meme coin events
    this.socket.on('memeAcoinCreated', (data) => {
      this.emit('memeAcoinCreated', data);
    });

    // Trading battle events
    this.socket.on('tradingBattleInvite', (data) => {
      this.emit('tradingBattleInvite', data);
    });

    this.socket.on('tradingBattleStart', (data) => {
      this.emit('tradingBattleStart', data);
    });

    // Arcade game events
    this.socket.on('arcadeGameUpdate', (data) => {
      this.emit('arcadeGameUpdate', data);
    });

    // NPC interaction events
    this.socket.on('npcInteractionUpdate', (data) => {
      this.emit('npcInteractionUpdate', data);
    });

    // Connection health
    this.socket.on('pong', () => {
      // Connection is healthy
    });
  }

  // Set username
  setUsername(username) {
    if (!this.isConnected) return;

    this.socket.emit('setUsername', username);
  }

  // Send player movement to server
  sendPlayerMove(position, rotation, moving, animation) {
    if (!this.isConnected) return;

    this.socket.emit('playerMove', {
      position,
      rotation,
      moving,
      animation
    });
  }

  // Send player stats update
  sendStatsUpdate(stats) {
    if (!this.isConnected) return;

    this.socket.emit('updateStats', stats);
  }

  // Send chat message
  sendChatMessage(message) {
    if (!this.isConnected) return;

    this.socket.emit('chatMessage', message);
  }

  // Create meme coin
  createMemeCoin(coinData) {
    if (!this.isConnected) return;

    this.socket.emit('createMemeCoin', coinData);
  }

  // Start trading battle
  startTradingBattle(data) {
    if (!this.isConnected) return;

    this.socket.emit('startTradingBattle', data);
  }

  // Join trading battle
  joinTradingBattle(battleId) {
    if (!this.isConnected) return;

    this.socket.emit('joinTradingBattle', battleId);
  }

  // Send NPC interaction
  sendNpcInteraction(npcId, action) {
    if (!this.isConnected) return;

    this.socket.emit('npcInteraction', {
      npcId,
      action
    });
  }

  // Send arcade game event
  sendArcadeGameEvent(gameId, action, data = {}) {
    if (!this.isConnected) return;

    this.socket.emit('arcadeGameEvent', {
      gameId,
      action,
      ...data
    });
  }

  // Connection health check
  ping() {
    if (!this.isConnected) return;

    this.socket.emit('ping');
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    };
  }

  off(event, callback) {
    if (!this.eventListeners[event]) return;

    const index = this.eventListeners[event].indexOf(callback);
    if (index > -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventListeners[event]) return;

    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Get other players (excluding self)
  getOtherPlayers() {
    return Array.from(this.players.values()).filter(player => player.id !== this.playerId);
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  // Get all players
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.playerId = null;
      this.players.clear();
    }
  }

  // Check if connected
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      playerId: this.playerId,
      playerCount: this.players.size
    };
  }
}

// Create singleton instance
const multiplayerService = new MultiplayerService();

export default multiplayerService; 