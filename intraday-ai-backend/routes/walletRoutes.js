const express = require("express");
const { getWallet, setWallet } = require("../controllers/walletController");
const router = express.Router();

router.get("/", getWallet);
router.put("/", setWallet);

module.exports = router;