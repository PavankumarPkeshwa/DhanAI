// Use relative API paths for same-origin requests
const API_BASE = '/api';

// State
let appState = {
    autoTrading: false,
    trades: [],
    wallet: { balance: 0, positions: {} },
    initialBalance: 100000,
    currentSymbol: 'INFY',
};

// Chart objects
let chart = null;
let candleseries = null;

// DOM Elements
const elements = {
    balance: document.getElementById('balance'),
    pnl: document.getElementById('pnl'),
    positionCount: document.getElementById('positionCount'),
    totalTrades: document.getElementById('totalTrades'),
    winRate: document.getElementById('winRate'),
    avgProfit: document.getElementById('avgProfit'),
    maxDrawdown: document.getElementById('maxDrawdown'),
    tradesBody: document.getElementById('tradesBody'),
    activityLog: document.getElementById('activityLog'),
    autoStatus: document.getElementById('autoStatus'),
    startAutoBtn: document.getElementById('startAutoBtn'),
    stopAutoBtn: document.getElementById('stopAutoBtn'),
    tradeForm: document.getElementById('tradeForm'),
    symbol: document.getElementById('symbol'),
    quantity: document.getElementById('quantity'),
    refreshBtn: document.getElementById('refreshBtn'),
    resetBtn: document.getElementById('resetBtn'),
    chartSymbol: document.getElementById('chartSymbol'),
    statusBadge: document.getElementById('statusBadge'),
};

// Socket.IO client (will be initialized in init)
let socket = null;

// Initialize App
async function init() {
    console.log('🚀 Initializing DhanAI Dashboard...');
    addLog('✅ Dashboard initialized');
    
    setupEventListeners();
    initChart();
    await refreshChart();
    await refreshData();
    
    // Refresh data every 3 seconds
    setInterval(refreshData, 3000);
    // Refresh chart every 10 seconds
    setInterval(refreshChart, 10000);

    // Initialize socket connection for live updates
    try {
        socket = io();

        socket.on('connect', () => {
            elements.statusBadge.querySelector('.status-dot').style.background = '#10b981';
            elements.statusBadge.childNodes[1].nodeValue = ' Connected';
            addLog('🔌 Real-time socket connected');
        });

        socket.on('disconnect', () => {
            elements.statusBadge.querySelector('.status-dot').style.background = '#ef4444';
            elements.statusBadge.childNodes[1].nodeValue = ' Disconnected';
            addLog('⚠️ Real-time socket disconnected', 'error');
        });

        socket.on('price', (payload) => {
            // payload: { symbol, price, ts }
            if (!payload || !payload.symbol) return;
            // If the price is for the currently selected symbol, show it
            if (payload.symbol === appState.currentSymbol) {
                const priceStr = ` • ₹${Number(payload.price).toFixed(2)}`;
                // Append price to status badge (if not present)
                if (!elements.statusBadge.dataset.showingPrice) {
                    elements.statusBadge.dataset.showingPrice = '1';
                }
                // Update text (keep the status-dot element)
                elements.statusBadge.childNodes[1].nodeValue = ` Connected${priceStr}`;
            }
        });

        socket.on('candle', (payload) => {
            // payload: { symbol, candles }
            if (!payload || payload.symbol !== appState.currentSymbol) return;
            if (payload.candles && candleseries) {
                const data = payload.candles.map(candle => ({
                    time: Math.floor(new Date(candle.timestamp).getTime() / 1000),
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                }));

                // Replace the series data with the new candles
                candleseries.setData(data);
                chart.timeScale().fitContent();
                addLog(`📈 Live chart updated (${payload.candles.length} candles)`);
            }
        });
    } catch (e) {
        console.warn('Socket init failed:', e.message);
    }
}

function setupEventListeners() {
    elements.startAutoBtn.addEventListener('click', startAutoTrading);
    elements.stopAutoBtn.addEventListener('click', stopAutoTrading);
    elements.tradeForm.addEventListener('submit', handleManualTrade);
    elements.refreshBtn.addEventListener('click', refreshData);
    elements.resetBtn.addEventListener('click', resetTrades);
    elements.chartSymbol.addEventListener('change', onChartSymbolChange);
}

