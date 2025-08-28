const Trade = require("../models/Trade");
const { executeTrade } = require("../services/tradeService");
const { getLiveQuote } = require("../config/angelApi");
const Scheduler = require("../services/scheduler");

async function listTrades(req, res) {
  try {
    const trades = Trade.list();
    res.json(trades);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function manualTrade(req, res) {
  try {
    const { symbol, side, quantity } = req.body;
    if (!symbol || !["BUY", "SELL"].includes(side) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Required: symbol, side (BUY/SELL), quantity > 0" });
    }
    const { price } = getLiveQuote(symbol);
    const result = await executeTrade({ symbol, side, quantity, price, source: "MANUAL" });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function resetTrades(req, res) {
  try {
    Trade.reset();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function startAuto(req, res) {
  Scheduler.startScheduler();
  res.json({ running: true });
}

function stopAuto(req, res) {
  Scheduler.stopScheduler();
  res.json({ running: false });
}

module.exports = { listTrades, manualTrade, resetTrades, startAuto, stopAuto };