import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-frontend-domain.render.com"] // Update this with your actual frontend URL
      : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-frontend-domain.render.com"] // Update this with your actual frontend URL
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Pump.Fun World Server is running!' });
});

// Store connected players and usernames
const players = new Map();
const gameState = {
  players: new Map(),
  world: {
    npcInteractions: new Map(),
    arcadeGames: new Map(),
    tradingBattles: new Map()
  }
};

// Track usernames to ensure uniqueness
const usedUsernames = new Set();

// Player colors for differentiation
const playerColors = [
  { r: 0.06, g: 1.0, b: 0.65 },    // Pump.fun green
  { r: 0.55, g: 0.32, b: 0.96 },   // Purple
  { r: 1.0, g: 0.6, b: 0.0 },      // Orange
  { r: 1.0, g: 0.2, b: 0.6 },      // Pink
  { r: 0.2, g: 0.8, b: 1.0 },      // Blue
  { r: 1.0, g: 1.0, b: 0.2 },      // Yellow
  { r: 0.8, g: 0.2, b: 0.2 },      // Red
  { r: 0.4, g: 0.8, b: 0.4 }       // Light green
];

function getPlayerColor(playerId) {
  const hash = playerId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return playerColors[Math.abs(hash) % playerColors.length];
}

function generateUniqueUsername(baseUsername = null) {
  // If no base username provided, generate a random one
  if (!baseUsername) {
    const adjectives = ['Diamond', 'Moon', 'Rocket', 'Degen', 'Pump', 'Hodl', 'Based', 'Chad', 'Alpha', 'Sigma'];
    const nouns = ['Trader', 'Holder', 'Ape', 'Bull', 'Hunter', 'Lord', 'King', 'Master', 'Whale', 'Legend'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    baseUsername = `${randomAdj}${randomNoun}${randomNum}`;
  }

  let username = baseUsername;
  let counter = 1;

  // If username is taken, add numbers until we find a unique one
  while (usedUsernames.has(username.toLowerCase())) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

function setPlayerUsername(playerId, requestedUsername) {
  const player = gameState.players.get(playerId);
  if (!player) return false;

  // Remove old username from used set
  if (player.username) {
    usedUsernames.delete(player.username.toLowerCase());
  }

  // Generate unique username
  const newUsername = generateUniqueUsername(requestedUsername);
  
  // Add to used set
  usedUsernames.add(newUsername.toLowerCase());
  
  // Update player
  player.username = newUsername;
  
  return newUsername;
}

io.on('connection', (socket) => {
  console.log(`🚀 Player connected: ${socket.id}`);

  // Initialize new player with temporary username
  const tempUsername = generateUniqueUsername();
  usedUsernames.add(tempUsername.toLowerCase());

  const newPlayer = {
    id: socket.id,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    moving: false,
    animation: 'idle',
    color: getPlayerColor(socket.id),
    username: tempUsername,
    stats: {
      pumpCoins: 1000,
      degenLevel: 1,
      degenXP: 0,
      tradingStats: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        biggestPump: 0,
        diamondHandsStreak: 0
      }
    },
    connectedAt: Date.now()
  };

  gameState.players.set(socket.id, newPlayer);

  // Send current game state to new player
  socket.emit('gameState', {
    players: Array.from(gameState.players.values()),
    world: gameState.world,
    yourId: socket.id
  });

  // Notify other players of new player
  socket.broadcast.emit('playerJoined', newPlayer);

  // Handle username setting
  socket.on('setUsername', (requestedUsername) => {
    const actualUsername = setPlayerUsername(socket.id, requestedUsername);
    const player = gameState.players.get(socket.id);
    
    if (actualUsername && player) {
      console.log(`👤 Player ${socket.id} set username to: ${actualUsername}`);
      
      // Notify all players of the username change
      io.emit('playerUpdate', {
        id: socket.id,
        username: actualUsername
      });
    }
  });

  // Handle player movement
  socket.on('playerMove', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.position = data.position;
      player.rotation = data.rotation;
      player.moving = data.moving;
      player.animation = data.animation;

      // Broadcast to other players
      socket.broadcast.emit('playerUpdate', {
        id: socket.id,
        position: data.position,
        rotation: data.rotation,
        moving: data.moving,
        animation: data.animation
      });
    }
  });

  // Handle player stats updates
  socket.on('updateStats', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.stats = { ...player.stats, ...data };
      socket.broadcast.emit('playerStatsUpdate', {
        id: socket.id,
        stats: player.stats
      });
    }
  });

  // Handle meme coin creation
  socket.on('createMemeCoin', (coinData) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      const memeCoin = {
        id: `${socket.id}_${Date.now()}`,
        creatorId: socket.id,
        creatorName: player.username,
        ...coinData,
        timestamp: Date.now()
      };

      // Broadcast to all players
      io.emit('memeAcoinCreated', memeCoin);
    }
  });

  // Handle trading battles
  socket.on('startTradingBattle', (data) => {
    const battleId = `battle_${Date.now()}`;
    gameState.world.tradingBattles.set(battleId, {
      id: battleId,
      players: [socket.id],
      initiator: socket.id,
      status: 'waiting',
      startTime: Date.now(),
      ...data
    });

    // Broadcast trading battle invitation
    socket.broadcast.emit('tradingBattleInvite', {
      battleId,
      initiator: gameState.players.get(socket.id),
      data
    });
  });

  socket.on('joinTradingBattle', (battleId) => {
    const battle = gameState.world.tradingBattles.get(battleId);
    if (battle && battle.status === 'waiting') {
      battle.players.push(socket.id);
      battle.status = 'active';

      // Notify battle participants
      battle.players.forEach(playerId => {
        io.to(playerId).emit('tradingBattleStart', battle);
      });
    }
  });

  // Handle NPC interactions
  socket.on('npcInteraction', (data) => {
    gameState.world.npcInteractions.set(socket.id, {
      playerId: socket.id,
      npcId: data.npcId,
      action: data.action,
      timestamp: Date.now()
    });

    // Broadcast NPC interaction to nearby players
    socket.broadcast.emit('npcInteractionUpdate', {
      playerId: socket.id,
      ...data
    });
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      const chatData = {
        id: `msg_${Date.now()}`,
        playerId: socket.id,
        username: player.username,
        message: message.trim(),
        timestamp: Date.now(),
        color: player.color
      };

      // Broadcast to all players
      io.emit('chatMessage', chatData);
    }
  });

  // Handle arcade game events
  socket.on('arcadeGameEvent', (data) => {
    const gameId = data.gameId || `arcade_${Date.now()}`;
    
    if (!gameState.world.arcadeGames.has(gameId)) {
      gameState.world.arcadeGames.set(gameId, {
        id: gameId,
        players: new Set(),
        scores: new Map(),
        status: 'waiting'
      });
    }

    const arcadeGame = gameState.world.arcadeGames.get(gameId);
    
    switch (data.action) {
      case 'join':
        arcadeGame.players.add(socket.id);
        arcadeGame.scores.set(socket.id, 0);
        break;
      case 'leave':
        arcadeGame.players.delete(socket.id);
        arcadeGame.scores.delete(socket.id);
        break;
      case 'score':
        arcadeGame.scores.set(socket.id, data.score);
        break;
    }

    // Broadcast arcade game update
    io.emit('arcadeGameUpdate', {
      gameId,
      players: Array.from(arcadeGame.players),
      scores: Object.fromEntries(arcadeGame.scores),
      status: arcadeGame.status
    });
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    const username = player?.username || 'Unknown';
    
    console.log(`💎 Player disconnected: ${username} (${socket.id})`);
    
    // Remove username from used set
    if (player?.username) {
      usedUsernames.delete(player.username.toLowerCase());
    }
    
    // Remove player from game state
    gameState.players.delete(socket.id);
    
    // Clean up player from ongoing activities
    gameState.world.npcInteractions.delete(socket.id);
    
    // Remove from arcade games
    gameState.world.arcadeGames.forEach((game, gameId) => {
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        game.scores.delete(socket.id);
      }
    });

    // Remove from trading battles
    gameState.world.tradingBattles.forEach((battle, battleId) => {
      const playerIndex = battle.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        battle.players.splice(playerIndex, 1);
        if (battle.players.length === 0) {
          gameState.world.tradingBattles.delete(battleId);
        }
      }
    });

    // Notify other players
    socket.broadcast.emit('playerLeft', socket.id);
  });

  // Ping/Pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Periodic cleanup of old data
setInterval(() => {
  const now = Date.now();
  const CLEANUP_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Clean up old NPC interactions
  gameState.world.npcInteractions.forEach((interaction, key) => {
    if (now - interaction.timestamp > CLEANUP_TIMEOUT) {
      gameState.world.npcInteractions.delete(key);
    }
  });

  // Clean up empty arcade games
  gameState.world.arcadeGames.forEach((game, gameId) => {
    if (game.players.size === 0) {
      gameState.world.arcadeGames.delete(gameId);
    }
  });

  // Clean up inactive trading battles
  gameState.world.tradingBattles.forEach((battle, battleId) => {
    if (now - battle.startTime > CLEANUP_TIMEOUT) {
      gameState.world.tradingBattles.delete(battleId);
    }
  });
}, 60000); // Run cleanup every minute

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pump.Fun World Multiplayer Server running on port ${PORT}`);
  console.log(`💎 Ready for degens to connect!`);
});

export default app; 