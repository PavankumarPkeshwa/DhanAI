const { getLiveQuote } = require("../config/angelApi");
const { decide } = require("./aiAgent");
const { executeTrade } = require("./tradeService");

let _timer = null;
const SYMBOLS = ["RELIANCE", "TCS", "INFY"];

function loop() {
  SYMBOLS.forEach(async (symbol) => {
    try {
      const { price } = getLiveQuote(symbol);
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