function initChart() {
    const container = document.getElementById('chartContainer');
    
    chart = LightweightCharts.createChart(container, {
        layout: {
            textColor: '#cbd5e1',
            background: { color: '#334155' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
        },
        width: container.clientWidth,
        height: 400,
    });

    candleseries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
    });

    chart.timeScale().fitContent();
}

// API Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            let error = `HTTP ${response.status}`;
            try {
                const data = await response.json();
                error = data.error || error;
            } catch (e) {
                // Response was not JSON
            }
            throw new Error(error);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        if (error instanceof TypeError) {
            addLog(`❌ Network error: ${error.message}`, 'error');
        } else {
            addLog(`❌ ${error.message}`, 'error');
        }
        throw error;
    }
}

// Auto Trading Controls
async function startAutoTrading() {
    try {
        await fetchAPI('/trades/auto/start', { method: 'POST' });
        appState.autoTrading = true;
        updateAutoTradingUI();
        addLog('✅ Auto trading started');
    } catch (error) {
        console.error('Error starting auto trading:', error);
    }
}

async function stopAutoTrading() {
    try {
        await fetchAPI('/trades/auto/stop', { method: 'POST' });
        appState.autoTrading = false;
        updateAutoTradingUI();
        addLog('⛔ Auto trading stopped');
    } catch (error) {
        console.error('Error stopping auto trading:', error);
    }
}

// Manual Trade Handler
async function handleManualTrade(e) {
    e.preventDefault();

    const symbol = elements.symbol.value.toUpperCase();
    const side = document.querySelector('input[name="side"]:checked').value;
    const quantity = parseInt(elements.quantity.value);

    if (!symbol || !side || !quantity) {
        addLog('❌ Please fill in all fields', 'error');
        return;
    }

    try {
        const result = await fetchAPI('/trades', {
            method: 'POST',
            body: JSON.stringify({ symbol, side, quantity }),
        });

        addLog(`✅ Trade executed: ${side} ${quantity} ${symbol}`);
        elements.tradeForm.reset();
        await refreshData();
    } catch (error) {
        console.error('Trade error:', error);
    }
}

// Reset Trades
async function resetTrades() {
    if (confirm('Are you sure you want to reset all trades? This cannot be undone.')) {
        try {
            await fetchAPI('/trades', { method: 'DELETE' });
            appState.trades = [];
            addLog('🔄 All trades reset');
            await refreshData();
        } catch (error) {
            console.error('Reset error:', error);
        }
    }
}

// Data Refresh
async function refreshData() {
    try {
        const [wallet, trades] = await Promise.all([
            fetchAPI('/wallet'),
            fetchAPI('/trades'),
        ]);

        appState.wallet = wallet;
        appState.trades = trades || [];

        updateWalletDisplay();
        updateTradesDisplay();
        updateStats();
    } catch (error) {
        console.error('Refresh error:', error);
    }
}

