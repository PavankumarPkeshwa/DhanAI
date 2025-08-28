// Simple rule-based AI (placeholder).
// Uses SMA(10) vs current price + basic position awareness.
// Later: replace with real ML model, features, confidence, etc.

const { pushPrice, sma, getPositionQty } = require("../utils/db");

function decide({ symbol, price }) {
  // Update price history & compute SMA
  const history = pushPrice(symbol, price);
  const sma10 = sma(history, 10);

  const pos = getPositionQty(symbol); // current holding qty (can be 0)
  const below = sma10 !== null && price < sma10 * 0.998; // small buffer
  const above = sma10 !== null && price > sma10 * 1.002;

  if (pos > 0 && above) {
    return { side: "SELL", quantity: Math.max(1, Math.floor(pos / 2)), reason: "Price above SMA, taking profit" };
  }
  if (below) {
    return { side: "BUY", quantity: 1, reason: "Price below SMA, mean reversion" };
  }
  return { side: "HOLD", quantity: 0, reason: "No edge" };
}

module.exports = { decide };