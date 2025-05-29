# 🚀 Pump.Fun World - Multiplayer 3D Game

A multiplayer 3D world game built with React Three Fiber, featuring real-time player interactions, chat, meme coin creation, and trading battles.

## ✨ Features

- **Multiplayer Real-time Gaming** - Up to multiple players in the same 3D world
- **Custom Usernames** - Unique username system with validation
- **Real-time Chat** - Live chat with pump.fun themed commands
- **3D Character Movement** - Smooth character controls with animations
- **Meme Coin Creation** - Create and share meme coins with other players
- **Trading Battles** - Challenge other players to trading competitions
- **NPC Interactions** - Interactive NPCs throughout the world
- **Arcade Games** - Mini-games with multiplayer leaderboards
- **Pump.Fun Theming** - Complete pump.fun aesthetic and branding

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Three Fiber** - 3D graphics and animations
- **Rapier Physics** - Realistic physics engine
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **Vite** - Fast development and building

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/ledgone09/haha.git
cd haha
```

2. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

3. **Run both client and server**
```bash
npm run dev:full
```

4. **Open your browser**
- Client: http://localhost:5173
- Server: http://localhost:3001

### Individual Commands

**Client only:**
```bash
npm run dev
```

**Server only:**
```bash
npm run dev:server
```

**Build for production:**
```bash
npm run build:full
```

## 🌐 Deployment on Render.com

This project is configured for easy deployment on Render.com:

1. **Connect your GitHub repo** to Render.com
2. **Create a new Web Service**
3. **Use these settings:**
   - **Build Command:** `npm run build:full`
   - **Start Command:** `npm start`
   - **Node Version:** 18+

The project includes:
- `render.yaml` - Render.com configuration
- Health check endpoint at `/health`
- Production build optimization
- Environment variable support

## 🎮 Game Controls

- **WASD** - Move character
- **Mouse** - Look around
- **Click** - Interact with objects
- **Enter** - Open/close chat
- **Escape** - Pause menu

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3001
```

For production on Render.com, set:
```env
NODE_ENV=production
```

## 📁 Project Structure

```
pump-fun-world/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── stores/            # Zustand stores
│   ├── services/          # API services
│   ├── interface/         # UI components
│   └── style/             # CSS styles
├── server/                # Backend source
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
├── public/                # Static assets
├── render.yaml           # Render.com config
└── package.json          # Main dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev:full`
5. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🎯 Roadmap

- [ ] Voice chat integration
- [ ] More mini-games
- [ ] Leaderboards
- [ ] Custom character skins
- [ ] World building tools
- [ ] Mobile support

---

**Built with 💎 for the pump.fun community!**
