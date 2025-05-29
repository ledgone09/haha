import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export default create(
  subscribeWithSelector((set) => {
    return {
      /**
       * Player position
       */
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      /**
       * Set player position
       */
      setPosition: (x, y, z) => {
        set(() => {
          return {
            positionX: x,
            positionY: y,
            positionZ: z,
          };
        });
      },
      /**
       * Player proximity to NPC
       */
      isNearNpc: false,
      toggleIsNearNpc: () => {
        set((state) => {
          if (state.isNearNpc === true) {
            return { isNearNpc: false };
          }
          if (state.isNearNpc === false) {
            return { isNearNpc: true };
          }
          return {};
        });
      },
      /**
       * Player proximity to Arcade
       */
      isNearArcade: false,
      toggleIsNearArcade: () => {
        set((state) => {
          if (state.isNearArcade === true) {
            return { isNearArcade: false };
          }
          if (state.isNearArcade === false) {
            return { isNearArcade: true };
          }
          return {};
        });
      },
      /**
       * Chatting with NPC
       */
      isChatting: false,
      toggleIsChatting: () => {
        set((state) => {
          if (state.isChatting === true) {
            return { isChatting: false };
          }
          if (state.isChatting === false) {
            return { isChatting: true };
          }
          return {};
        });
      },
      /**
       * Instructions
       */
      instructionsShown: true,
      hideInstructions: () => {
        set(() => {
          return { instructionsShown: false };
        });
      },
      /**
       * Sound
       */
      sound: false,
      toggleSound: () => {
        set((state) => {
          if (state.sound === true) {
            return { sound: false };
          }
          if (state.sound === false) {
            return { sound: true };
          }
          return {};
        });
      },
      playing: false,
      togglePlaying: () => {
        set((state) => {
          if (state.playing === true) {
            return { playing: false };
          }
          if (state.playing === false) {
            return { playing: true };
          }
          return {};
        });
      },
      /**
       * Phone mode
       */
      phone: false,
      togglePhone: () => {
        set((state) => {
          if (state.phone === true) {
            return { phone: false };
          }
          if (state.phone === false) {
            return { phone: true };
          }
          return {};
        });
      },
      /**
       * Phone Screen
       */
      screen: 'home',
      changeScreen: (value) => set({ screen: value }),
      /**
       * QR
       */
      qrScanned: false,
      scanQr: () => {
        set(() => {
          return { qrScanned: true };
        });
      },
      /**
       * PUMP.FUN GAME FEATURES
       */
      // Pump Coins (in-game currency)
      pumpCoins: 1000,
      addPumpCoins: (amount) => {
        set((state) => ({
          pumpCoins: state.pumpCoins + amount
        }));
      },
      spendPumpCoins: (amount) => {
        set((state) => ({
          pumpCoins: Math.max(0, state.pumpCoins - amount)
        }));
      },
      // Degen Level System
      degenLevel: 1,
      degenXP: 0,
      addDegenXP: (xp) => {
        set((state) => {
          const newXP = state.degenXP + xp;
          const newLevel = Math.floor(newXP / 100) + 1;
          return {
            degenXP: newXP,
            degenLevel: newLevel
          };
        });
      },
      // Meme Coins Created
      memeCoinsCreated: [],
      createMemeCoin: (coinData) => {
        set((state) => ({
          memeCoinsCreated: [...state.memeCoinsCreated, coinData]
        }));
      },
      // Trading Stats
      tradingStats: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        biggestPump: 0,
        diamondHandsStreak: 0
      },
      updateTradingStats: (newStats) => {
        set((state) => ({
          tradingStats: { ...state.tradingStats, ...newStats }
        }));
      },
      // Pump Battle Mode
      inPumpBattle: false,
      togglePumpBattle: () => {
        set((state) => ({
          inPumpBattle: !state.inPumpBattle
        }));
      },
    };
  })
);
