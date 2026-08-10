const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

// Import default data as static fallbacks
const {
  STOCKS_DATABASE,
  MARKET_INDICES,
  INDIAN_IPOS,
  MUTUAL_FUNDS,
  INDIAN_MARKET_NEWS,
  CORPORATE_ACTIONS
} = require('./data/stocksData');

const { calculateTradeCharges } = require('./services/marketEngine');
const { generateAiInsights } = require('./services/aiEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'indian_stock_market_jwt_secret_key_2026';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: "Authorization token required" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

// Middleware to optionally capture token (for endpoints that can be public or private)
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};

// Helper: Clean ticker symbol
function cleanTickerSymbol(symbol) {
  let ticker = symbol.toUpperCase().trim();
  if (!ticker) return '';
  if (ticker.endsWith('.BSE')) {
    ticker = ticker.replace('.BSE', '.BO');
  }
  if (!ticker.includes('.')) {
    const usTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
    if (!usTickers.includes(ticker)) {
      ticker = ticker + '.NS';
    }
  }
  return ticker;
}

// Live Prices Cache
const livePricesCache = {};

// Fetch live price from Yahoo Finance
async function fetchYahooPrice(ticker) {
  const cleaned = cleanTickerSymbol(ticker);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleaned)}?range=1d&interval=1m`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`Yahoo Finance returned status ${res.status}`);
    const json = await res.json();
    if (json && json.chart && json.chart.result && json.chart.result[0]) {
      const result = json.chart.result[0];
      const meta = result.meta || {};
      const price = meta.regularMarketPrice || 0;
      const prevClose = meta.chartPreviousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      
      let high = price;
      let low = price;
      let open = price;
      let volume = 0;
      if (result.indicators && result.indicators.quote && result.indicators.quote[0]) {
        const quote = result.indicators.quote[0];
        const validHighs = (quote.high || []).filter(h => h !== null);
        const validLows = (quote.low || []).filter(l => l !== null);
        const validOpens = (quote.open || []).filter(o => o !== null);
        const validVolumes = (quote.volume || []).filter(v => v !== null);
        if (validHighs.length) high = Math.max(...validHighs);
        if (validLows.length) low = Math.min(...validLows);
        if (validOpens.length) open = validOpens[0];
        if (validVolumes.length) volume = validVolumes.reduce((a, b) => a + b, 0);
      }

      const stockData = {
        symbol: ticker.toUpperCase(),
        cleanedSymbol: cleaned,
        price: parseFloat(price.toFixed(2)),
        prevClose: parseFloat(prevClose.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        open: parseFloat(open.toFixed(2)),
        volume,
        exchange: meta.exchangeName || 'NSE',
        currency: meta.currency || 'INR',
        lastUpdated: new Date().toISOString()
      };
      
      // Update cache
      livePricesCache[ticker.toUpperCase()] = stockData;
      return stockData;
    }
  } catch (err) {
    console.warn(`⚠️ Live price lookup failed for ${ticker}:`, err.message);
  }
  
  // Return cached or fallback if lookup fails
  return livePricesCache[ticker.toUpperCase()] || null;
}

// Background task to refresh top stocks prices
async function refreshStockCache() {
  const defaultSymbols = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 
    'SBIN', 'LT', 'ZOMATO', 'PAYTM', 'SWIGGY', 
    'HAL', 'BEL', 'ITC', 'TATAMOTORS', 'IRCTC',
    'ONGC', 'ADANIENT', 'NTPC', 'POWERGRID', 'SUNPHARMA', 'MARUTI'
  ];
  for (const sym of defaultSymbols) {
    const data = await fetchYahooPrice(sym);
    if (!data) {
      // populate with mock fallback matching stocksData.js
      const localStock = STOCKS_DATABASE.find(s => s.symbol === sym);
      if (localStock) {
        livePricesCache[sym] = {
          symbol: sym,
          cleanedSymbol: cleanTickerSymbol(sym),
          price: localStock.price,
          prevClose: localStock.prevClose,
          change: localStock.change,
          changePercent: localStock.changePercent,
          high: localStock.high,
          low: localStock.low,
          open: localStock.open,
          volume: 1500000,
          exchange: 'NSE',
          currency: 'INR',
          lastUpdated: new Date().toISOString()
        };
      }
    }
    // Small delay to prevent hitting Yahoo rates
    await new Promise(r => setTimeout(r, 100));
  }
}

// Check if Indian market is open (Mon-Fri, 9:15 AM - 3:30 PM IST)
function getMarketStatus() {
  // Current time in IST (UTC+5:30)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));
  
  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeVal = hours * 100 + minutes;
  
  const isOpen = day >= 1 && day <= 5 && timeVal >= 915 && timeVal <= 1530;
  return {
    isOpen,
    statusText: isOpen ? "OPEN" : "MARKET CLOSED",
    lastUpdated: istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + " IST"
  };
}

// Start background cache updates
refreshStockCache();
setInterval(refreshStockCache, 60000); // refresh every 1 minute

// === AUTH ENDPOINTS ===
app.post('/api/auth/signup', async (req, res) => {
  const { firstname, lastname, email, mobile_number, pan_number, address, password, confirm_password } = req.body;

  if (!firstname || !lastname || !email || !mobile_number || !pan_number || !address || !password) {
    return res.status(400).json({ success: false, message: "All registration fields are required" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
  }

  try {
    // Check duplicates
    const [existing] = await db.query(
      "SELECT email, mobile_number, PANCARD_number FROM users WHERE email=? OR mobile_number=? OR PANCARD_number=?", 
      [email, mobile_number, pan_number]
    );

    if (existing.length > 0) {
      const dup = existing[0];
      if (dup.email === email) return res.status(400).json({ success: false, message: "Email already registered" });
      if (dup.mobile_number === mobile_number) return res.status(400).json({ success: false, message: "Mobile number already registered" });
      if (dup.PANCARD_number === pan_number) return res.status(400).json({ success: false, message: "PAN Card number already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const welcomeBalance = 100000.00; // ₹1,00,000 welcome virtual cash

    const [insertResult] = await db.query(
      "INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, available_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [firstname, lastname, address, email, hashedPassword, mobile_number, pan_number, welcomeBalance]
    );

    const userId = insertResult.insertId;
    const token = jwt.sign({ id: userId, email: email, name: `${firstname} ${lastname}` }, JWT_SECRET, { expiresIn: '7d' });

    // Insert welcome transaction
    await db.query(
      "INSERT INTO users_transaction (credit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
      [welcomeBalance, `DEP_${Math.floor(10000 + Math.random() * 90000)}`, "Welcome Wallet Fund Bonus", userId]
    );

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: `${firstname} ${lastname}`,
        email,
        mobile: mobile_number,
        pan: pan_number,
        address,
        kycStatus: "VERIFIED",
        availableBalance: welcomeBalance
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ success: false, message: "Database signup failed. Try again later." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email/Mobile and password are required" });
  }

  try {
    // Query by Email or Mobile number
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=? OR mobile_number=?", 
      [email, email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid credentials: email/mobile not found" });
    }

    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: `${user.firstname} ${user.lastname}` }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        mobile: user.mobile_number,
        pan: user.PANCARD_number,
        address: user.address,
        kycStatus: "VERIFIED",
        availableBalance: parseFloat(user.available_balance)
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Database login failed." });
  }
});

// === INDICES ===
app.get('/api/indices', async (req, res) => {
  const indexMappings = [
    { label: "NIFTY 50", symbol: "^NSEI" },
    { label: "SENSEX", symbol: "^BSESN" },
    { label: "NIFTY BANK", symbol: "^NSEBANK" },
    { label: "USD/INR", symbol: "USDINR=X" },
    { label: "NIFTY IT", symbol: "^CNXIT" },
    { label: "India VIX", symbol: "^INDIAVIX" }
  ];
  
  const results = [];
  const status = getMarketStatus();

  for (const idx of indexMappings) {
    const data = await fetchYahooPrice(idx.symbol);
    if (data) {
      results.push({
        symbol: idx.label,
        exchange: idx.symbol.includes('BSESN') ? 'BSE' : 'NSE',
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        high: data.high,
        low: data.low,
        status: data.change >= 0 ? "positive" : "negative",
        marketStatus: status.statusText
      });
    } else {
      // simulated fallback
      const local = MARKET_INDICES.find(m => m.symbol === idx.label);
      results.push({
        symbol: idx.label,
        exchange: idx.label === "SENSEX" ? "BSE" : "NSE",
        price: local ? local.price : 18000.00,
        change: local ? local.change : 100.00,
        changePercent: local ? local.changePercent : 0.55,
        status: local ? local.status : "positive",
        marketStatus: status.statusText
      });
    }
  }

  res.json({ success: true, marketStatus: status, data: results });
});

// === STOCKS DATABASE & SEARCH ===
app.get('/api/stocks', async (req, res) => {
  const stocks = [];
  
  for (const localStock of STOCKS_DATABASE) {
    const cached = livePricesCache[localStock.symbol];
    if (cached) {
      stocks.push({
        ...localStock,
        price: cached.price,
        change: cached.change,
        changePercent: cached.changePercent,
        high: cached.high,
        low: cached.low,
        open: cached.open,
        volume: cached.volume
      });
    } else {
      stocks.push(localStock);
    }
  }

  res.json({ success: true, data: stocks });
});

app.get('/api/stocks/search', async (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  // First search in our local cache list
  const filtered = STOCKS_DATABASE.filter(stock => 
    stock.symbol.toLowerCase().includes(query) || 
    stock.name.toLowerCase().includes(query) ||
    stock.sector.toLowerCase().includes(query)
  );

  const finalData = filtered.map(localStock => {
    const cached = livePricesCache[localStock.symbol];
    return cached ? {
      ...localStock,
      price: cached.price,
      change: cached.change,
      changePercent: cached.changePercent
    } : localStock;
  });

  // If query does not match any local stocks, do a live search on Yahoo Finance
  if (finalData.length === 0 && query.length > 1) {
    try {
      const yahooSearchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(yahooSearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await res.json();
      if (json && json.quotes) {
        const yahooQuotes = json.quotes
          .filter(q => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO') || q.quoteType === 'EQUITY'))
          .slice(0, 5)
          .map(q => ({
            symbol: q.symbol.replace('.NS', '').replace('.BO', ''),
            name: q.shortname || q.longname || q.symbol,
            exchange: q.exchange === 'BSE' ? 'BSE' : 'NSE',
            sector: 'Equity / Stock',
            price: 0,
            change: 0,
            changePercent: 0
          }));
        
        // Fetch prices for search results
        for (const q of yahooQuotes) {
          const priceInfo = await fetchYahooPrice(q.symbol);
          if (priceInfo) {
            q.price = priceInfo.price;
            q.change = priceInfo.change;
            q.changePercent = priceInfo.changePercent;
          }
        }
        return res.json({ success: true, data: yahooQuotes });
      }
    } catch (err) {
      console.warn("Yahoo search query failed:", err.message);
    }
  }

  res.json({ success: true, data: finalData });
});

app.get('/api/stocks/quote', async (req, res) => {
  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) {
    return res.status(400).json({ success: false, message: "Symbol query parameter is required" });
  }

  // Try fetching live price
  const livePrice = await fetchYahooPrice(symbol);
  
  // Find fundamental card profile matching the symbol
  const localProfile = STOCKS_DATABASE.find(s => s.symbol === symbol);
  
  if (!livePrice && !localProfile) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }

  const quote = {
    symbol,
    price: livePrice ? livePrice.price : (localProfile ? localProfile.price : 0),
    change: livePrice ? livePrice.change : (localProfile ? localProfile.change : 0),
    changePercent: livePrice ? livePrice.changePercent : (localProfile ? localProfile.changePercent : 0),
    prevClose: livePrice ? livePrice.prevClose : (localProfile ? localProfile.prevClose : 0),
    open: livePrice ? livePrice.open : (localProfile ? localProfile.open : 0),
    high: livePrice ? livePrice.high : (localProfile ? localProfile.high : 0),
    low: livePrice ? livePrice.low : (localProfile ? localProfile.low : 0),
    volume: livePrice ? livePrice.volume : (localProfile ? localProfile.volume : 0),
    lastUpdated: livePrice ? livePrice.lastUpdated : new Date().toISOString()
  };

  res.json({ success: true, data: quote });
});

app.get('/api/stocks/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  // Try fetching live price
  const livePrice = await fetchYahooPrice(symbol);
  
  // Find fundamental card profile matching the symbol
  const localProfile = STOCKS_DATABASE.find(s => s.symbol === symbol);
  
  if (!livePrice && !localProfile) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }

  // Merge fundamental data with live price details
  const finalProfile = {
    ...(localProfile || {
      symbol,
      name: symbol + " Ltd",
      sector: "Sector Equity",
      industry: "Generic Industry",
      marketCap: "₹20,000 Cr",
      peRatio: 22.4,
      pbRatio: 2.1,
      eps: "₹15.20",
      divYield: "1.0%",
      fiftyTwoHigh: (livePrice ? livePrice.price : 100) * 1.2,
      fiftyTwoLow: (livePrice ? livePrice.price : 100) * 0.8,
      bookValue: "₹150",
      roe: "12%",
      roce: "14%",
      faceValue: "₹10",
      circuitUpper: (livePrice ? livePrice.price : 100) * 1.1,
      circuitLower: (livePrice ? livePrice.price : 100) * 0.9,
      deliveryPercent: "50%",
      orderBook: {
        bids: [{ price: (livePrice ? livePrice.price : 100) - 0.5, qty: 1200 }],
        asks: [{ price: (livePrice ? livePrice.price : 100) + 0.5, qty: 1500 }]
      }
    }),
    price: livePrice ? livePrice.price : (localProfile ? localProfile.price : 0),
    change: livePrice ? livePrice.change : (localProfile ? localProfile.change : 0),
    changePercent: livePrice ? livePrice.changePercent : (localProfile ? localProfile.changePercent : 0),
    prevClose: livePrice ? livePrice.prevClose : (localProfile ? localProfile.prevClose : 0),
    open: livePrice ? livePrice.open : (localProfile ? localProfile.open : 0),
    high: livePrice ? livePrice.high : (localProfile ? localProfile.high : 0),
    low: livePrice ? livePrice.low : (localProfile ? localProfile.low : 0),
    volume: livePrice ? livePrice.volume.toLocaleString('en-IN') : (localProfile ? localProfile.volume : 0),
    exchange: livePrice ? livePrice.exchange : (localProfile ? localProfile.exchange : 'NSE')
  };

  res.json({ success: true, data: finalProfile });
});

app.get('/api/stocks/:symbol/chart', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const timeframe = req.query.timeframe || '1D';
  const cleaned = cleanTickerSymbol(symbol);

  // Timeframe configurations
  let range = '1d';
  let interval = '5m';

  switch (timeframe) {
    case '5D': range = '5d'; interval = '15m'; break;
    case '1M': range = '1mo'; interval = '1d'; break;
    case '3M': range = '3mo'; interval = '1d'; break;
    case '6M': range = '6mo'; interval = '1d'; break;
    case '1Y': range = '1y'; interval = '1d'; break;
    case '5Y': range = '5y'; interval = '1wk'; break;
    case 'ALL': range = 'max'; interval = '1mo'; break;
    default: range = '1d'; interval = '5m';
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleaned)}?range=${range}&interval=${interval}`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await response.json();
    if (json && json.chart && json.chart.result && json.chart.result[0]) {
      const resData = json.chart.result[0];
      const timestamps = resData.timestamp || [];
      const quote = resData.indicators.quote[0] || {};
      
      const candles = timestamps.map((ts, index) => {
        const openVal = quote.open[index];
        const highVal = quote.high[index];
        const lowVal = quote.low[index];
        const closeVal = quote.close[index];
        const volVal = quote.volume[index] || 0;

        // Skip missing candles
        if (closeVal === null || closeVal === undefined) return null;

        return {
          time: new Date(ts * 1000).toISOString(),
          open: parseFloat(openVal ? openVal.toFixed(2) : closeVal.toFixed(2)),
          high: parseFloat(highVal ? highVal.toFixed(2) : closeVal.toFixed(2)),
          low: parseFloat(lowVal ? lowVal.toFixed(2) : closeVal.toFixed(2)),
          close: parseFloat(closeVal.toFixed(2)),
          volume: Math.floor(volVal)
        };
      }).filter(c => c !== null);

      return res.json({ success: true, symbol, timeframe, data: candles });
    }
  } catch (err) {
    console.warn(`Chart fetch failed for ${symbol}:`, err.message);
  }

  // Local fallback data generator if Yahoo is down/blocked
  // Ensure we generate some nice mock candlesticks
  const points = timeframe === '1D' ? 40 : 30;
  const candles = [];
  let basePrice = 100;
  const localStock = STOCKS_DATABASE.find(s => s.symbol === symbol);
  if (localStock) basePrice = localStock.price;

  let currentPrice = basePrice * 0.95;
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now - i * 15 * 60 * 1000).toISOString();
    const open = currentPrice;
    const change = (Math.random() - 0.48) * (basePrice * 0.015);
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.005);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.005);
    
    candles.push({
      time: timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(5000 + Math.random() * 20000)
    });
    currentPrice = close;
  }

  res.json({ success: true, symbol, timeframe, data: candles });
});

