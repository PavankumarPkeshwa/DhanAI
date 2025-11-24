# Kotak Neo API Integration Guide

## Overview
DhanAI now uses **Kotak Neo API** for real-time market data instead of mock data. Follow these steps to set up your credentials.

## Setup Instructions

### Step 1: Get Kotak Neo API Credentials

1. Visit: [https://kotakneostocks.kotaksecurities.com/](https://kotakneostocks.kotaksecurities.com/)
2. Sign up for a Kotak Securities account
3. Generate API credentials from the developer portal:
  - **Consumer Key:** `YOUR_CONSUMER_KEY_HERE`
  - **Consumer Secret:** `YOUR_CONSUMER_SECRET_HERE`
  - **Access Token:** `YOUR_ACCESS_TOKEN_HERE`

  **Security notice:** Do NOT store real API credentials in project documentation or commit them to source control. If you previously committed credentials to this repository, rotate/revoke them immediately (see remediation steps below).

### Step 2: Configure Environment Variables

1. Create a `.env` file in `/intraday-ai-backend/` directory:

```bash
# Copy from .env.example
cp intraday-ai-backend/.env.example intraday-ai-backend/.env
```

2. Edit the `.env` file and add your credentials:

```env
KOTAK_NEO_CONSUMER_KEY=your_consumer_key_here
KOTAK_NEO_CONSUMER_SECRET=your_consumer_secret_here
KOTAK_NEO_ACCESS_TOKEN=your_access_token_here
PORT=5000
```

### Step 3: Restart the Server

```bash
cd intraday-ai-backend
npm start
```

## Features

✅ **Live Market Data**: Real-time price quotes from NSE/BSE
✅ **Candlestick Charts**: TradingView Lightweight Charts with live updates
✅ **Multiple Symbols**: Trade INFY, TCS, RELIANCE, and more
✅ **Auto Trading**: AI-powered trading decisions using live prices
✅ **Manual Trading**: Place trades directly from the UI

## Supported Symbols

| Symbol | Company | Price Range |
|--------|---------|-------------|
| INFY | Infosys | ₹200-400 |
| TCS | Tata Consultancy Services | ₹200-400 |
| RELIANCE | Reliance Industries | ₹250-350 |
| WIPRO | Wipro | ₹300-450 |
| HDFC | HDFC Bank | ₹2500-3000 |
| ICICIBANK | ICICI Bank | ₹800-1100 |
| BAJAJ | Bajaj Auto | ₹4000-5000 |
| MARUTI | Maruti Suzuki | ₹9000-11000 |

## API Documentation

For detailed Kotak Neo API documentation, visit:
[https://kotaksecurities.github.io/kotak-neo-api/](https://kotaksecurities.github.io/kotak-neo-api/)

## Available Endpoints

### Chart Data
```
GET /api/chart/:symbol
```
Returns candlestick data for the specified symbol.

**Example:**
```bash
curl http://localhost:5000/api/chart/INFY
```

**Response:**
```json
{
  "symbol": "INFY",
  "candles": [
    {
      "timestamp": "2025-11-24T12:30:00.000Z",
      "open": 250.50,
      "high": 252.30,
      "low": 248.90,
      "close": 251.20,
      "volume": 50000
    }
  ]
}
```

### Trade Execution
```
POST /api/trades
```
Place a new trade.

**Body:**
```json
{
  "symbol": "INFY",
  "side": "BUY",
  "quantity": 10
}
```

## Fallback to Mock Data

If API credentials are not configured, the system automatically uses mock data for testing and development. This is useful for:
- Local development
- Testing the UI
- Understanding the trading flow

To enable mock mode, simply don't set the environment variables.

## Troubleshooting

### "Failed to fetch" errors
- Check that your API credentials are correct
- Verify the `.env` file is in the correct location
- Ensure the Kotak Neo API is accessible from your network

### No chart data appearing
- The chart updates every 10 seconds
- Give it a moment to fetch and display data
- Check browser console for errors

### Wrong stock prices
- Verify your credentials are configured
- Check that you're using the correct symbol names (UPPERCASE)
- Ensure your Kotak account has access to the symbols you're trading

## Security Notes

⚠️ **Never commit `.env` file to version control**

The `.env` file contains sensitive API credentials. It's already in `.gitignore`, but verify before pushing to GitHub.

```bash
# Verify .env is ignored
git status
```

## Next Steps

1. ✅ Configure `.env` with your credentials
2. ✅ Restart the server: `npm start`
3. ✅ Open http://localhost:5000
4. ✅ Watch live candlestick charts
5. ✅ Start trading!

## Support

For issues or questions:
- Check the [Kotak Neo API docs](https://kotaksecurities.github.io/kotak-neo-api/)
- Review the integration code in `/config/kotakNeoApi.js`
- Check browser console for error messages
