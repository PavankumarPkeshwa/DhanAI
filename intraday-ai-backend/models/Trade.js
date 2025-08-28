const { db } = require("../utils/db");

function create(trade) {
  const record = {
    id: `T-${Date.now()}-${Math.floor(Math.random()*1e4)}`,
    ts: new Date().toISOString(),
    ...trade
  };
  db.trades.unshift(record);
  return record;
}

function list() {
  return db.trades;
}

function reset() {
  db.trades = [];
}

module.exports = { create, list, reset };