// === ESTIMATE CHARGES ===
app.post('/api/orders/estimate', (req, res) => {
  const { type, qty, price } = req.body;
  const numQty = parseFloat(qty) || 1;
  const numPrice = parseFloat(price) || 100;
  const charges = calculateTradeCharges(type || "BUY", numQty, numPrice);
  res.json({ success: true, charges });
});

// === PORTFOLIO & HOLDINGS ===
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // 1. Fetch user available balance
    const [userRow] = await db.query("SELECT available_balance FROM users WHERE id=?", [userId]);
    if (userRow.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    
    const balance = parseFloat(userRow[0].available_balance);

    // 2. Fetch active stock details (holdings) grouped by ticker
    const [holdingsRows] = await db.query(
      `SELECT stock_name as symbol, SUM(qty) as qty, 
              SUM(purchase_price * qty) / SUM(qty) as avgPrice,
              SUM(purchase_price * qty) as investmentValue 
       FROM stock_details 
       WHERE user_id=? AND status=1 
       GROUP BY stock_name`,
      [userId]
    );

    let totalInvestment = 0;
    let currentPortfolioValue = 0;
    let todaysProfit = 0;

    const holdings = [];
    for (const row of holdingsRows) {
      const sym = row.symbol.replace('.NS', '').replace('.BO', '');
      const liveData = await fetchYahooPrice(sym);
      const currentPrice = liveData ? liveData.price : parseFloat(row.avgPrice);
      const dayChange = liveData ? liveData.change : 0;
      
      const qty = parseInt(row.qty, 10);
      const avgPrice = parseFloat(row.avgPrice);
      const investmentValue = parseFloat(row.investmentValue);
      const currentValue = qty * currentPrice;
      const pnl = currentValue - investmentValue;
      const pnlPercent = investmentValue > 0 ? (pnl / investmentValue) * 100 : 0;

      totalInvestment += investmentValue;
      currentPortfolioValue += currentValue;
      todaysProfit += qty * dayChange;

      holdings.push({
        symbol: sym,
        name: liveData ? liveData.symbol + " Ltd" : sym + " Equity",
        qty,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        investmentValue: parseFloat(investmentValue.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
        dayChange: parseFloat(dayChange.toFixed(2)),
        exchange: liveData ? liveData.exchange : 'NSE'
      });
    }

    const totalProfit = currentPortfolioValue - totalInvestment;
    const totalProfitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    const todaysProfitPercent = (currentPortfolioValue - todaysProfit) > 0 
      ? (todaysProfit / (currentPortfolioValue - todaysProfit)) * 100 
      : 0;

    // 3. Fetch past executed orders
    const [ordersRows] = await db.query(
      "SELECT * FROM orders WHERE user_id=? ORDER BY time DESC LIMIT 20",
      [userId]
    );

    const orders = ordersRows.map(o => ({
      id: `ORD-${o.id}`,
      symbol: o.symbol.replace('.NS', '').replace('.BO', ''),
      exchange: o.exchange,
      type: o.type,
      orderCategory: o.order_category,
      qty: o.qty,
      price: parseFloat(o.price),
      status: o.status,
      time: o.time,
      executedPrice: o.executed_price ? parseFloat(o.executed_price) : null,
      charges: parseFloat(o.charges)
    }));

    res.json({
      success: true,
      portfolio: {
        profile: {
          name: req.user.name,
          email: req.user.email,
          pan: "XXXXXX123X", // Masked in response
          kycStatus: "VERIFIED",
          availableBalance: parseFloat(balance.toFixed(2)),
          totalInvestment: parseFloat(totalInvestment.toFixed(2)),
          currentPortfolioValue: parseFloat(currentPortfolioValue.toFixed(2)),
          todaysProfit: parseFloat(todaysProfit.toFixed(2)),
          todaysProfitPercent: parseFloat(todaysProfitPercent.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          totalProfitPercent: parseFloat(totalProfitPercent.toFixed(2)),
          buyingPower: parseFloat((balance * 2).toFixed(2)) // 2x leverage power
        },
        holdings,
        orders
      }
    });
  } catch (err) {
    console.error("Portfolio Fetch Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio data" });
  }
});

