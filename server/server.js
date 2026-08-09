const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const {
  STOCKS_DATABASE,
  MARKET_INDICES,
  USER_PORTFOLIO,
  INDIAN_IPOS,
  MUTUAL_FUNDS,
  INDIAN_MARKET_NEWS,
  CORPORATE_ACTIONS
} = require('./data/stocksData');

const {
  generateCandleData,
  calculateTradeCharges
} = require('./services/marketEngine');

const { generateAiInsights } = require('./services/aiEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'indian_stock_market_jwt_secret_key_2026';

// Middleware to verify JWT token if present
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

app.use(authenticateToken);

// === AUTH ENDPOINTS ===
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email, name: "Rahul Sharma", role: email && email.includes('admin') ? 'ADMIN' : 'USER' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    token,
    user: {
      name: "Rahul Sharma",
      email: email || "rahul.sharma@investor.in",
      role: email && email.includes('admin') ? 'ADMIN' : 'USER',
      pan: USER_PORTFOLIO.profile.pan,
      kycStatus: "VERIFIED"
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, pan } = req.body;
  const token = jwt.sign({ email, name, role: 'USER' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    token,
    user: {
      name: name || "New Investor",
      email: email || "user@investor.in",
      role: "USER",
      pan: pan || "ABCDE1234F",
      kycStatus: "VERIFIED"
    }
  });
});

// === MARKET & STOCKS ENDPOINTS ===
app.get('/api/indices', (req, res) => {
  res.json({ success: true, data: MARKET_INDICES });
});

app.get('/api/stocks', (req, res) => {
  res.json({ success: true, data: STOCKS_DATABASE });
});

app.get('/api/stocks/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const filtered = STOCKS_DATABASE.filter(stock => 
    stock.symbol.toLowerCase().includes(query) || 
    stock.name.toLowerCase().includes(query) ||
    stock.sector.toLowerCase().includes(query)
  );
  res.json({ success: true, data: filtered });
});

app.get('/api/stocks/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = STOCKS_DATABASE.find(s => s.symbol === symbol);
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  res.json({ success: true, data: stock });
});

app.get('/api/stocks/:symbol/chart', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const timeframe = req.query.timeframe || '1D';
  const candles = generateCandleData(symbol, timeframe);
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
app.get('/api/portfolio', (req, res) => {
  let currentVal = 0;
  let todaysPnl = 0;

  USER_PORTFOLIO.holdings.forEach(h => {
    const liveStock = STOCKS_DATABASE.find(s => s.symbol === h.symbol);
    if (liveStock) {
      h.currentPrice = liveStock.price;
      h.dayChange = liveStock.change;
      h.currentValue = parseFloat((h.qty * liveStock.price).toFixed(2));
      h.pnl = parseFloat((h.currentValue - h.investmentValue).toFixed(2));
      h.pnlPercent = parseFloat(((h.pnl / h.investmentValue) * 100).toFixed(2));
      todaysPnl += h.qty * liveStock.change;
    }
    currentVal += h.currentValue;
  });

  USER_PORTFOLIO.profile.currentPortfolioValue = parseFloat(currentVal.toFixed(2));
  USER_PORTFOLIO.profile.todaysProfit = parseFloat(todaysPnl.toFixed(2));
  USER_PORTFOLIO.profile.todaysProfitPercent = parseFloat(((todaysPnl / (currentVal - todaysPnl)) * 100).toFixed(2));
  USER_PORTFOLIO.profile.totalProfit = parseFloat((currentVal - USER_PORTFOLIO.profile.totalInvestment).toFixed(2));
  USER_PORTFOLIO.profile.totalProfitPercent = parseFloat(((USER_PORTFOLIO.profile.totalProfit / USER_PORTFOLIO.profile.totalInvestment) * 100).toFixed(2));

  res.json({ success: true, portfolio: USER_PORTFOLIO });
});

// === ORDER EXECUTION ===
app.post('/api/orders/place', (req, res) => {
  const { symbol, type, orderCategory, qty, price } = req.body;
  const stock = STOCKS_DATABASE.find(s => s.symbol === symbol.toUpperCase());
  
  if (!stock) {
    return res.status(400).json({ success: false, message: "Invalid Stock Symbol" });
  }

  const numQty = parseInt(qty, 10);
  const executionPrice = orderCategory === "MARKET" ? stock.price : parseFloat(price);
  const chargesCalc = calculateTradeCharges(type, numQty, executionPrice);

  if (type === "BUY") {
    if (USER_PORTFOLIO.profile.availableBalance < chargesCalc.estimatedTotalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient Funds in Account" });
    }
    USER_PORTFOLIO.profile.availableBalance -= chargesCalc.estimatedTotalAmount;

    const existingHolding = USER_PORTFOLIO.holdings.find(h => h.symbol === stock.symbol);
    if (existingHolding) {
      const totalQty = existingHolding.qty + numQty;
      const totalCost = existingHolding.investmentValue + chargesCalc.turnover;
      existingHolding.qty = totalQty;
      existingHolding.avgPrice = parseFloat((totalCost / totalQty).toFixed(2));
      existingHolding.investmentValue = parseFloat(totalCost.toFixed(2));
    } else {
      USER_PORTFOLIO.holdings.push({
        symbol: stock.symbol,
        name: stock.name,
        qty: numQty,
        avgPrice: executionPrice,
        currentPrice: stock.price,
        investmentValue: chargesCalc.turnover,
        currentValue: chargesCalc.turnover,
        pnl: 0,
        pnlPercent: 0,
        dayChange: stock.change,
        exchange: stock.exchange
      });
      USER_PORTFOLIO.profile.totalInvestment += chargesCalc.turnover;
    }
  } else if (type === "SELL") {
    const existingHolding = USER_PORTFOLIO.holdings.find(h => h.symbol === stock.symbol);
    if (!existingHolding || existingHolding.qty < numQty) {
      return res.status(400).json({ success: false, message: "Insufficient shares in holdings to sell" });
    }

    existingHolding.qty -= numQty;
    USER_PORTFOLIO.profile.availableBalance += chargesCalc.estimatedTotalAmount;

    if (existingHolding.qty === 0) {
      USER_PORTFOLIO.holdings = USER_PORTFOLIO.holdings.filter(h => h.symbol !== stock.symbol);
    }
  }

  const newOrder = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    symbol: stock.symbol,
    exchange: stock.exchange,
    type,
    orderCategory,
    qty: numQty,
    price: executionPrice,
    status: "EXECUTED",
    time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    executedPrice: executionPrice,
    charges: chargesCalc.totalCharges
  };

  USER_PORTFOLIO.orders.unshift(newOrder);

  res.json({
    success: true,
    message: `Order successfully executed: ${type} ${numQty} ${stock.symbol} @ ₹${executionPrice}`,
    order: newOrder,
    updatedBalance: USER_PORTFOLIO.profile.availableBalance
  });
});

