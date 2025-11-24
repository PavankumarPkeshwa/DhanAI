const { getLiveQuote, addCandle } = require("../config/kotakNeoApi");
const { decide } = require("./aiAgent");
const { executeTrade } = require("./tradeService");
const socketService = require('./socket');

let _timer = null;
const SYMBOLS = ["RELIANCE", "TCS", "INFY"];

function loop() {
  SYMBOLS.forEach(async (symbol) => {
    try {
      const { price } = getLiveQuote(symbol);
      
      // Add price to candle history for charting
      addCandle(symbol, price);
      // Emit live price and candle update over websocket if available
      try {
        const io = socketService.getIO();
        if (io) {
          io.emit('price', { symbol, price, ts: new Date().toISOString() });
          // send latest candle for symbol
          const candles = require('../config/kotakNeoApi').priceHistory[symbol] || [];
          io.emit('candle', { symbol, candles });
        }
      } catch (err) {
        console.error('Socket emit error:', err.message);
      }
      
      const decision = decide({ symbol, price });
      if (decision.side !== "HOLD" && decision.quantity > 0) {
        await executeTrade({
          symbol,
          side: decision.side,
          quantity: decision.quantity,
          price,
          source: "AUTO"
        });
        console.log(`🔁 AUTO ${decision.side} ${decision.quantity} ${symbol} @ ${price} | ${decision.reason}`);
      }
    } catch (e) {
      console.error("Scheduler error:", e.message);
    }
  });
}

function startScheduler() {
  if (_timer) return; // already running
  console.log("🕒 Scheduler started (every 5s) …");
  _timer = setInterval(loop, 5000);
}

function stopScheduler() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
    console.log("🛑 Scheduler stopped.");
  }
}

module.exports = { startScheduler, stopScheduler };