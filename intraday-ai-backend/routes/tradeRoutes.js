const express = require("express");
const { listTrades, manualTrade, resetTrades, startAuto, stopAuto } = require("../controllers/tradeController");
const router = express.Router();

router.get("/", listTrades);
router.post("/", manualTrade);
router.delete("/", resetTrades);

router.post("/auto/start", startAuto);
router.post("/auto/stop", stopAuto);

module.exports = router;