# 🚀 Pump.Fun World - Multiplayer Setup Guide

This guide will help you deploy your multiplayer Pump.Fun World game to Render.com and get it running for multiple players.

## 🎮 What's New - Multiplayer Features

Your game now includes:
- **Real-time multiplayer** with Socket.IO
- **Player synchronization** - see other players moving around
- **Live chat system** with commands
- **Meme coin creation** shared across all players
- **Trading battles** between players
- **Player stats synchronization**
- **Automatic player colors** for differentiation

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
# Install main dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Run Development Environment

```bash
# Option 1: Run both client and server together
npm run dev:full

# Option 2: Run separately (in different terminals)
npm run dev:server  # Terminal 1 - Server on port 3001
npm run dev         # Terminal 2 - Client on port 5173
```

### 3. Test Multiplayer Locally

1. Open multiple browser tabs to `http://localhost:5173`
2. You should see different colored players
3. Move around with WASD keys
4. Open chat with the 💬 button
5. Try chat commands like `/coin MyToken` or `/battle`

## 🌐 Render.com Deployment

### 1. Prepare Your Repository

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add multiplayer functionality"
git push origin main
```

### 2. Deploy to Render.com

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Link your GitHub account
3. **Create Web Service**: 
   - Click "New +" → "Web Service"
   - Connect your repository
   - Use these settings:

```yaml
Name: pump-fun-world
Environment: Node
Build Command: npm run build:full
Start Command: npm start
```

### 3. Environment Variables

Set these in Render dashboard:
```
NODE_ENV=production
PORT=10000
```

### 4. Update CORS Settings

After deployment, update the server CORS settings in `server/server.js`:

```javascript
// Replace "your-frontend-domain.render.com" with your actual Render URL
origin: process.env.NODE_ENV === 'production' 
  ? ["https://your-app-name.onrender.com"] 
  : ["http://localhost:5173", "http://localhost:3000"],
```

## 🎯 Game Features & Commands

### Chat Commands
- `/coin [name]` - Create a new meme coin
- `/battle` - Start/join a trading battle
- `/help` - Show available commands

### Multiplayer Features
- **Real-time movement** - See other players move instantly
- **Player identification** - Each player has unique colors and usernames
- **Live chat** - Communicate with other players
- **Shared world** - Meme coins and events are shared
- **Player stats** - Level and stats visible to others

## 🔧 Technical Architecture

### Client-Side (`src/`)
- **MultiplayerService** - Handles Socket.IO connections
- **useMultiplayer** - Zustand store for multiplayer state
- **MultiplayerCharacter** - Renders other players
- **Chat** - Real-time chat component
- **useMultiplayerEvents** - Event handling hook

### Server-Side (`server/`)
- **Express + Socket.IO** - WebSocket server
- **Player management** - Track connected players
- **Real-time sync** - Position and state updates
- **Game events** - Chat, meme coins, battles

### Key Files
```
├── server/
│   ├── server.js           # Main multiplayer server
│   └── package.json        # Server dependencies
├── src/
│   ├── services/
│   │   └── multiplayerService.js  # Client connection
│   ├── stores/
│   │   └── useMultiplayer.js      # Multiplayer state
│   ├── hooks/
│   │   └── useMultiplayerEvents.js # Event handlers
│   ├── MultiplayerCharacter.jsx   # Other players
│   ├── interface/
│   │   └── Chat.jsx               # Chat component
│   └── Experience.jsx             # Main game scene
├── package.json            # Main dependencies
└── render.yaml            # Deployment config
```

## 🚨 Troubleshooting

### Connection Issues
1. **Check server logs** in Render dashboard
2. **Verify CORS settings** match your domain
3. **Test locally first** with `npm run dev:full`

### Performance
1. **Monitor player count** - Render starter plan handles ~10-20 concurrent players
2. **Check memory usage** in Render metrics
3. **Optimize if needed** - reduce sync frequency

### Common Fixes
```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules
npm install
cd server && npm install

# Reset git if needed
git reset --hard HEAD
```

## 🎉 Success Checklist

- [ ] Local development works with multiple tabs
- [ ] Server deploys successfully to Render
- [ ] Players can see each other moving
- [ ] Chat system works
- [ ] Meme coin creation syncs across players
- [ ] No console errors in browser
- [ ] Health check endpoint responds at `/health`

## 🚀 Next Steps

Your multiplayer Pump.Fun World is now ready! Players can:

1. **Join the game** at your Render URL
2. **Move around** and see other players
3. **Chat in real-time** with the community
4. **Create meme coins** together
5. **Battle in trading competitions**
6. **Level up** their degen status

Share your game URL and watch the pump.fun community grow! 💎🙌

---

**Need help?** Check the console logs in your browser and Render dashboard for any error messages. 