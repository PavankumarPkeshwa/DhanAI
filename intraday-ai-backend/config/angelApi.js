// Mock Angel One API layer (random-walk quotes).
// Using Indian stock symbols and rupee-appropriate price ranges
// Swap these functions with real Angel One SDK calls when you go live.

const { getSymbolState, upsertSymbolState } = require("../utils/db");

// Indian stock price ranges (in INR)
const STOCK_RANGES = {
  'INFY': { min: 200, max: 400 },      // Infosys
  'TCS': { min: 200, max: 400 },       // Tata Consultancy Services
  'RELIANCE': { min: 250, max: 350 },  // Reliance Industries
  'WIPRO': { min: 300, max: 450 },     // Wipro
  'BAJAJ': { min: 4000, max: 5000 },   // Bajaj Auto
  'MARUTI': { min: 9000, max: 11000 }, // Maruti Suzuki
  'HDFC': { min: 2500, max: 3000 },    // HDFC Bank
  'ICICIBANK': { min: 800, max: 1100 }, // ICICI Bank
};

function getLiveQuote(symbol) {
  // Random-walk price generator held in memory per symbol
  const range = STOCK_RANGES[symbol] || { min: 200, max: 500 };
  const state = getSymbolState(symbol) || { lastPrice: range.min + Math.random() * (range.max - range.min) };
  const drift = (Math.random() - 0.5) * 10; // -5..+5 for more realistic movement
  const next = Math.max(range.min, Math.min(range.max, +(state.lastPrice + drift).toFixed(2)));

  upsertSymbolState(symbol, { lastPrice: next, lastAt: Date.now() });
  return { symbol, price: next, ts: new Date().toISOString() };
}

async function placeOrder({ symbol, side, quantity, price }) {
  // Mock order ack — replace with real Angel order placement
  return {
    orderId: `ORD-${Date.now()}`,
    status: "SUCCESS",
    symbol,
    side,
    quantity,
    price,
    ts: new Date().toISOString()
  };
}

module.exports = { getLiveQuote, placeOrder };