// === ORDER EXECUTION ===
app.post('/api/orders/place', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { symbol, type, orderCategory, qty, price } = req.body;

  if (!symbol || !type || !orderCategory || !qty) {
    return res.status(400).json({ success: false, message: "Invalid order payload" });
  }

  const numQty = parseInt(qty, 10);
  if (numQty <= 0) return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });

  const cleanedSymbol = cleanTickerSymbol(symbol);
  
  // Retrieve execution price
  let executionPrice = parseFloat(price);
  if (orderCategory === 'MARKET') {
    const liveInfo = await fetchYahooPrice(symbol);
    if (!liveInfo) return res.status(400).json({ success: false, message: "Unable to retrieve current market price" });
    executionPrice = liveInfo.price;
  }

  const estimate = calculateTradeCharges(type, numQty, executionPrice);
  const totalAmountNeeded = estimate.estimatedTotalAmount;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Lock user for update
    const [userRows] = await connection.query("SELECT available_balance FROM users WHERE id=? FOR UPDATE", [userId]);
    const balance = parseFloat(userRows[0].available_balance);

    if (type === 'BUY') {
      if (balance < totalAmountNeeded) {
        throw new Error("Insufficient funds in account wallet.");
      }

      // Deduct balance
      await connection.query("UPDATE users SET available_balance = available_balance - ? WHERE id=?", [totalAmountNeeded, userId]);

      // Insert holding
      await connection.query(
        "INSERT INTO stock_details (stock_name, purchase_price, user_id, qty, status) VALUES (?, ?, ?, ?, 1)",
        [cleanedSymbol, executionPrice, userId, numQty]
      );

      // Log transaction
      await connection.query(
        "INSERT INTO users_transaction (debit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
        [totalAmountNeeded, `TXN_BUY_${Math.floor(100000 + Math.random() * 900000)}`, `Bought ${numQty} shares of ${symbol}`, userId]
      );

    } else if (type === 'SELL') {
      // Check active shares count
      const [holdings] = await connection.query(
        "SELECT SUM(qty) as total_qty FROM stock_details WHERE user_id=? AND stock_name=? AND status=1",
        [userId, cleanedSymbol]
      );

      const ownedQty = parseInt(holdings[0].total_qty || 0, 10);
      if (ownedQty < numQty) {
        throw new Error("Insufficient shares in portfolio holdings to sell.");
      }

      // Credit balance (gain amount minus brokerage charges)
      await connection.query("UPDATE users SET available_balance = available_balance + ? WHERE id=?", [totalAmountNeeded, userId]);

      // FIFO reduction of holdings
      let remainingToSell = numQty;
      const [holdingRows] = await connection.query(
        "SELECT id, qty FROM stock_details WHERE user_id=? AND stock_name=? AND status=1 ORDER BY purchase_date ASC",
        [userId, cleanedSymbol]
      );

      for (const row of holdingRows) {
        if (remainingToSell <= 0) break;
        
        const rowQty = row.qty;
        if (rowQty <= remainingToSell) {
          // Mark entire row as sold
          await connection.query("UPDATE stock_details SET status=0, sell_price=? WHERE id=?", [executionPrice, row.id]);
          remainingToSell -= rowQty;
        } else {
          // Split row: reduce qty of existing, insert a new sold row with status 0
          await connection.query("UPDATE stock_details SET qty = qty - ? WHERE id=?", [remainingToSell, row.id]);
          await connection.query(
            "INSERT INTO stock_details (stock_name, purchase_price, user_id, qty, sell_price, status) VALUES (?, ?, ?, ?, ?, 0)",
            [cleanedSymbol, executionPrice, userId, remainingToSell, executionPrice]
          );
          remainingToSell = 0;
        }
      }

      // Log transaction
      await connection.query(
        "INSERT INTO users_transaction (credit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
        [totalAmountNeeded, `TXN_SELL_${Math.floor(100000 + Math.random() * 900000)}`, `Sold ${numQty} shares of ${symbol}`, userId]
      );
    }

    // Insert order log
    const [orderInsert] = await connection.query(
      "INSERT INTO orders (user_id, symbol, exchange, type, order_category, qty, price, status, executed_price, charges) VALUES (?, ?, ?, ?, ?, ?, ?, 'EXECUTED', ?, ?)",
      [userId, cleanedSymbol, 'NSE', type, orderCategory, numQty, executionPrice, executionPrice, estimate.totalCharges]
    );

    await connection.commit();

    const [updatedUser] = await db.query("SELECT available_balance FROM users WHERE id=?", [userId]);
    res.json({
      success: true,
      message: `Order Executed successfully: ${type} ${numQty} shares of ${symbol} @ ₹${executionPrice}`,
      orderId: `ORD-${orderInsert.insertId}`,
      updatedBalance: parseFloat(updatedUser[0].available_balance)
    });
  } catch (err) {
    await connection.rollback();
    console.error("Order Place Error:", err.message);
    res.status(400).json({ success: false, message: err.message || "Failed to execute order" });
  } finally {
    connection.release();
  }
});

