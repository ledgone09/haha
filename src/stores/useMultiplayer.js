import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import multiplayerService from '../services/multiplayerService';

export default create(
  subscribeWithSelector((set, get) => {
    return {
      // Connection state
      isConnected: false,
      playerId: null,
      connectionError: null,
      
      // Username state
      username: null,
      isUsernameSet: false,
      
      // Players state
      otherPlayers: new Map(),
      playerCount: 0,
      
      // Chat state
      chatMessages: [],
      maxChatMessages: 50,
      
      // Multiplayer features
      tradingBattles: new Map(),
      arcadeGames: new Map(),
      npcInteractions: new Map(),
      
      // Connection actions
      connect: () => {
        multiplayerService.connect();
      },
      
      disconnect: () => {
        multiplayerService.disconnect();
        set({
          isConnected: false,
          playerId: null,
          otherPlayers: new Map(),
          playerCount: 0
        });
      },
      
      // Username actions
      setUsername: (username) => {
        console.log('🎯 Store: Setting username to:', username);
        set({ username, isUsernameSet: true });
        // Send username to server
        multiplayerService.setUsername(username);
        // Also save to localStorage
        localStorage.setItem('pumpfun-username', username);
      },

      // Reset username (for changing username)
      resetUsername: () => {
        console.log('🔄 Store: Resetting username');
        set({ username: null, isUsernameSet: false });
        localStorage.removeItem('pumpfun-username');
      },
      
      // Update connection status
      setConnectionStatus: (status) => {
        console.log('🔌 Store: Connection status update:', status);
        set({
          isConnected: status.isConnected,
          playerId: status.playerId,
          playerCount: status.playerCount
        });
      },
      
      setConnectionError: (error) => {
        set({ connectionError: error });
      },
      
      // Player management
      addPlayer: (player) => {
        set((state) => {
          const newPlayers = new Map(state.otherPlayers);
          newPlayers.set(player.id, player);
          return {
            otherPlayers: newPlayers,
            playerCount: newPlayers.size + 1 // +1 for local player
          };
        });
      },
      
      removePlayer: (playerId) => {
        set((state) => {
          const newPlayers = new Map(state.otherPlayers);
          newPlayers.delete(playerId);
          return {
            otherPlayers: newPlayers,
            playerCount: newPlayers.size + 1 // +1 for local player
          };
        });
      },
      
      updatePlayer: (playerData) => {
        set((state) => {
          const newPlayers = new Map(state.otherPlayers);
          const existingPlayer = newPlayers.get(playerData.id);
          if (existingPlayer) {
            newPlayers.set(playerData.id, { ...existingPlayer, ...playerData });
          }
          return { otherPlayers: newPlayers };
        });
      },
      
      setAllPlayers: (players) => {
        const currentPlayerId = get().playerId;
        const otherPlayers = new Map();
        
        players.forEach(player => {
          if (player.id !== currentPlayerId) {
            otherPlayers.set(player.id, player);
          }
        });
        
        set({
          otherPlayers,
          playerCount: players.length
        });
      },
      
      // Chat actions
      addChatMessage: (message) => {
        set((state) => {
          const newMessages = [...state.chatMessages, message];
          // Keep only the last maxChatMessages
          if (newMessages.length > state.maxChatMessages) {
            newMessages.splice(0, newMessages.length - state.maxChatMessages);
          }
          return { chatMessages: newMessages };
        });
      },
      
      sendChatMessage: (message) => {
        if (message.trim()) {
          multiplayerService.sendChatMessage(message);
        }
      },
      
      clearChatMessages: () => {
        set({ chatMessages: [] });
      },
      
      // Movement synchronization
      sendPlayerMove: (position, rotation, moving, animation) => {
        multiplayerService.sendPlayerMove(position, rotation, moving, animation);
      },
      
      // Stats synchronization
      sendStatsUpdate: (stats) => {
        multiplayerService.sendStatsUpdate(stats);
      },
      
      // Trading battles
      startTradingBattle: (battleData) => {
        multiplayerService.startTradingBattle(battleData);
      },
      
      joinTradingBattle: (battleId) => {
        multiplayerService.joinTradingBattle(battleId);
      },
      
      addTradingBattle: (battle) => {
        set((state) => {
          const newBattles = new Map(state.tradingBattles);
          newBattles.set(battle.id, battle);
          return { tradingBattles: newBattles };
        });
      },
      
      updateTradingBattle: (battleData) => {
        set((state) => {
          const newBattles = new Map(state.tradingBattles);
          const existingBattle = newBattles.get(battleData.id);
          if (existingBattle) {
            newBattles.set(battleData.id, { ...existingBattle, ...battleData });
          }
          return { tradingBattles: newBattles };
        });
      },
      
      // Arcade games
      joinArcadeGame: (gameId) => {
        multiplayerService.sendArcadeGameEvent(gameId, 'join');
      },
      
      leaveArcadeGame: (gameId) => {
        multiplayerService.sendArcadeGameEvent(gameId, 'leave');
      },
      
      updateArcadeScore: (gameId, score) => {
        multiplayerService.sendArcadeGameEvent(gameId, 'score', { score });
      },
      
      addArcadeGame: (game) => {
        set((state) => {
          const newGames = new Map(state.arcadeGames);
          newGames.set(game.id, game);
          return { arcadeGames: newGames };
        });
      },
      
      updateArcadeGame: (gameData) => {
        set((state) => {
          const newGames = new Map(state.arcadeGames);
          const existingGame = newGames.get(gameData.gameId);
          if (existingGame) {
            newGames.set(gameData.gameId, { ...existingGame, ...gameData });
          } else {
            newGames.set(gameData.gameId, gameData);
          }
          return { arcadeGames: newGames };
        });
      },
      
      // NPC interactions
      sendNpcInteraction: (npcId, action) => {
        multiplayerService.sendNpcInteraction(npcId, action);
      },
      
      updateNpcInteraction: (interactionData) => {
        set((state) => {
          const newInteractions = new Map(state.npcInteractions);
          newInteractions.set(interactionData.playerId, interactionData);
          return { npcInteractions: newInteractions };
        });
      },
      
      // Meme coin creation
      createMemeCoin: (coinData) => {
        multiplayerService.createMemeCoin(coinData);
      },
      
      // Utility functions
      getOtherPlayersArray: () => {
        return Array.from(get().otherPlayers.values());
      },
      
      getPlayer: (playerId) => {
        return get().otherPlayers.get(playerId);
      },
      
      isMultiplayerEnabled: () => {
        return get().isConnected && get().playerCount > 1;
      }
    };
  })
); 