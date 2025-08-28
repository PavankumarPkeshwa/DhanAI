// Simple in-memory store. Swap with Mongo/Postgres later if needed.

const db = {
  wallet: {
    balance: 100000,        // editable dummy balance
    positions: {}           // { SYMBOL: { quantity, avgPrice } }
  },
  trades: [],
  prices: {},               // { SYMBOL: [ ...recentPrices ] }
  symbols: {}               // per-symbol state (e.g., lastPrice)
};

function getSymbolState(symbol) {
  return db.symbols[symbol];
}

function upsertSymbolState(symbol, patch) {
  db.symbols[symbol] = { ...(db.symbols[symbol] || {}), ...patch };
  return db.symbols[symbol];
}

function pushPrice(symbol, price, maxLen = 200) {
  if (!db.prices[symbol]) db.prices[symbol] = [];
  db.prices[symbol].push(price);
  if (db.prices[symbol].length > maxLen) db.prices[symbol].shift();
  return db.prices[symbol];
}

function sma(arr, n) {
  if (!arr || arr.length < n) return null;
  let sum = 0;
  for (let i = arr.length - n; i < arr.length; i++) sum += arr[i];
  return +(sum / n).toFixed(6);
}

function getPositionQty(symbol) {
  const pos = db.wallet.positions[symbol];
  return pos ? pos.quantity : 0;
}

module.exports = {
  db,
  getSymbolState,
  upsertSymbolState,
  pushPrice,
  sma,
  getPositionQty
};