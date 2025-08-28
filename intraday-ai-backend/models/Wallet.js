const { db } = require("../utils/db");

function get() {
  return db.wallet;
}

function setBalance(amount) {
  db.wallet.balance = +amount;
  return get();
}

function credit(amount) {
  db.wallet.balance = +(db.wallet.balance + amount).toFixed(2);
  return db.wallet.balance;
}

function debit(amount) {
  db.wallet.balance = +(db.wallet.balance - amount).toFixed(2);
  return db.wallet.balance;
}

function canSell(symbol, qty) {
  const pos = db.wallet.positions[symbol];
  return pos && pos.quantity >= qty;
}

// Maintains positions + average price
function applyTrade({ symbol, side, quantity, price }) {
  const pos = db.wallet.positions[symbol] || { quantity: 0, avgPrice: 0 };
  if (side === "BUY") {
    const newQty = pos.quantity + quantity;
    const newAvg = (pos.quantity * pos.avgPrice + quantity * price) / newQty;
    db.wallet.positions[symbol] = { quantity: newQty, avgPrice: +newAvg.toFixed(4) };
  } else if (side === "SELL") {
    const newQty = pos.quantity - quantity;
    if (newQty <= 0) {
      delete db.wallet.positions[symbol];
    } else {
      db.wallet.positions[symbol] = { quantity: newQty, avgPrice: pos.avgPrice };
    }
  }
}

module.exports = { get, setBalance, credit, debit, canSell, applyTrade };