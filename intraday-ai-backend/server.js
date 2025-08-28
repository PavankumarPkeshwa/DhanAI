const express = require("express");
const cors = require("cors");

const walletRoutes = require("./routes/walletRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const { startScheduler } = require("./services/scheduler");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/wallet", walletRoutes);
app.use("/api/trades", tradeRoutes);

// Start scheduler (auto-trading loop)
startScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));