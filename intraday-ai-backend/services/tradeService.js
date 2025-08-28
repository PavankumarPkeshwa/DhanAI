const Wallet = require("../models/Wallet");
const Trade = require("../models/Trade");
const { placeOrder } = require("../config/angelApi");

async function executeTrade({ symbol, side, quantity, price, source }) {
  const wallet = Wallet.get();

  // Basic risk checks
  if (side === "BUY") {
    const cost = +(price * quantity).toFixed(2);
    if (wallet.balance < cost) throw new Error("Insufficient funds");
    Wallet.debit(cost);
  } else if (side === "SELL") {
    if (!Wallet.canSell(symbol, quantity)) {
      throw new Error("Insufficient holdings to sell");
    }
    const credit = +(price * quantity).toFixed(2);
    Wallet.credit(credit);
  }

  // Update positions
  Wallet.applyTrade({ symbol, side, quantity, price });

  // Simulate placing order (replace with real API in production)
  const ack = await placeOrder({ symbol, side, quantity, price });

  // Log trade
  const trade = Trade.create({
    symbol,
    side,
    quantity,
    price,
    source: source || "AUTO",
    orderId: ack.orderId
  });

  return { trade, wallet: Wallet.get() };
}

module.exports = { executeTrade };