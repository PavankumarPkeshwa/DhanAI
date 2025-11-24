const express = require("express");
const cors = require("cors");
const path = require("path");

const walletRoutes = require("./routes/walletRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const chartRoutes = require("./routes/chartRoutes");
const { startScheduler } = require("./services/scheduler");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use("/api/wallet", walletRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/chart", chartRoutes);

// Serve index.html for root path
app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server and attach socket.io
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./services/socket');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

socketService.setIO(io);

io.on('connection', (socket) => {
    console.log('🔌 Client connected to socket:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// Start scheduler (auto-trading loop)
startScheduler();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));