// === WATCHLIST ENDPOINTS ===
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query("SELECT symbol FROM watchlist WHERE user_id=?", [userId]);
    const symbols = rows.map(r => r.symbol);
    
    // Fetch live prices for watched symbols
    const results = [];
    for (const sym of symbols) {
      const data = await fetchYahooPrice(sym);
      if (data) {
        results.push(data);
      } else {
        const local = STOCKS_DATABASE.find(s => s.symbol === sym);
        if (local) {
          results.push(local);
        }
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch watchlist" });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ success: false, message: "Symbol is required" });

  try {
    await db.query("INSERT IGNORE INTO watchlist (user_id, symbol) VALUES (?, ?)", [userId, symbol.toUpperCase().trim()]);
    res.json({ success: true, message: `${symbol.toUpperCase()} added to watchlist` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add to watchlist" });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const symbol = req.params.symbol.toUpperCase();

  try {
    await db.query("DELETE FROM watchlist WHERE user_id=? AND symbol=?", [userId, symbol]);
    res.json({ success: true, message: `${symbol} removed from watchlist` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove from watchlist" });
  }
});

// === FUNDS DEPOSIT & WITHDRAWAL ===
app.post('/api/funds/deposit', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amount, method } = req.body;
  const numAmt = parseFloat(amount);
  
  if (!numAmt || numAmt <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than 0" });

  try {
    await db.query("UPDATE users SET available_balance = available_balance + ? WHERE id=?", [numAmt, userId]);
    await db.query(
      "INSERT INTO users_transaction (credit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
      [numAmt, `DEP_${Math.floor(10000 + Math.random() * 90000)}`, `Deposit via ${method || 'UPI'}`, userId]
    );

    const [rows] = await db.query("SELECT available_balance FROM users WHERE id=?", [userId]);
    res.json({
      success: true,
      message: `₹${numAmt.toLocaleString('en-IN')} added to wallet successfully.`,
      availableBalance: parseFloat(rows[0].available_balance)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Deposit transaction failed." });
  }
});

app.post('/api/funds/withdraw', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;
  const numAmt = parseFloat(amount);

  if (!numAmt || numAmt <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than 0" });

  try {
    const [userRows] = await db.query("SELECT available_balance FROM users WHERE id=?", [userId]);
    const balance = parseFloat(userRows[0].available_balance);

    if (balance < numAmt) {
      return res.status(400).json({ success: false, message: "Insufficient balance for withdrawal" });
    }

    await db.query("UPDATE users SET available_balance = available_balance - ? WHERE id=?", [numAmt, userId]);
    await db.query(
      "INSERT INTO users_transaction (debit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
      [numAmt, `WIT_${Math.floor(10000 + Math.random() * 90000)}`, "Withdrawal to linked Bank Account", userId]
    );

    const [rows] = await db.query("SELECT available_balance FROM users WHERE id=?", [userId]);
    res.json({
      success: true,
      message: `₹${numAmt.toLocaleString('en-IN')} withdrawal initiated to bank.`,
      availableBalance: parseFloat(rows[0].available_balance)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Withdrawal transaction failed." });
  }
});

// === IPOS, MUTUAL FUNDS, NEWS, AI ===
app.get('/api/ipos', (req, res) => {
  res.json({ success: true, data: INDIAN_IPOS });
});

app.post('/api/ipos/allotment-check', (req, res) => {
  const { pan, ipoId } = req.body;
  const ipo = INDIAN_IPOS.find(i => i.id === ipoId) || INDIAN_IPOS[0];
  const allocated = Math.random() > 0.45;
  res.json({
    success: true,
    pan: pan || "ABCDE1234F",
    company: ipo.company,
    status: allocated ? "ALLOTTED" : "NOT ALLOTTED",
    sharesAllotted: allocated ? ipo.lotSize : 0,
    refundAmount: allocated ? "₹0.00" : ipo.minInvestment,
    message: allocated 
      ? `Congratulations! 1 Lot (${ipo.lotSize} shares) of ${ipo.company} allotted to PAN ${pan || 'ABCDE1234F'}.`
      : `No allotment received for PAN ${pan || 'ABCDE1234F'}. Refund initiated to bank account.`
  });
});

app.get('/api/mutual-funds', (req, res) => {
  res.json({ success: true, data: MUTUAL_FUNDS });
});

app.get('/api/news', (req, res) => {
  res.json({ success: true, news: INDIAN_MARKET_NEWS, corporateActions: CORPORATE_ACTIONS });
});

app.get('/api/ai/insights', optionalAuthenticateToken, async (req, res) => {
  let portfolioMock = { holdings: [] };
  if (req.user) {
    try {
      const [holdingsRows] = await db.query(
        "SELECT stock_name as symbol, SUM(qty) as qty FROM stock_details WHERE user_id=? AND status=1 GROUP BY stock_name",
        [req.user.id]
      );
      portfolioMock.holdings = holdingsRows.map(h => ({
        symbol: h.symbol.replace('.NS', '').replace('.BO', ''),
        qty: parseInt(h.qty)
      }));
    } catch (e) {
      console.warn("AI insight portfolio lookup failed:", e.message);
    }
  }
  
  const insights = generateAiInsights(portfolioMock, STOCKS_DATABASE);
  res.json({ success: true, ...insights });
});

// === TRANSACTIONS ENDPOINT ===
app.get('/api/transactions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users_transaction WHERE user_id=? ORDER BY payment_date DESC LIMIT 50",
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// === SERVE STATIC REACT FRONTEND FOR RENDER DEPLOYMENT ===
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Indian Stock Market Trading Server listening on port ${PORT}`);
});
