// Mock Angel One API layer (random-walk quotes).
// Swap these functions with real Angel One SDK calls when you go live.

const { getSymbolState, upsertSymbolState } = require("../utils/db");

function getLiveQuote(symbol) {
  // Random-walk price generator held in memory per symbol
  const state = getSymbolState(symbol) || { lastPrice: 200 + Math.random() * 200 };
  const drift = (Math.random() - 0.5) * 2; // -1..+1
  const next = Math.max(5, +(state.lastPrice + drift).toFixed(2));

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