// === FUNDS DEPOSIT & WITHDRAWAL ===
app.post('/api/funds/deposit', (req, res) => {
  const { amount, method } = req.body;
  const numAmt = parseFloat(amount);
  if (!numAmt || numAmt <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  USER_PORTFOLIO.profile.availableBalance += numAmt;
  USER_PORTFOLIO.profile.buyingPower += numAmt * 2;

  res.json({
    success: true,
    message: `₹${numAmt.toLocaleString('en-IN')} successfully added via ${method || 'UPI'}`,
    availableBalance: USER_PORTFOLIO.profile.availableBalance
  });
});

app.post('/api/funds/withdraw', (req, res) => {
  const { amount } = req.body;
  const numAmt = parseFloat(amount);
  if (!numAmt || numAmt > USER_PORTFOLIO.profile.availableBalance) {
    return res.status(400).json({ success: false, message: "Insufficient available balance" });
  }

  USER_PORTFOLIO.profile.availableBalance -= numAmt;
  res.json({
    success: true,
    message: `Payout request for ₹${numAmt.toLocaleString('en-IN')} initiated to linked Bank Account.`,
    availableBalance: USER_PORTFOLIO.profile.availableBalance
  });
});

// === IPOS, MUTUAL FUNDS, NEWS, AI ===
app.get('/api/ipos', (req, res) => {
  res.json({ success: true, data: INDIAN_IPOS });
});

app.post('/api/ipos/allotment-check', (req, res) => {
  const { pan, ipoId } = req.body;
  const ipo = INDIAN_IPOS.find(i => i.id === ipoId) || INDIAN_IPOS[0];
  const allocated = Math.random() > 0.4;
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

app.get('/api/ai/insights', (req, res) => {
  const insights = generateAiInsights(USER_PORTFOLIO, STOCKS_DATABASE);
  res.json({ success: true, ...insights });
});

// === ADMIN ENDPOINTS ===
app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: 142850,
      activeTradersToday: 38420,
      totalOrdersExecuted: 1894200,
      dailyTurnover: "₹4,250.80 Cr",
      systemStatus: "ALL SYSTEMS OPERATIONAL (NSE/BSE FEED OK)",
      marketStatus: "OPEN"
    }
  });
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
  console.log(`Indian Stock Market Trading Server listening on port ${PORT}`);
});
