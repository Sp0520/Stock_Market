const { STOCKS_DATABASE, MARKET_INDICES, USER_PORTFOLIO } = require('../data/stocksData');

// Generate historical candlestick chart data for a stock
function generateCandleData(symbol, timeframe = "1D") {
  const stock = STOCKS_DATABASE.find(s => s.symbol === symbol) || STOCKS_DATABASE[0];
  const basePrice = stock.price;
  
  let points = 50;
  let intervalMinutes = 5;
  if (timeframe === "5D") { points = 60; intervalMinutes = 30; }
  else if (timeframe === "1M") { points = 30; intervalMinutes = 1440; }
  else if (timeframe === "3M") { points = 60; intervalMinutes = 1440; }
  else if (timeframe === "6M") { points = 90; intervalMinutes = 1440; }
  else if (timeframe === "1Y") { points = 120; intervalMinutes = 2880; }
  else if (timeframe === "5Y" || timeframe === "MAX") { points = 180; intervalMinutes = 10080; }

  const candles = [];
  let currentPrice = basePrice * 0.94; // start slightly lower
  const now = Date.now();

  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMinutes * 60 * 1000).toISOString();
    const volatility = basePrice * 0.012;
    const open = currentPrice;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.6);
    const volume = Math.floor(10000 + Math.random() * 50000);

    candles.push({
      time: timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });

    currentPrice = close;
  }

  // Ensure last close matches current stock price
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice;
  }

  return candles;
}

// Calculate Indian Statutory Charges for trading (NSE/BSE)
function calculateTradeCharges(type, qty, price) {
  const turnover = qty * price;
  const brokerage = Math.min(20, parseFloat((turnover * 0.0003).toFixed(2))); // ₹20 flat or 0.03%
  const stt = type === "SELL" ? parseFloat((turnover * 0.001).toFixed(2)) : parseFloat((turnover * 0.001).toFixed(2)); // STT 0.1%
  const exchangeTurnover = parseFloat((turnover * 0.0000325).toFixed(2));
  const gst = parseFloat(((brokerage + exchangeTurnover) * 0.18).toFixed(2));
  const sebiCharges = parseFloat((turnover * 0.000001).toFixed(2));
  const stampDuty = type === "BUY" ? parseFloat((turnover * 0.00015).toFixed(2)) : 0;

  const totalCharges = parseFloat((brokerage + stt + exchangeTurnover + gst + sebiCharges + stampDuty).toFixed(2));

  return {
    turnover: parseFloat(turnover.toFixed(2)),
    brokerage,
    stt,
    exchangeTurnover,
    gst,
    sebiCharges,
    stampDuty,
    totalCharges,
    estimatedTotalAmount: type === "BUY" 
      ? parseFloat((turnover + totalCharges).toFixed(2))
      : parseFloat((turnover - totalCharges).toFixed(2))
  };
}

// Tick simulator to update prices smoothly
function tickPrices() {
  STOCKS_DATABASE.forEach(stock => {
    const delta = (Math.random() - 0.49) * (stock.price * 0.003);
    stock.price = Math.max(0.5, parseFloat((stock.price + delta).toFixed(2)));
    stock.change = parseFloat((stock.price - stock.prevClose).toFixed(2));
    stock.changePercent = parseFloat(((stock.change / stock.prevClose) * 100).toFixed(2));
  });

  MARKET_INDICES.forEach(index => {
    const delta = (Math.random() - 0.48) * (index.price * 0.0015);
    index.price = parseFloat((index.price + delta).toFixed(2));
    index.change = parseFloat((index.change * 0.995 + delta).toFixed(2));
    index.changePercent = parseFloat(((index.change / index.price) * 100).toFixed(2));
    index.status = index.change >= 0 ? "positive" : "negative";
  });
}

// Interval for tick updates
setInterval(tickPrices, 3000);

module.exports = {
  generateCandleData,
  calculateTradeCharges,
  STOCKS_DATABASE,
  MARKET_INDICES,
  USER_PORTFOLIO
};
