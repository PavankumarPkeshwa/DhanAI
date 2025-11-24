# DhanAI Quick Reference

## 🚀 Start Server (60 seconds)

```bash
cd /workspaces/DhanAI/intraday-ai-backend
npm start
```

✅ Server runs on `http://localhost:5000`

---

## 🎯 What's Running

| Component | Status | Port |
|-----------|--------|------|
| Frontend Dashboard | 🟢 Live | http://localhost:5000 |
| Socket.IO Streaming | 🟢 Active | ws://localhost:5000 |
| Auto-Trader Scheduler | 🟢 Running | Every 5s |
| REST APIs | 🟢 Ready | /api/* |

---

## 📊 Key Features

✅ **Live Chart** — Real-time candlestick updates via Socket.IO  
✅ **Manual Trading** — Place BUY/SELL orders instantly  
✅ **Auto-Trading** — AI-powered scheduler every 5s  
✅ **Portfolio Stats** — Win rate, P&L, drawdown tracking  
✅ **Activity Log** — Real-time event feed  
✅ **8 Indian Stocks** — INFY, TCS, RELIANCE, WIPRO, HDFC, ICICIBANK, BAJAJ, MARUTI  

---

## 🔌 API Calls

```bash
# Get wallet
curl http://localhost:5000/api/wallet

# Get all trades
curl http://localhost:5000/api/trades

# Get chart for INFY (last 50 candles)
curl http://localhost:5000/api/chart/INFY

# Place a BUY trade
curl -X POST http://localhost:5000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INFY","side":"BUY","quantity":1}'

# Reset all trades
curl -X DELETE http://localhost:5000/api/trades
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `intraday-ai-backend/server.js` | Express + Socket.IO entry point |
| `intraday-ai-backend/public/index.html` | Dashboard UI |
| `intraday-ai-backend/public/app.js` | Frontend logic & socket handlers |
| `intraday-ai-backend/services/scheduler.js` | 5s auto-trading loop |
| `intraday-ai-backend/config/kotakNeoApi.js` | Market data wrapper (mock/real) |
| `ml-model/model.pkl` | RandomForest AI model (trained) |
| `DEVELOPMENT.md` | Full system documentation |

---

## ⚙️ Configuration

### Add Kotak Neo Credentials
1. Get API keys from https://kotakneostocks.kotaksecurities.com/
2. Create `.env` in `intraday-ai-backend/`:
```bash
KOTAK_NEO_CONSUMER_KEY=your_key
KOTAK_NEO_CONSUMER_SECRET=your_secret
KOTAK_NEO_ACCESS_TOKEN=your_token
```
3. Restart server: `npm start`

### Change Trading Symbols
Edit `intraday-ai-backend/services/scheduler.js` line 6:
```javascript
const SYMBOLS = ["RELIANCE", "TCS", "INFY"]; // Modify here
```

---

## 🧪 Test Socket Events

```bash
cd /workspaces/DhanAI/intraday-ai-backend
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:5000');
socket.on('price', d => console.log('📊 Price:', d));
socket.on('candle', d => console.log('📈 Candle:', d.symbol, d.candles.length));
setTimeout(() => process.exit(0), 10000);
"
```

---

## 📊 Live Dashboard

```
URL: http://localhost:5000
```

### Left Panel
- 💰 Wallet (balance, P&L)
- 🤖 Auto trading on/off
- 📝 Manual trade form

### Center
- 📈 Live candlestick chart
- 📊 Quick stats (win rate, drawdown)
- 📋 Trade history table

### Right Panel
- 📋 Activity log (real-time events)

---

## 🔐 Security Checklist

✅ Local `.env` cleaned up (no secrets on disk)  
✅ Git history safe (credentials never committed)  
⚠️ **TODO**: Rotate Kotak credentials exposed in chat  

---

## 🐛 Troubleshooting

**Port 5000 already in use?**
```bash
lsof -i:5000 | grep node | awk '{print $2}' | xargs kill -9
```

**Socket not updating?**
```bash
# Check if scheduler is running in server logs
tail -f intraday-ai-backend/nohup.out
```

**Chart not loading?**
```bash
# Open browser DevTools (F12) → Console
# Look for fetch errors or socket connection issues
```

---

## 📈 System Status

```
Backend:       🟢 Running (localhost:5000)
Socket.IO:     🟢 Connected (every 5s)
Auto-Trader:   🟢 Active (RandomForest model)
Chart Updates: 🟢 Live (Lightweight Charts)
Database:      🟢 In-Memory (wallet, trades, prices)
```

---

## 🎓 Learn More

- **Full Docs**: Read `DEVELOPMENT.md`
- **API Docs**: See `intraday-ai-backend/routes/`
- **ML Model**: See `ml-model/train.py`
- **Frontend**: See `intraday-ai-backend/public/app.js`

---

**Last Updated**: November 24, 2025 | **Status**: ✅ Fully Operational
