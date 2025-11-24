// Instrument Token Mapping for Kotak Neo API
// Maps stock symbols to their Kotak Neo instrument tokens
// Use this to enable real OHLC data from Kotak instead of mock fallback

const INSTRUMENT_TOKENS = {
    'INFY': 'INFY-EQ',          // Infosys
    'TCS': 'TCS-EQ',            // Tata Consultancy Services
    'RELIANCE': 'RELIANCE-EQ',  // Reliance Industries
    'WIPRO': 'WIPRO-EQ',        // Wipro
    'HDFC': 'HDFCBANK-EQ',      // HDFC Bank
    'ICICIBANK': 'ICICIBANK-EQ',// ICICI Bank
    'BAJAJ': 'BAJAJFINSV-EQ',   // Bajaj Financial Services
    'MARUTI': 'MARUTI-EQ',      // Maruti Suzuki
};

// Get instrument token for a symbol
function getInstrumentToken(symbol) {
    return INSTRUMENT_TOKENS[symbol] || null;
}

// Get all mapped symbols
function getMappedSymbols() {
    return Object.keys(INSTRUMENT_TOKENS);
}

module.exports = {
    INSTRUMENT_TOKENS,
    getInstrumentToken,
    getMappedSymbols,
};