// Update UI
function updateWalletDisplay() {
    const { balance } = appState.wallet;
    const pnl = balance - appState.initialBalance;
    const pnlPercent = ((pnl / appState.initialBalance) * 100).toFixed(2);

    elements.balance.textContent = `₹${balance.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    const pnlElement = elements.pnl;
    pnlElement.textContent = `${pnl >= 0 ? '+' : ''}₹${Math.abs(pnl).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} (${pnlPercent}%)`;
    pnlElement.className = `amount ${pnl >= 0 ? 'profit' : 'loss'}`;

    const positions = Object.keys(appState.wallet.positions || {}).length;
    elements.positionCount.textContent = positions;
}

function updateTradesDisplay() {
    const trades = appState.trades;

    if (trades.length === 0) {
        elements.tradesBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">No trades yet. Start auto trading or place a manual trade.</td>
            </tr>
        `;
        return;
    }

    elements.tradesBody.innerHTML = trades
        .slice()
        .reverse()
        .map((trade) => {
            // Use 'ts' field from API (ISO timestamp)
            const time = new Date(trade.ts).toLocaleTimeString('en-IN');
            const total = (trade.quantity * trade.price).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            const pnl = trade.pnl || 0;
            const pnlClass = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
            const sideClass = trade.side === 'BUY' ? 'side-buy' : 'side-sell';
            const sourceClass = trade.source === 'AUTO' ? 'source-auto' : 'source-manual';

            return `
                <tr>
                    <td>${time}</td>
                    <td><strong>${trade.symbol}</strong></td>
                    <td class="${sideClass}">${trade.side}</td>
                    <td>${trade.quantity}</td>
                    <td>₹${trade.price.toFixed(2)}</td>
                    <td>₹${total}</td>
                    <td><span class="${sourceClass}">${trade.source}</span></td>
                    <td class="${pnlClass}">₹${pnl.toFixed(2)}</td>
                </tr>
            `;
        })
        .join('');
}

function updateStats() {
    const trades = appState.trades;

    // Total Trades
    elements.totalTrades.textContent = trades.length;

    // Win Rate
    if (trades.length > 0) {
        const winningTrades = trades.filter((t) => (t.pnl || 0) > 0).length;
        const winRate = ((winningTrades / trades.length) * 100).toFixed(1);
        elements.winRate.textContent = `${winRate}%`;
    } else {
        elements.winRate.textContent = '0%';
    }

    // Average Profit
    if (trades.length > 0) {
        const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const avgProfit = totalPnL / trades.length;
        elements.avgProfit.textContent = `₹${avgProfit.toFixed(2)}`;
    } else {
        elements.avgProfit.textContent = '₹0.00';
    }

    // Max Drawdown (simple calculation)
    if (trades.length > 0) {
        let maxBalance = appState.initialBalance;
        let maxDrawdown = 0;
        let currentBalance = appState.initialBalance;

        for (const trade of trades) {
            currentBalance -= trade.pnl || 0;
            if (currentBalance > maxBalance) {
                maxBalance = currentBalance;
            } else {
                const drawdown = ((maxBalance - currentBalance) / maxBalance) * 100;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
            }
        }

        elements.maxDrawdown.textContent = `${maxDrawdown.toFixed(2)}%`;
    } else {
        elements.maxDrawdown.textContent = '0%';
    }
}

function updateAutoTradingUI() {
    const isActive = appState.autoTrading;

    elements.startAutoBtn.disabled = isActive;
    elements.stopAutoBtn.disabled = !isActive;

    elements.autoStatus.textContent = isActive
        ? '🟢 Status: Active (running every 5s)'
        : '🔴 Status: Inactive';
    elements.autoStatus.style.color = isActive ? 'var(--success-color)' : 'var(--danger-color)';
}

// Activity Log
function addLog(message, type = 'info') {
    const logItem = document.createElement('div');
    logItem.className = 'activity-item';

    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    logItem.innerHTML = `
        <span class="time">${timeStr}</span>
        <span class="message">${message}</span>
    `;

    elements.activityLog.insertBefore(logItem, elements.activityLog.firstChild);

    // Keep only last 50 items
    while (elements.activityLog.children.length > 50) {
        elements.activityLog.removeChild(elements.activityLog.lastChild);
    }
}

// Chart Functions
async function refreshChart() {
    try {
        const symbol = appState.currentSymbol;
        const response = await fetchAPI(`/chart/${symbol}`);
        
        if (response.candles && candleseries) {
            // Convert candles to TradingView format
            const data = response.candles.map(candle => ({
                time: Math.floor(new Date(candle.timestamp).getTime() / 1000),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));
            
            candleseries.setData(data);
            chart.timeScale().fitContent();
        }
    } catch (error) {
        console.error('Failed to refresh chart:', error);
    }
}

async function onChartSymbolChange(e) {
    appState.currentSymbol = e.target.value;
    await refreshChart();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
