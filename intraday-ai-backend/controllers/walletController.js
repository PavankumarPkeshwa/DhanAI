const Wallet = require("../models/Wallet");

async function getWallet(req, res) {
  try {
    const wallet = Wallet.get();
    res.json(wallet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function setWallet(req, res) {
  try {
    const { balance } = req.body;
    if (typeof balance !== "number" || balance < 0) {
      return res.status(400).json({ error: "balance must be a non-negative number" });
    }
    const updated = Wallet.setBalance(balance);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getWallet, setWallet };