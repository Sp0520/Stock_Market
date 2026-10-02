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

// Global In-Memory Fallback Store (for Sandbox deployments where MySQL is not connected)
// Global In-Memory Fallback Store (for Sandbox deployments where MySQL is not connected)
const IN_MEMORY_USERS = [];
let IN_MEMORY_IPOS = JSON.parse(JSON.stringify(INDIAN_IPOS));
let IN_MEMORY_MUTUAL_FUNDS = JSON.parse(JSON.stringify(MUTUAL_FUNDS));
let IN_MEMORY_ANNOUNCEMENTS = [
  { id: 1, title: 'NSE & BSE Special Trading Session', category: 'MARKET_ALERT', message: 'Special live trading session scheduled this Saturday for Disaster Recovery site switch.', severity: 'INFO', date: 'Today' },
  { id: 2, title: 'SEBI Investor Protection Advisory', category: 'REGULATORY', message: 'Never share your trading passwords or OTPs with unauthorized entities.', severity: 'WARNING', date: 'Yesterday' }
];

const getUserSessionData = (userId) => {
  let user = IN_MEMORY_USERS.find(u => u.id === parseInt(userId, 10));
  if (!user) {
    user = {
      id: parseInt(userId, 10) || 1,
      firstname: "Rahul",
      lastname: "Sharma",
      email: "rahul.sharma@investor.in",
      role: "admin", // Admin privilege enabled for platform testing
      password: "",
      mobile: "9876543210",
      pan: "ABCDE1234F",
      address: "A-404, Tech Park Heights, BKC, Mumbai - 400051",
      availableBalance: 125000.00,
      holdings: [
        { stock_name: "TCS.NS", purchase_price: 3550.00, qty: 120, status: 1 },
        { stock_name: "RELIANCE.NS", purchase_price: 2820.00, qty: 85, status: 1 },
        { stock_name: "HDFCBANK.NS", purchase_price: 1510.00, qty: 120, status: 1 }
      ],
      mfHoldings: [
        {
          id: 1,
          fundId: "mf-1",
          fundName: "Parag Parikh Flexi Cap Fund Direct-Growth",
          category: "Flexi Cap",
          folioNumber: "FOLIO-PPF-88219",
          units: 339.9433,
          investedAmount: 25000.00,
          averageNav: 73.54,
          currentNav: 88.25,
          currentValue: 30000.00,
          purchaseDate: "2024-03-15"
        },
        {
          id: 2,
          fundId: "mf-5",
          fundName: "SBI Nifty 50 Index Fund Direct-Growth",
          category: "Index Funds",
          folioNumber: "FOLIO-SBI-44129",
          units: 102.5641,
          investedAmount: 20000.00,
          averageNav: 195.00,
          currentNav: 218.45,
          currentValue: 22405.13,
          purchaseDate: "2024-05-10"
        }
      ],
      sipPlans: [
        {
          id: 1,
          sipCode: "SIP-PPF-001",
          fundId: "mf-1",
          fundName: "Parag Parikh Flexi Cap Fund Direct-Growth",
          frequency: "MONTHLY",
          installmentAmount: 5000.00,
          sipDay: 10,
          durationMonths: 36,
          expectedReturn: 15.00,
          status: "ACTIVE",
          installmentsPaid: 6,
          totalInvested: 30000.00,
          unitsAllocated: 365.1250,
          currentNav: 88.25,
          currentValue: 32222.28,
          nextInstallmentDate: "2026-11-10",
          startDate: "2024-05-10"
        },
        {
          id: 2,
          sipCode: "SIP-SBI-002",
          fundId: "mf-5",
          fundName: "SBI Nifty 50 Index Fund Direct-Growth",
          frequency: "MONTHLY",
          installmentAmount: 3000.00,
          sipDay: 15,
          durationMonths: 60,
          expectedReturn: 13.00,
          status: "ACTIVE",
          installmentsPaid: 4,
          totalInvested: 12000.00,
          unitsAllocated: 56.4020,
          currentNav: 218.45,
          currentValue: 12321.02,
          nextInstallmentDate: "2026-11-15",
          startDate: "2024-07-15"
        }
      ],
      ipoApplications: [
        {
          id: 1,
          applicationNo: "IPO-APP-2026-1001",
          ipoId: "ipo-1",
          company: "Swiggy Limited",
          investorCategory: "RETAIL",
          lots: 1,
          bidPrice: 390.00,
          totalAmount: 14820.00,
          upiId: "rahul@okaxis",
          status: "ALLOTTED",
          allottedShares: 38,
          refundAmount: 0.00,
          appliedAt: "2024-11-06T10:30:00Z"
        }
      ],
      transactions: [
        { id: "DEP_INIT", payment_date: new Date().toISOString(), payment_id: "DEP_10001", description: "Welcome Wallet Fund Bonus", status: "COMPLETED", debit: 0, credit: 125000.00 }
      ],
      watchlist: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"],
      orders: [
        { id: 1, symbol: "RELIANCE.NS", exchange: "NSE", type: "BUY", order_category: "LIMIT", qty: 85, price: 2820.00, status: "EXECUTED", time: new Date().toISOString(), executed_price: 2820.00, charges: 25.50 },
        { id: 2, symbol: "TCS.NS", exchange: "NSE", type: "BUY", order_category: "MARKET", qty: 120, price: 3550.00, status: "EXECUTED", time: new Date().toISOString(), executed_price: 3550.00, charges: 18.20 }
      ]
    };
    IN_MEMORY_USERS.push(user);
  }
  return user;
};

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
    let userExists = false;
    let existingUser = null;
    
    try {
      const [existing] = await db.query(
        "SELECT email, mobile_number, PANCARD_number FROM users WHERE email=? OR mobile_number=? OR PANCARD_number=?", 
        [email, mobile_number, pan_number]
      );
      if (existing.length > 0) {
        existingUser = existing[0];
        userExists = true;
      }
    } catch (dbErr) {
      console.warn("MySQL database check failed, falling back to in-memory store:", dbErr.message);
      existingUser = IN_MEMORY_USERS.find(u => u.email === email || u.mobile === mobile_number || u.pan === pan_number);
      if (existingUser) {
        userExists = true;
      }
    }

    if (userExists) {
      if (existingUser.email === email) return res.status(400).json({ success: false, message: "Email already registered" });
      if (existingUser.mobile_number === mobile_number || existingUser.mobile === mobile_number) return res.status(400).json({ success: false, message: "Mobile number already registered" });
      if (existingUser.PANCARD_number === pan_number || existingUser.pan === pan_number) return res.status(400).json({ success: false, message: "PAN Card number already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const welcomeBalance = 100000.00; // ₹1,00,000 welcome virtual cash
    let userId = Math.floor(1000 + Math.random() * 9000);

    try {
      const [insertResult] = await db.query(
        "INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, available_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [firstname, lastname, address, email, hashedPassword, mobile_number, pan_number, welcomeBalance]
      );
      userId = insertResult.insertId;

      // Insert welcome transaction
      await db.query(
        "INSERT INTO users_transaction (credit, payment_id, description, user_id, status) VALUES (?, ?, ?, ?, 'COMPLETED')",
        [welcomeBalance, `DEP_${Math.floor(10000 + Math.random() * 90000)}`, "Welcome Wallet Fund Bonus", userId]
      );
    } catch (dbErr) {
      console.warn("MySQL database insert failed, storing user in-memory:", dbErr.message);
      // Store in memory
      const newUser = {
        id: userId,
        firstname,
        lastname,
        email,
        password: hashedPassword,
        mobile: mobile_number,
        pan: pan_number,
        address,
        availableBalance: welcomeBalance,
        holdings: [],
        orders: [],
        watchlist: ["RELIANCE", "TCS", "INFY"],
        transactions: [
          { id: `DEP_${Math.floor(10000 + Math.random() * 90000)}`, payment_date: new Date().toISOString(), payment_id: `DEP_${Math.floor(10000 + Math.random() * 90000)}`, description: "Welcome Wallet Fund Bonus", status: "COMPLETED", debit: 0, credit: welcomeBalance }
        ]
      };
      IN_MEMORY_USERS.push(newUser);
    }

    const token = jwt.sign({ id: userId, email: email, name: `${firstname} ${lastname}` }, JWT_SECRET, { expiresIn: '7d' });

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
    return res.status(500).json({ success: false, message: "Signup failed due to internal error." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email/Mobile and password are required" });
  }

  try {
    let user = null;
    try {
      const [rows] = await db.query(
        "SELECT * FROM users WHERE email=? OR mobile_number=?", 
        [email, email]
      );
      if (rows.length > 0) {
        const dbUser = rows[0];
        user = {
          id: dbUser.id,
          firstname: dbUser.firstname,
          lastname: dbUser.lastname,
          email: dbUser.email,
          password: dbUser.password,
          mobile: dbUser.mobile_number,
          pan: dbUser.PANCARD_number,
          address: dbUser.address,
          availableBalance: parseFloat(dbUser.available_balance)
        };
      }
    } catch (dbErr) {
      console.warn("MySQL login query failed, checking in-memory users:", dbErr.message);
      const memUser = IN_MEMORY_USERS.find(u => u.email === email || u.mobile === email);
      if (memUser) {
        user = memUser;
      }
    }

    if (!user) {
      // Dynamic profile generation so ANY username/password works in Sandbox mode!
      console.warn("User not found, generating temporary session user for sandbox testing...");
      user = {
        id: Math.floor(1000 + Math.random() * 9000),
        firstname: email.split('@')[0],
        lastname: "Investor",
        email: email,
        password: bcrypt.hashSync(password, 10), 
        mobile: "9876543210",
        pan: "ABCDE1234F",
        address: "Mumbai, Maharashtra",
        availableBalance: 100000.00,
        holdings: [],
        orders: [],
        watchlist: ["RELIANCE", "TCS", "INFY"],
        transactions: [
          { id: "DEP_INIT", payment_date: new Date().toISOString(), payment_id: "DEP_10001", description: "Welcome Wallet Fund Bonus", status: "COMPLETED", debit: 0, credit: 100000.00 }
        ]
      };
      IN_MEMORY_USERS.push(user);
    }

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
        mobile: user.mobile,
        pan: user.pan,
        address: user.address,
        kycStatus: "VERIFIED",
        availableBalance: user.availableBalance
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Login failed due to internal error." });
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
    console.warn("Portfolio Fetch DB Query failed, using in-memory fallbacks:", err.message);
    const user = getUserSessionData(userId);
    
    const holdings = [];
    let totalInvestment = 0;
    let currentPortfolioValue = 0;
    let todaysProfit = 0;

    for (const h of user.holdings) {
      const liveData = await fetchYahooPrice(h.symbol);
      const currentPrice = liveData ? liveData.price : h.avgPrice;
      const dayChange = liveData ? liveData.change : 0;
      
      const qty = parseInt(h.qty, 10);
      const investmentValue = h.investmentValue;
      const currentValue = qty * currentPrice;
      const pnl = currentValue - investmentValue;
      const pnlPercent = investmentValue > 0 ? (pnl / investmentValue) * 100 : 0;

      totalInvestment += investmentValue;
      currentPortfolioValue += currentValue;
      todaysProfit += qty * dayChange;

      holdings.push({
        symbol: h.symbol,
        name: liveData ? liveData.symbol + " Ltd" : h.symbol + " Equity",
        qty,
        avgPrice: parseFloat(h.avgPrice.toFixed(2)),
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

    res.json({
      success: true,
      portfolio: {
        profile: {
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          pan: user.pan,
          kycStatus: "VERIFIED",
          availableBalance: parseFloat(user.availableBalance.toFixed(2)),
          totalInvestment: parseFloat(totalInvestment.toFixed(2)),
          currentPortfolioValue: parseFloat(currentPortfolioValue.toFixed(2)),
          todaysProfit: parseFloat(todaysProfit.toFixed(2)),
          todaysProfitPercent: parseFloat(todaysProfitPercent.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          totalProfitPercent: parseFloat(totalProfitPercent.toFixed(2)),
          buyingPower: parseFloat((user.availableBalance * 2).toFixed(2))
        },
        holdings,
        orders: user.orders || []
      }
    });
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

  try {
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

        // Credit balance
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
            await connection.query("UPDATE stock_details SET status=0, sell_price=? WHERE id=?", [executionPrice, row.id]);
            remainingToSell -= rowQty;
          } else {
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
      return res.json({
        success: true,
        message: `Order Executed successfully: ${type} ${numQty} shares of ${symbol} @ ₹${executionPrice}`,
        orderId: `ORD-${orderInsert.insertId}`,
        updatedBalance: parseFloat(updatedUser[0].available_balance)
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.warn("Order execution DB transaction failed, executing in-memory fallback:", err.message);
    const user = getUserSessionData(userId);

    if (type === 'BUY') {
      if (user.availableBalance < totalAmountNeeded) {
        return res.status(400).json({ success: false, message: "Insufficient funds in virtual account wallet." });
      }
      user.availableBalance -= totalAmountNeeded;

      const existingHolding = user.holdings.find(h => h.symbol === cleanedSymbol);
      const investmentValue = numQty * executionPrice;
      if (existingHolding) {
        existingHolding.qty += numQty;
        existingHolding.investmentValue += investmentValue;
        existingHolding.avgPrice = existingHolding.investmentValue / existingHolding.qty;
      } else {
        user.holdings.push({
          symbol: cleanedSymbol,
          qty: numQty,
          avgPrice: executionPrice,
          investmentValue
        });
      }

      user.transactions.unshift({
        id: `TXN_${Math.floor(10000 + Math.random() * 90000)}`,
        payment_date: new Date().toISOString(),
        payment_id: `TXN_${Math.floor(10000 + Math.random() * 90000)}`,
        description: `Bought ${numQty} shares of ${cleanedSymbol}`,
        status: "COMPLETED",
        debit: totalAmountNeeded,
        credit: 0
      });

    } else if (type === 'SELL') {
      const existingHolding = user.holdings.find(h => h.symbol === cleanedSymbol);
      if (!existingHolding || existingHolding.qty < numQty) {
        return res.status(400).json({ success: false, message: "Insufficient shares in holdings to execute sell order." });
      }

      user.availableBalance += (numQty * executionPrice) - estimate.totalCharges;
      existingHolding.qty -= numQty;
      existingHolding.investmentValue = existingHolding.qty * existingHolding.avgPrice;

      if (existingHolding.qty === 0) {
        user.holdings = user.holdings.filter(h => h.symbol !== cleanedSymbol);
      }

      user.transactions.unshift({
        id: `TXN_${Math.floor(10000 + Math.random() * 90000)}`,
        payment_date: new Date().toISOString(),
        payment_id: `TXN_${Math.floor(10000 + Math.random() * 90000)}`,
        description: `Sold ${numQty} shares of ${cleanedSymbol}`,
        status: "COMPLETED",
        debit: 0,
        credit: (numQty * executionPrice) - estimate.totalCharges
      });
    }

    const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!user.orders) user.orders = [];
    user.orders.unshift({
      id: newOrderId,
      time: new Date().toISOString(),
      symbol: cleanedSymbol,
      type,
      qty: numQty,
      price: executionPrice,
      charges: estimate.totalCharges,
      status: "EXECUTED",
      orderCategory
    });

    return res.json({
      success: true,
      message: `Order Executed successfully (Sandbox): ${type} ${numQty} shares of ${symbol} @ ₹${executionPrice}`,
      orderId: newOrderId,
      updatedBalance: user.availableBalance
    });
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
    console.warn("Failed to fetch watchlist from DB, using in-memory watchlist:", err.message);
    const user = getUserSessionData(userId);
    const symbols = user.watchlist || ["RELIANCE", "TCS", "INFY"];
    
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
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ success: false, message: "Symbol is required" });
  const symClean = symbol.toUpperCase().trim();

  try {
    await db.query("INSERT IGNORE INTO watchlist (user_id, symbol) VALUES (?, ?)", [userId, symClean]);
    res.json({ success: true, message: `${symClean} added to watchlist` });
  } catch (err) {
    console.warn("Failed to add to DB watchlist, adding in-memory:", err.message);
    const user = getUserSessionData(userId);
    if (!user.watchlist) user.watchlist = [];
    if (!user.watchlist.includes(symClean)) {
      user.watchlist.push(symClean);
    }
    res.json({ success: true, message: `${symClean} added to watchlist (Sandbox)` });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const symbol = req.params.symbol.toUpperCase();

  try {
    await db.query("DELETE FROM watchlist WHERE user_id=? AND symbol=?", [userId, symbol]);
    res.json({ success: true, message: `${symbol} removed from watchlist` });
  } catch (err) {
    console.warn("Failed to remove from DB watchlist, removing in-memory:", err.message);
    const user = getUserSessionData(userId);
    if (user.watchlist) {
      user.watchlist = user.watchlist.filter(s => s !== symbol);
    }
    res.json({ success: true, message: `${symbol} removed from watchlist (Sandbox)` });
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
    console.warn("Funds deposit DB update failed, executing in-memory fallback:", err.message);
    const user = getUserSessionData(userId);
    user.availableBalance += numAmt;

    const txnId = `DEP_${Math.floor(10000 + Math.random() * 90000)}`;
    user.transactions.unshift({
      id: txnId,
      payment_date: new Date().toISOString(),
      payment_id: txnId,
      description: `Deposit via ${method || 'UPI'} (Sandbox)`,
      status: "COMPLETED",
      debit: 0,
      credit: numAmt
    });

    res.json({
      success: true,
      message: `₹${numAmt.toLocaleString('en-IN')} added to wallet successfully (Sandbox).`,
      availableBalance: user.availableBalance
    });
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
    console.warn("Funds withdrawal DB update failed, executing in-memory fallback:", err.message);
    const user = getUserSessionData(userId);

    if (user.availableBalance < numAmt) {
      return res.status(400).json({ success: false, message: "Insufficient balance for withdrawal." });
    }

    user.availableBalance -= numAmt;
    const txnId = `WIT_${Math.floor(10000 + Math.random() * 90000)}`;
    user.transactions.unshift({
      id: txnId,
      payment_date: new Date().toISOString(),
      payment_id: txnId,
      description: "Withdrawal to linked Bank Account (Sandbox)",
      status: "COMPLETED",
      debit: numAmt,
      credit: 0
    });

    res.json({
      success: true,
      message: `₹${numAmt.toLocaleString('en-IN')} withdrawal initiated successfully (Sandbox).`,
      availableBalance: user.availableBalance
    });
  }
});

// ============================================================
// REAL-WORLD DATA HELPERS: AMFI MUTUAL FUNDS & INDIAN NEWS
// ============================================================
const mfNavCache = {};
async function getLiveFundNav(fund) {
  if (!fund.schemeCode) return fund;
  const now = Date.now();
  if (mfNavCache[fund.schemeCode] && (now - mfNavCache[fund.schemeCode].timestamp < 1800000)) { // 30 min cache
    return { ...fund, ...mfNavCache[fund.schemeCode].data };
  }
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.length > 0) {
        const latest = json.data[0];
        const latestNav = parseFloat(latest.nav);
        const navDate = latest.date;
        const prev = json.data[1] ? parseFloat(json.data[1].nav) : latestNav;
        const return1D = prev > 0 ? parseFloat((((latestNav - prev) / prev) * 100).toFixed(2)) : fund.return1D;
        const update = {
          nav: latestNav,
          navDate,
          return1D,
          isLiveNav: true,
          historicalNav: json.data.slice(0, 30)
        };
        mfNavCache[fund.schemeCode] = { timestamp: now, data: update };
        return { ...fund, ...update };
      }
    }
  } catch (err) {
    // Fail gracefully to pre-seeded static AMFI NAV
  }
  return { ...fund, isLiveNav: false };
}

let liveNewsCache = { timestamp: 0, items: [] };
async function fetchLiveIndianNews() {
  const now = Date.now();
  if (liveNewsCache.items.length > 0 && (now - liveNewsCache.timestamp < 600000)) { // 10 min cache
    return liveNewsCache.items;
  }
  try {
    const res = await fetch('https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const xml = await res.text();
      const items = [];
      const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<source[^>]*>(.*?)<\/source>[\s\S]*?<\/item>/g;
      let m;
      let count = 0;
      while ((m = regex.exec(xml)) !== null && count < 12) {
        const rawTitle = m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        const link = m[2];
        const pubDate = m[3];
        const source = m[4];
        
        let category = 'Indian Stock Market';
        if (rawTitle.toLowerCase().includes('ipo')) category = 'IPO News';
        else if (rawTitle.toLowerCase().includes('mutual fund') || rawTitle.toLowerCase().includes('sip')) category = 'Mutual Funds';
        else if (rawTitle.toLowerCase().includes('tcs') || rawTitle.toLowerCase().includes('reliance') || rawTitle.toLowerCase().includes('infosys') || rawTitle.toLowerCase().includes('hdfc')) category = 'Company News';
        
        items.push({
          id: `live-news-${count + 1}`,
          title: rawTitle,
          link,
          pubDate,
          time: new Date(pubDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          source: source || 'Market Wire',
          category,
          sentiment: rawTitle.toLowerCase().includes('surge') || rawTitle.toLowerCase().includes('rally') || rawTitle.toLowerCase().includes('gain') ? 'BULLISH' : (rawTitle.toLowerCase().includes('fall') || rawTitle.toLowerCase().includes('drop') || rawTitle.toLowerCase().includes('loss') ? 'BEARISH' : 'NEUTRAL'),
          summary: rawTitle,
          isLiveApi: true
        });
        count++;
      }
      if (items.length > 0) {
        liveNewsCache = { timestamp: now, items };
        return items;
      }
    }
  } catch (err) {
    console.warn("Live RSS news fetch fallback:", err.message);
  }
  return INDIAN_MARKET_NEWS;
}

// ============================================================
// 1. IPO MODULE ENDPOINTS
// ============================================================
app.get('/api/ipos', (req, res) => {
  const { status, search } = req.query;
  let ipos = [...IN_MEMORY_IPOS];
  
  if (status && status !== 'ALL') {
    ipos = ipos.filter(i => i.status.toUpperCase() === status.toUpperCase());
  }
  if (search) {
    const q = search.toLowerCase();
    ipos = ipos.filter(i => i.company.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q));
  }
  
  res.json({ success: true, count: ipos.length, data: ipos });
});

app.get('/api/ipos/:id', (req, res) => {
  const ipo = IN_MEMORY_IPOS.find(i => i.id === req.params.id);
  if (!ipo) return res.status(404).json({ success: false, message: "IPO record not found" });
  res.json({ success: true, data: ipo });
});

app.post('/api/ipos/apply', authenticateToken, async (req, res) => {
  const { ipoId, investorCategory = 'RETAIL', lots = 1, upiId } = req.body;
  if (!ipoId) return res.status(400).json({ success: false, message: "IPO ID is required" });
  if (!upiId || !upiId.includes('@')) return res.status(400).json({ success: false, message: "A valid UPI ID (e.g. yourname@okaxis) is required for ASBA mandate simulation" });
  
  const lotsCount = parseInt(lots, 10);
  if (isNaN(lotsCount) || lotsCount < 1) return res.status(400).json({ success: false, message: "Lots must be at least 1" });

  const ipo = IN_MEMORY_IPOS.find(i => i.id === ipoId);
  if (!ipo) return res.status(404).json({ success: false, message: "IPO not found" });

  if (ipo.status !== 'OPEN' && ipo.status !== 'CURRENT') {
    return res.status(400).json({ success: false, message: `Cannot apply: IPO bidding is currently ${ipo.status}` });
  }

  const bidPrice = ipo.maxPrice;
  const totalAmount = lotsCount * ipo.lotSize * bidPrice;
  const applicationNo = `IPO-APP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const userId = req.user.id;
  const user = getUserSessionData(userId);

  if (user.availableBalance < totalAmount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient wallet balance. Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${user.availableBalance.toLocaleString('en-IN')}`
    });
  }

  // Deduct balance as simulated ASBA hold
  user.availableBalance -= totalAmount;
  const appRecord = {
    id: (user.ipoApplications.length + 1),
    applicationNo,
    ipoId,
    company: ipo.company,
    symbol: ipo.symbol,
    investorCategory,
    lots: lotsCount,
    shares: lotsCount * ipo.lotSize,
    bidPrice,
    totalAmount,
    upiId,
    status: 'APPLIED',
    allottedShares: 0,
    refundAmount: 0.00,
    appliedAt: new Date().toISOString()
  };
  user.ipoApplications.unshift(appRecord);

  // Add transaction
  user.transactions.unshift({
    id: `TXN_IPO_${Date.now()}`,
    payment_id: `pay_IPO_${applicationNo}`,
    payment_date: new Date().toISOString(),
    description: `ASBA Mandate Block for ${lotsCount} lot(s) of ${ipo.company}`,
    debit: totalAmount,
    credit: 0,
    status: 'COMPLETED'
  });

  // Try saving to MySQL if active
  try {
    await db.query(
      "INSERT INTO ipo_applications (application_no, user_id, ipo_id, company, investor_category, lots, bid_price, total_amount, upi_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED')",
      [applicationNo, userId, ipoId, ipo.company, investorCategory, lotsCount, bidPrice, totalAmount, upiId]
    );
    await db.query("UPDATE users SET available_balance = available_balance - ? WHERE id=?", [totalAmount, userId]);
  } catch (dbErr) {
    // In-memory handled
  }

  res.json({
    success: true,
    message: `Simulated ASBA application submitted successfully for ${ipo.company}! Mandate blocked on UPI: ${upiId}`,
    application: appRecord,
    availableBalance: user.availableBalance
  });
});

app.get('/api/ipos/my-applications', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const user = getUserSessionData(userId);
  try {
    const [rows] = await db.query("SELECT * FROM ipo_applications WHERE user_id=? ORDER BY applied_at DESC", [userId]);
    if (rows.length > 0) return res.json({ success: true, data: rows });
  } catch (e) {}
  res.json({ success: true, data: user.ipoApplications || [] });
});

app.post('/api/ipos/allotment-check', (req, res) => {
  const { pan, ipoId } = req.body;
  const ipo = IN_MEMORY_IPOS.find(i => i.id === ipoId) || IN_MEMORY_IPOS[0];
  const allocated = Math.random() > 0.45;
  res.json({
    success: true,
    pan: pan || "ABCDE1234F",
    company: ipo.company,
    status: allocated ? "ALLOTTED" : "NOT ALLOTTED",
    sharesAllotted: allocated ? ipo.lotSize : 0,
    refundAmount: allocated ? "₹0.00" : `₹${ipo.minInvestment.toLocaleString('en-IN')}`,
    message: allocated 
      ? `Congratulations! 1 Lot (${ipo.lotSize} shares) of ${ipo.company} allotted to PAN ${pan || 'ABCDE1234F'}.`
      : `No allotment received for PAN ${pan || 'ABCDE1234F'}. Unblocked funds returned to bank account.`
  });
});

// ============================================================
// 2. MUTUAL FUND MODULE ENDPOINTS (REAL AMFI DATA VIA MFAPI.IN)
// ============================================================
app.get('/api/mutual-funds', async (req, res) => {
  const { category, search, sortBy } = req.query;
  let funds = await Promise.all(IN_MEMORY_MUTUAL_FUNDS.map(f => getLiveFundNav(f)));

  if (category && category !== 'ALL') {
    funds = funds.filter(f => 
      f.category.toLowerCase().includes(category.toLowerCase()) || 
      f.mainCategory.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    funds = funds.filter(f => f.name.toLowerCase().includes(q) || f.fundHouse.toLowerCase().includes(q));
  }

  if (sortBy === 'returns1y') funds.sort((a, b) => b.return1Y - a.return1Y);
  else if (sortBy === 'returns3y') funds.sort((a, b) => b.return3Y - a.return3Y);
  else if (sortBy === 'returns5y') funds.sort((a, b) => b.return5Y - a.return5Y);
  else if (sortBy === 'rating') funds.sort((a, b) => b.rating - a.rating);

  res.json({ success: true, count: funds.length, data: funds });
});

app.get('/api/mutual-funds/:id', async (req, res) => {
  const rawFund = IN_MEMORY_MUTUAL_FUNDS.find(f => f.id === req.params.id || f.schemeCode === parseInt(req.params.id, 10));
  if (!rawFund) return res.status(404).json({ success: false, message: "Mutual fund not found" });

  const fund = await getLiveFundNav(rawFund);
  res.json({ success: true, data: fund });
});

app.post('/api/mutual-funds/invest', authenticateToken, async (req, res) => {
  const { fundId, amount, folioNumber } = req.body;
  const investAmt = parseFloat(amount);
  if (isNaN(investAmt) || investAmt <= 0) {
    return res.status(400).json({ success: false, message: "Valid investment amount is required" });
  }

  const rawFund = IN_MEMORY_MUTUAL_FUNDS.find(f => f.id === fundId);
  if (!rawFund) return res.status(404).json({ success: false, message: "Mutual fund not found" });
  const fund = await getLiveFundNav(rawFund);

  if (investAmt < fund.minLumpsum) {
    return res.status(400).json({ success: false, message: `Minimum investment for ${fund.name} is ₹${fund.minLumpsum.toLocaleString('en-IN')}` });
  }

  const userId = req.user.id;
  const user = getUserSessionData(userId);

  if (user.availableBalance < investAmt) {
    return res.status(400).json({ success: false, message: "Insufficient wallet balance to complete investment" });
  }

  const unitsAllotted = parseFloat((investAmt / fund.nav).toFixed(4));
  user.availableBalance -= investAmt;

  const existingHolding = user.mfHoldings.find(h => h.fundId === fund.id);
  if (existingHolding) {
    const totalUnits = existingHolding.units + unitsAllotted;
    const totalInvested = existingHolding.investedAmount + investAmt;
    existingHolding.units = parseFloat(totalUnits.toFixed(4));
    existingHolding.investedAmount = parseFloat(totalInvested.toFixed(2));
    existingHolding.averageNav = parseFloat((totalInvested / totalUnits).toFixed(4));
    existingHolding.currentNav = fund.nav;
    existingHolding.currentValue = parseFloat((totalUnits * fund.nav).toFixed(2));
  } else {
    user.mfHoldings.unshift({
      id: user.mfHoldings.length + 1,
      fundId: fund.id,
      fundName: fund.name,
      category: fund.category,
      folioNumber: folioNumber || `FOLIO-${fund.id.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      units: unitsAllotted,
      investedAmount: investAmt,
      averageNav: fund.nav,
      currentNav: fund.nav,
      currentValue: investAmt,
      purchaseDate: new Date().toISOString()
    });
  }

  user.transactions.unshift({
    id: `TXN_MF_${Date.now()}`,
    payment_id: `pay_MF_${Math.floor(100000 + Math.random() * 900000)}`,
    payment_date: new Date().toISOString(),
    description: `Lumpsum investment of ₹${investAmt.toLocaleString('en-IN')} in ${fund.name}`,
    debit: investAmt,
    credit: 0,
    status: 'COMPLETED'
  });

  res.json({
    success: true,
    message: `Successfully invested ₹${investAmt.toLocaleString('en-IN')}! Allotted ${unitsAllotted} units at NAV ₹${fund.nav}`,
    unitsAllotted,
    availableBalance: user.availableBalance
  });
});

// ============================================================
// 3. SIP MODULE ENDPOINTS
// ============================================================
app.get('/api/sip', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.json({ success: true, data: [] });
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    const user = getUserSessionData(decoded.id);

    // Sync live NAV for active SIPs
    const updatedPlans = await Promise.all((user.sipPlans || []).map(async plan => {
      const fund = IN_MEMORY_MUTUAL_FUNDS.find(f => f.id === plan.fundId);
      if (fund) {
        const live = await getLiveFundNav(fund);
        const currentVal = parseFloat((plan.unitsAllocated * live.nav).toFixed(2));
        const estimatedProfit = currentVal - plan.totalInvested;
        return {
          ...plan,
          currentNav: live.nav,
          currentValue: currentVal,
          unrealizedProfit: parseFloat(estimatedProfit.toFixed(2)),
          unrealizedProfitPct: plan.totalInvested > 0 ? parseFloat(((estimatedProfit / plan.totalInvested) * 100).toFixed(2)) : 0
        };
      }
      return plan;
    }));

    res.json({ success: true, data: updatedPlans });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid session" });
  }
});

app.post('/api/sip/create', authenticateToken, async (req, res) => {
  const { fundId, installmentAmount, frequency = 'MONTHLY', sipDay = 5, durationMonths = 36, expectedReturn = 12.00, executeFirstNow = true } = req.body;
  const amount = parseFloat(installmentAmount);
  if (isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Valid installment amount required" });

  const rawFund = IN_MEMORY_MUTUAL_FUNDS.find(f => f.id === fundId);
  if (!rawFund) return res.status(404).json({ success: false, message: "Mutual fund not found" });
  const fund = await getLiveFundNav(rawFund);

  if (amount < fund.minSip) {
    return res.status(400).json({ success: false, message: `Minimum SIP installment for this fund is ₹${fund.minSip.toLocaleString('en-IN')}` });
  }

  const userId = req.user.id;
  const user = getUserSessionData(userId);

  if (executeFirstNow && user.availableBalance < amount) {
    return res.status(400).json({ success: false, message: "Insufficient balance to debit the first SIP installment" });
  }

  let unitsAllocated = 0;
  let installmentsPaid = 0;
  let totalInvested = 0;

  if (executeFirstNow) {
    user.availableBalance -= amount;
    unitsAllocated = parseFloat((amount / fund.nav).toFixed(4));
    installmentsPaid = 1;
    totalInvested = amount;

    user.transactions.unshift({
      id: `TXN_SIP_${Date.now()}`,
      payment_id: `pay_SIP_${Date.now().toString().slice(-6)}`,
      payment_date: new Date().toISOString(),
      description: `First SIP Installment (#1) for ${fund.name}`,
      debit: amount,
      credit: 0,
      status: 'COMPLETED'
    });
  }

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  nextDate.setDate(parseInt(sipDay, 10) || 5);

  const sipCode = `SIP-${fund.symbol || fund.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const newPlan = {
    id: user.sipPlans.length + 1,
    sipCode,
    fundId: fund.id,
    fundName: fund.name,
    frequency,
    installmentAmount: amount,
    sipDay: parseInt(sipDay, 10) || 5,
    durationMonths: parseInt(durationMonths, 10) || 36,
    expectedReturn: parseFloat(expectedReturn) || 12.00,
    status: 'ACTIVE',
    installmentsPaid,
    totalInvested,
    unitsAllocated,
    currentNav: fund.nav,
    currentValue: parseFloat((unitsAllocated * fund.nav).toFixed(2)),
    startDate: new Date().toISOString(),
    nextInstallmentDate: nextDate.toISOString().split('T')[0]
  };

  user.sipPlans.unshift(newPlan);

  res.json({
    success: true,
    message: `SIP successfully registered! Next auto-debit scheduled on ${newPlan.nextInstallmentDate}`,
    sipPlan: newPlan,
    availableBalance: user.availableBalance
  });
});

app.put('/api/sip/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body; // ACTIVE, PAUSED, CANCELLED
  const planId = parseInt(req.params.id, 10);
  const user = getUserSessionData(req.user.id);
  const plan = user.sipPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ success: false, message: "SIP plan not found" });

  plan.status = status;
  res.json({ success: true, message: `SIP has been ${status.toLowerCase()} successfully`, plan });
});

app.put('/api/sip/:id/modify', authenticateToken, (req, res) => {
  const { installmentAmount, sipDay } = req.body;
  const planId = parseInt(req.params.id, 10);
  const user = getUserSessionData(req.user.id);
  const plan = user.sipPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ success: false, message: "SIP plan not found" });

  if (installmentAmount) plan.installmentAmount = parseFloat(installmentAmount);
  if (sipDay) plan.sipDay = parseInt(sipDay, 10);

  res.json({ success: true, message: "SIP modified successfully", plan });
});

app.get('/api/sip/:id/transactions', authenticateToken, (req, res) => {
  const planId = parseInt(req.params.id, 10);
  const user = getUserSessionData(req.user.id);
  const plan = user.sipPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ success: false, message: "SIP plan not found" });

  const txns = [];
  for (let i = 1; i <= plan.installmentsPaid; i++) {
    txns.push({
      installmentNo: i,
      amount: plan.installmentAmount,
      date: new Date(Date.now() - (plan.installmentsPaid - i) * 30 * 86400000).toISOString().split('T')[0],
      status: 'EXECUTED',
      unitsAllotted: (plan.installmentAmount / (plan.currentNav || 85.0)).toFixed(4)
    });
  }
  res.json({ success: true, data: txns });
});

// ============================================================
// 4. UNIFIED MULTI-ASSET PORTFOLIO ENDPOINT
// ============================================================
app.get('/api/portfolio/unified', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const user = getUserSessionData(userId);

  // 1. Stock holdings valuation
  let stockInvested = 0;
  let stockCurrent = 0;
  let stockDayProfit = 0;

  const stockHoldings = (user.holdings || []).map(h => {
    const sym = h.stock_name.replace('.NS', '').replace('.BO', '');
    const quote = livePricesCache[sym] || STOCKS_DATABASE.find(s => s.symbol === sym) || { price: h.purchase_price, change: 0, changePercent: 0 };
    const inv = h.qty * h.purchase_price;
    const cur = h.qty * quote.price;
    const dayP = h.qty * (quote.change || 0);

    stockInvested += inv;
    stockCurrent += cur;
    stockDayProfit += dayP;

    return {
      symbol: sym,
      qty: h.qty,
      avgPrice: h.purchase_price,
      currentPrice: quote.price,
      invested: inv,
      currentValue: cur,
      pnl: cur - inv,
      pnlPercent: inv > 0 ? ((cur - inv) / inv) * 100 : 0,
      dayChange: quote.change || 0
    };
  });

  // 2. Mutual fund holdings valuation
  let mfInvested = 0;
  let mfCurrent = 0;
  const mfHoldings = (user.mfHoldings || []).map(m => {
    mfInvested += m.investedAmount;
    mfCurrent += m.currentValue;
    return {
      ...m,
      pnl: m.currentValue - m.investedAmount,
      pnlPercent: m.investedAmount > 0 ? ((m.currentValue - m.investedAmount) / m.investedAmount) * 100 : 0
    };
  });

  // 3. SIP valuation
  let sipInvested = 0;
  let sipCurrent = 0;
  (user.sipPlans || []).forEach(s => {
    sipInvested += s.totalInvested;
    sipCurrent += (s.currentValue || s.totalInvested);
  });

  // 4. IPO applications valuation
  let ipoInvested = 0;
  let ipoCurrent = 0;
  (user.ipoApplications || []).forEach(a => {
    ipoInvested += a.totalAmount;
    // If allotted, calculate current value
    const ipo = IN_MEMORY_IPOS.find(i => i.id === a.ipoId);
    if (a.status === 'ALLOTTED' && ipo && ipo.listingPrice) {
      ipoCurrent += a.allottedShares * ipo.listingPrice;
    } else {
      ipoCurrent += a.totalAmount; // ASBA blocked cash
    }
  });

  const totalInvested = stockInvested + mfInvested + sipInvested + ipoInvested;
  const currentAssetsValue = stockCurrent + mfCurrent + sipCurrent + ipoCurrent;
  const netWorth = user.availableBalance + currentAssetsValue;
  const totalProfit = currentAssetsValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const allocation = [
    { label: 'Indian Stocks', value: stockCurrent, percent: netWorth > 0 ? (stockCurrent / netWorth) * 100 : 0, color: '#00D4FF' },
    { label: 'Mutual Funds', value: mfCurrent, percent: netWorth > 0 ? (mfCurrent / netWorth) * 100 : 0, color: '#10B981' },
    { label: 'Active SIPs', value: sipCurrent, percent: netWorth > 0 ? (sipCurrent / netWorth) * 100 : 0, color: '#8B5CF6' },
    { label: 'IPO ASBA', value: ipoCurrent, percent: netWorth > 0 ? (ipoCurrent / netWorth) * 100 : 0, color: '#F59E0B' },
    { label: 'Available Cash', value: user.availableBalance, percent: netWorth > 0 ? (user.availableBalance / netWorth) * 100 : 0, color: '#3B82F6' }
  ];

  res.json({
    success: true,
    portfolio: {
      profile: {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        mobile: user.mobile,
        pan: user.pan,
        availableBalance: user.availableBalance,
        totalNetWorth: parseFloat(netWorth.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        currentAssetsValue: parseFloat(currentAssetsValue.toFixed(2)),
        overallProfit: parseFloat(totalProfit.toFixed(2)),
        overallProfitPercent: parseFloat(totalProfitPercent.toFixed(2)),
        todaysProfit: parseFloat(stockDayProfit.toFixed(2)),
        todaysProfitPercent: stockInvested > 0 ? parseFloat(((stockDayProfit / stockInvested) * 100).toFixed(2)) : 0,
        xirr: 18.42 // Annualized realistic return rate
      },
      stockMetrics: { invested: stockInvested, current: stockCurrent, pnl: stockCurrent - stockInvested, count: stockHoldings.length, holdings: stockHoldings },
      mfMetrics: { invested: mfInvested, current: mfCurrent, pnl: mfCurrent - mfInvested, count: mfHoldings.length, holdings: mfHoldings },
      sipMetrics: { invested: sipInvested, current: sipCurrent, count: (user.sipPlans || []).length, plans: user.sipPlans || [] },
      ipoMetrics: { invested: ipoInvested, current: ipoCurrent, count: (user.ipoApplications || []).length, applications: user.ipoApplications || [] },
      allocation
    }
  });
});

// ============================================================
// 5. LIVE INDIAN FINANCIAL NEWS & RSS ENDPOINT
// ============================================================
app.get('/api/news', async (req, res) => {
  const news = await fetchLiveIndianNews();
  res.json({ success: true, news, corporateActions: CORPORATE_ACTIONS });
});

app.get('/api/news/live', async (req, res) => {
  const news = await fetchLiveIndianNews();
  res.json({ success: true, count: news.length, data: news });
});

// ============================================================
// 6. ADMIN PANEL ENDPOINTS
// ============================================================
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  let totalUsers = Math.max(1, IN_MEMORY_USERS.length);
  let totalOrders = 0;
  let totalSIPs = 0;
  let totalIPOs = 0;
  let totalTurnover = 0;

  IN_MEMORY_USERS.forEach(u => {
    totalOrders += (u.orders || []).length;
    totalSIPs += (u.sipPlans || []).length;
    totalIPOs += (u.ipoApplications || []).length;
    (u.orders || []).forEach(o => totalTurnover += (o.qty * (o.price || 0)));
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalSIPs,
      totalIPOs,
      totalTurnover: parseFloat(totalTurnover.toFixed(2)),
      activeIposCount: IN_MEMORY_IPOS.filter(i => i.status === 'OPEN').length,
      listedIposCount: IN_MEMORY_IPOS.filter(i => i.status === 'LISTED').length,
      totalMutualFundsCount: IN_MEMORY_MUTUAL_FUNDS.length,
      systemHealth: "100% OPERATIONAL"
    }
  });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  const usersList = IN_MEMORY_USERS.map(u => ({
    id: u.id,
    name: `${u.firstname} ${u.lastname}`,
    email: u.email,
    mobile: u.mobile,
    pan: u.pan,
    role: u.role || 'user',
    availableBalance: u.availableBalance,
    ordersCount: (u.orders || []).length,
    sipCount: (u.sipPlans || []).length,
    ipoCount: (u.ipoApplications || []).length
  }));
  res.json({ success: true, data: usersList });
});

app.put('/api/admin/users/:id/balance', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const user = getUserSessionData(req.params.id);
  user.availableBalance = parseFloat(amount) || user.availableBalance;
  res.json({ success: true, message: `Updated balance for ${user.firstname} to ₹${user.availableBalance}`, balance: user.availableBalance });
});

app.post('/api/admin/ipos', authenticateToken, (req, res) => {
  const newIpo = {
    id: `ipo-${IN_MEMORY_IPOS.length + 1}`,
    ...req.body,
    status: req.body.status || 'UPCOMING'
  };
  IN_MEMORY_IPOS.unshift(newIpo);
  res.json({ success: true, message: "New IPO added successfully", ipo: newIpo });
});

app.put('/api/admin/ipos/:id', authenticateToken, (req, res) => {
  const index = IN_MEMORY_IPOS.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "IPO not found" });
  IN_MEMORY_IPOS[index] = { ...IN_MEMORY_IPOS[index], ...req.body };
  res.json({ success: true, message: "IPO updated successfully", ipo: IN_MEMORY_IPOS[index] });
});

app.get('/api/admin/orders', authenticateToken, (req, res) => {
  const allOrders = [];
  IN_MEMORY_USERS.forEach(u => {
    (u.orders || []).forEach(o => {
      allOrders.push({ ...o, userName: `${u.firstname} ${u.lastname}`, userEmail: u.email });
    });
  });
  res.json({ success: true, data: allOrders });
});

app.get('/api/admin/announcements', (req, res) => {
  res.json({ success: true, data: IN_MEMORY_ANNOUNCEMENTS });
});

app.post('/api/admin/announcements', authenticateToken, (req, res) => {
  const { title, message, category = 'MARKET_ALERT', severity = 'INFO' } = req.body;
  const ann = {
    id: IN_MEMORY_ANNOUNCEMENTS.length + 1,
    title,
    message,
    category,
    severity,
    date: 'Just now'
  };
  IN_MEMORY_ANNOUNCEMENTS.unshift(ann);
  res.json({ success: true, message: "Announcement published", announcement: ann });
});

// ============================================================
// 7. AI INSIGHTS & TRANSACTIONS
// ============================================================
app.get('/api/ai/insights', optionalAuthenticateToken, async (req, res) => {
  let portfolioMock = { holdings: [] };
  if (req.user) {
    const user = getUserSessionData(req.user.id);
    portfolioMock.holdings = (user.holdings || []).map(h => ({
      symbol: h.stock_name.replace('.NS', '').replace('.BO', ''),
      qty: parseInt(h.qty, 10)
    }));
  }
  const insights = generateAiInsights(portfolioMock, STOCKS_DATABASE);
  res.json({ success: true, ...insights });
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  const user = getUserSessionData(req.user.id);
  res.json({ success: true, data: user.transactions || [] });
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
