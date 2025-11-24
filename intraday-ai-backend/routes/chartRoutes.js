const express = require("express");
const { getHistoricalCandles } = require("../config/kotakNeoApi");
const router = express.Router();

/**
 * GET /api/chart/:symbol
 * Returns historical candlestick data for charting
 */
router.get("/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const candles = await getHistoricalCandles(symbol.toUpperCase());
    res.json({
      symbol: symbol.toUpperCase(),
      candles,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
