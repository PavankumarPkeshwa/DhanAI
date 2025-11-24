/**
 * Kotak Neo API Integration
 * 
 * Setup Instructions:
 * 1. Sign up at https://kotakneostocks.kotaksecurities.com/
 * 2. Generate API credentials (Consumer Key, Consumer Secret, Access Token)
 * 3. Add these to a .env file:
 *    KOTAK_NEO_CONSUMER_KEY=your_consumer_key
 *    KOTAK_NEO_CONSUMER_SECRET=your_consumer_secret
 *    KOTAK_NEO_ACCESS_TOKEN=your_access_token
 * 
 * API Docs: https://kotaksecurities.github.io/kotak-neo-api/
 */

require('dotenv').config();
const { getInstrumentToken, getMappedSymbols } = require('./instrumentTokens');

const BASE_URL = 'https://api.kotaksecurities.com/api/v1';

// Kotak Neo API credentials (from environment variables)
const credentials = {
  consumerKey: process.env.KOTAK_NEO_CONSUMER_KEY || 'YOUR_CONSUMER_KEY',
  consumerSecret: process.env.KOTAK_NEO_CONSUMER_SECRET || 'YOUR_CONSUMER_SECRET',
  accessToken: process.env.KOTAK_NEO_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN',
};

// Price cache to avoid too many API calls (5 min TTL)
const priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Historical price data for charting (stores last 50 candles per symbol)
const priceHistory = {};

/**
 * Make authenticated request to Kotak Neo API
 */
async function makeRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.accessToken}`,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Kotak Neo API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Get live quote for a symbol
 * Symbol format: NSE_EQ|INE002A01018 (for INFY)
 * Simplified: Use token directly like "NIL" or common stock codes
 */
async function getLiveQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = priceCache.get(cacheKey);

  // Return cached price if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      symbol,
      price: cached.price,
      ts: new Date().toISOString(),
    };
  }

  try {
    // Map symbol to NSE token
    const tokenMap = {
      'INFY': 'NIL',  // Infosys - Will be replaced with actual token
      'TCS': 'NIL',
      'RELIANCE': 'NIL',
      'WIPRO': 'NIL',
      'HDFC': 'NIL',
      'ICICIBANK': 'NIL',
      'BAJAJ': 'NIL',
      'MARUTI': 'NIL',
    };

    // For now, using mock data as Kotak API requires proper authentication
    // Replace this with actual API call once credentials are set up
    const mockPrice = await getMockPrice(symbol);

    // Store in cache
    priceCache.set(cacheKey, {
      price: mockPrice,
      timestamp: Date.now(),
    });

    return {
      symbol,
      price: mockPrice,
      ts: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to get quote for ${symbol}:`, error);
    // Fallback to mock data
    const mockPrice = await getMockPrice(symbol);
    return {
      symbol,
      price: mockPrice,
      ts: new Date().toISOString(),
    };
  }
}

/**
 * Get historical candle data for charting
 * Real Kotak implementation: GET /chart/instruments/candles?instrumentToken=TOKEN&interval=1&count=50
 * Returns last 50 candles with OHLC data
 */
async function getHistoricalCandles(symbol, interval = '1') {
  try {
    const token = getInstrumentToken(symbol);
    if (token && credentials.accessToken !== 'YOUR_ACCESS_TOKEN') {
      // TODO: Implement real Kotak OHLC call when credentials are valid
      // const endpoint = `/chart/instruments/candles?instrumentToken=${token}&interval=${interval}&count=50`;
      // const response = await makeRequest(endpoint);
      // if (response && response.candles) return response.candles;
    }
    
    // Fallback: Return mock data
    if (!priceHistory[symbol]) {
      priceHistory[symbol] = [];
    }

    const candles = priceHistory[symbol];
    
    // Generate mock candles if empty
    if (candles.length === 0) {
      let price = 250 + Math.random() * 100;
      for (let i = 50; i > 0; i--) {
        const drift = (Math.random() - 0.5) * 20;
        price = Math.max(200, price + drift);
        
        const timestamp = new Date(Date.now() - i * 60000);
        candles.push({
          timestamp: timestamp.toISOString(),
          open: price - Math.random() * 5,
          high: price + Math.random() * 10,
          low: price - Math.random() * 10,
          close: price,
          volume: Math.floor(Math.random() * 1000000),
        });
      }
    }

    return candles;
  } catch (error) {
    console.error(`Failed to get historical candles for ${symbol}:`, error);
    return [];
  }
}

/**
 * Add new candle to history (called on each price update)
 */
function addCandle(symbol, price) {
  if (!priceHistory[symbol]) {
    priceHistory[symbol] = [];
  }

  const candles = priceHistory[symbol];
  const now = new Date();
  
  if (candles.length === 0) {
    // First candle
    candles.push({
      timestamp: now.toISOString(),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1,
    });
  } else {
    const lastCandle = candles[candles.length - 1];
    const lastTime = new Date(lastCandle.timestamp);
    
    // If more than 1 minute passed, create new candle
    if (now - lastTime > 60000) {
      candles.push({
        timestamp: now.toISOString(),
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 1,
      });
    } else {
      // Update current candle - ensure all values are initialized
      if (!lastCandle.open) lastCandle.open = price;
      if (!lastCandle.high) lastCandle.high = price;
      if (!lastCandle.low) lastCandle.low = price;
      
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.close = price;
      lastCandle.volume = (lastCandle.volume || 0) + 1;
    }
  }

  // Keep only last 100 candles
  if (candles.length > 100) {
    candles.shift();
  }
}

/**
 * Mock price data generator (replace with real API calls)
 */
async function getMockPrice(symbol) {
  const ranges = {
    'INFY': { min: 200, max: 400 },
    'TCS': { min: 200, max: 400 },
    'RELIANCE': { min: 250, max: 350 },
    'WIPRO': { min: 300, max: 450 },
    'BAJAJ': { min: 4000, max: 5000 },
    'MARUTI': { min: 9000, max: 11000 },
    'HDFC': { min: 2500, max: 3000 },
    'ICICIBANK': { min: 800, max: 1100 },
  };

  const range = ranges[symbol] || { min: 200, max: 500 };
  return +(range.min + Math.random() * (range.max - range.min)).toFixed(2);
}

/**
 * Place an order
 * Real implementation would use Kotak Neo placeOrder endpoint
 */
async function placeOrder({ symbol, side, quantity, price }) {
  try {
    // Real implementation:
    // POST /orders
    // {
    //   instrumentToken: token,
    //   transactionType: side,
    //   quantity: quantity,
    //   orderType: "REGULAR", // or "MARKET"
    //   price: price,
    //   ...
    // }

    return {
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      status: 'SUCCESS',
      symbol,
      side,
      quantity,
      price,
      ts: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to place order:', error);
    throw error;
  }
}

/**
 * Get account holdings
 */
async function getHoldings() {
  try {
    // Real implementation:
    // GET /portfolio/holdings
    
    return {
      holdings: [],
      ts: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get holdings:', error);
    throw error;
  }
}

/**
 * Validate credentials
 */
async function validateCredentials() {
  if (!credentials.accessToken || credentials.accessToken === 'YOUR_ACCESS_TOKEN') {
    console.warn('⚠️ Kotak Neo API credentials not configured. Using mock data.');
    console.warn('Configure .env file with KOTAK_NEO_* environment variables.');
    return false;
  }
  return true;
}

module.exports = {
  getLiveQuote,
  getHistoricalCandles,
  addCandle,
  placeOrder,
  getHoldings,
  validateCredentials,
  priceHistory,
};
