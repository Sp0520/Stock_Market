import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Info, Search, Heart, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { 
  fetchMarketIndices, 
  fetchStocksList, 
  fetchStockDetails, 
  fetchStockChart, 
  estimateCharges, 
  placeOrder, 
  addToWatchlist, 
  fetchWatchlist, 
  removeFromWatchlist 
} from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

// Custom canvas-based candlestick chart component for maximum performance
const CanvasChart = ({ candles = [], chartMode = 'CANDLESTICK', hoveredCandle, setHoveredCandle }) => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isMouseOver, setIsMouseOver] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (candles.length === 0) return;

    const paddingLeft = 15;
    const paddingRight = 65;
    const paddingTop = 25;
    const paddingBottom = 20;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const maxPrice = Math.max(...highs) * 1.002;
    const minPrice = Math.min(...lows) * 0.998;
    const priceRange = maxPrice - minPrice || 1;

    const xProj = (index) => paddingLeft + (index / (candles.length - 1)) * plotWidth;
    const yProj = (price) => paddingTop + plotHeight * (1 - (price - minPrice) / priceRange);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
      const p = minPrice + (i / 4) * priceRange;
      const y = yProj(p);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + plotWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('₹' + p.toFixed(2), paddingLeft + plotWidth + 6, y + 3);
    }

    const step = Math.floor(candles.length / 5) || 1;
    for (let i = 0; i < candles.length; i += step) {
      const x = xProj(i);
      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, paddingTop + plotHeight);
      ctx.stroke();

      const timeStr = new Date(candles[i].time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#64748b';
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, paddingTop + plotHeight + 12);
    }

    const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;
    candles.forEach((c, idx) => {
      const isUp = c.close >= c.open;
      const x = xProj(idx);
      const w = Math.max(1, (plotWidth / candles.length) * 0.6);
      const volHeight = (c.volume / maxVolume) * (plotHeight * 0.15);
      const y = paddingTop + plotHeight - volHeight;

      ctx.fillStyle = isUp ? 'rgba(0, 227, 138, 0.12)' : 'rgba(255, 59, 92, 0.12)';
      ctx.fillRect(x - w / 2, y, w, volHeight);
    });

    const smaPeriod = 9;
    if (candles.length >= smaPeriod) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.6)';
      ctx.lineWidth = 1.5;
      
      for (let i = smaPeriod - 1; i < candles.length; i++) {
        let sum = 0;
        for (let j = 0; j < smaPeriod; j++) {
          sum += candles[i - j].close;
        }
        const avg = sum / smaPeriod;
        const x = xProj(i);
        const y = yProj(avg);
        
        if (i === smaPeriod - 1) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (chartMode === 'CANDLESTICK') {
      candles.forEach((c, idx) => {
        const isUp = c.close >= c.open;
        const x = xProj(idx);
        const yOpen = yProj(c.open);
        const yClose = yProj(c.close);
        const yHigh = yProj(c.high);
        const yLow = yProj(c.low);
        const color = isUp ? '#00e38a' : '#ff3b5c';
        const bodyWidth = Math.max(2, (plotWidth / candles.length) * 0.7);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        ctx.fillStyle = color;
        const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
        ctx.fillRect(x - bodyWidth / 2, Math.min(yOpen, yClose), bodyWidth, bodyHeight);
      });
    } else if (chartMode === 'AREA') {
      ctx.beginPath();
      ctx.moveTo(xProj(0), yProj(candles[0].close));
      for (let i = 1; i < candles.length; i++) {
        ctx.lineTo(xProj(i), yProj(candles[i].close));
      }
      
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.lineTo(xProj(candles.length - 1), paddingTop + plotHeight);
      ctx.lineTo(xProj(0), paddingTop + plotHeight);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + plotHeight);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.25)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(xProj(0), yProj(candles[0].close));
      for (let i = 1; i < candles.length; i++) {
        ctx.lineTo(xProj(i), yProj(candles[i].close));
      }
      ctx.strokeStyle = '#7c5cfc';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const hoverIdx = Math.round(((mousePos.x - paddingLeft) / plotWidth) * (candles.length - 1));
    if (isMouseOver && hoverIdx >= 0 && hoverIdx < candles.length) {
      const hoverCandle = candles[hoverIdx];
      const x = xProj(hoverIdx);
      const y = yProj(hoverCandle.close);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, paddingTop + plotHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + plotWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(paddingLeft + plotWidth + 2, y - 8, 62, 16);
      ctx.fillStyle = '#05070d';
      ctx.font = 'bold 8.5px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('₹' + hoverCandle.close.toFixed(2), paddingLeft + plotWidth + 5, y + 3);

      const timeStr = new Date(hoverCandle.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 22, paddingTop + plotHeight + 17, 44, 13);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, paddingTop + plotHeight + 26);
    }
  }, [candles, chartMode, mousePos, isMouseOver]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
    setIsMouseOver(true);

    const paddingLeft = 15;
    const paddingRight = 65;
    const plotWidth = rect.width - paddingLeft - paddingRight;
    const hoverIdx = Math.round(((x - paddingLeft) / plotWidth) * (candles.length - 1));

    if (hoverIdx >= 0 && hoverIdx < candles.length) {
      setHoveredCandle(candles[hoverIdx]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
    setHoveredCandle(null);
  };

  return (
    <div className="flex-1 w-full h-full relative">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full cursor-crosshair block"
      />
    </div>
  );
};

export const TradingTerminalView = ({ onOrderExecuted }) => {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [stockDetails, setStockDetails] = useState(null);
  
  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [indices, setIndices] = useState([]);

  // Timeframe and Chart
  const [timeframe, setTimeframe] = useState('1M');
  const [candles, setCandles] = useState([]);
  const [chartMode, setChartMode] = useState('CANDLESTICK'); // CANDLESTICK, AREA, LINE
  const [hoveredCandle, setHoveredCandle] = useState(null);

  // Order Ticket States
  const [orderType, setOrderType] = useState('BUY'); // BUY or SELL
  const [orderCategory, setOrderCategory] = useState('MARKET'); // MARKET, LIMIT, SL
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState(100000.00);
  const [chargesInfo, setChargesInfo] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Watchlist check
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [mobileTab, setMobileTab] = useState('CHART'); // CHART, DEPTH, TICKET

  // Load initial stocks and indices
  const loadInitialData = async () => {
    try {
      const idx = await fetchMarketIndices();
      setIndices(idx);
      
      const st = await fetchStocksList();
      setStocks(st);
      
      // Load user wallet balance if logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        const profileStr = localStorage.getItem('currentUser');
        if (profileStr) {
          const userObj = JSON.parse(profileStr);
          setWalletBalance(userObj.availableBalance || 100000.00);
        }
      } else {
        // Guest mode wallet
        const storedGuest = localStorage.getItem('guestPortfolio');
        if (storedGuest) {
          const guestData = JSON.parse(storedGuest);
          setWalletBalance(guestData.profile.availableBalance || 100000.00);
        }
      }
    } catch (err) {
      console.warn("Error loading startup terminal data:", err.message);
    }
  };

  const loadStockData = async (symbol, isSilent = false) => {
    try {
      const details = await fetchStockDetails(symbol);
      setStockDetails(details);
      if (details && !isSilent) {
        setLimitPrice(details.price);
      }

      // Check watchlist status
      const token = localStorage.getItem('authToken');
      if (token) {
        const wl = await fetchWatchlist();
        const found = wl.some(w => w.symbol === symbol);
        setIsWatchlisted(found);
      } else {
        // Guest mode watchlist simulation
        const storedWl = localStorage.getItem('guestWatchlist') || '[]';
        const wl = JSON.parse(storedWl);
        setIsWatchlisted(wl.includes(symbol));
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn(`Failed to load details for ${symbol}:`, err.message);
    }
  };

  const loadChartData = async (symbol, tf, isSilent = false) => {
    try {
      const chart = await fetchStockChart(symbol, tf);
      setCandles(chart);
    } catch (err) {
      console.warn(`Failed to load charts for ${symbol} / ${tf}:`, err.message);
    }
  };

  // Run initial triggers
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStockData(selectedSymbol, false);
    loadChartData(selectedSymbol, timeframe, false);
  }, [selectedSymbol]);

  useEffect(() => {
    loadChartData(selectedSymbol, timeframe, false);
  }, [timeframe]);

  // Live polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      // Silent refresh
      await loadStockData(selectedSymbol, true);
      await loadChartData(selectedSymbol, timeframe, true);
      try {
        const idx = await fetchMarketIndices();
        setIndices(idx);
        
        // Refresh wallet
        const token = localStorage.getItem('authToken');
        if (token) {
          const profileStr = localStorage.getItem('currentUser');
          if (profileStr) {
            const userObj = JSON.parse(profileStr);
            setWalletBalance(userObj.availableBalance || 100000.00);
          }
        } else {
          const storedGuest = localStorage.getItem('guestPortfolio');
          if (storedGuest) {
            const guestData = JSON.parse(storedGuest);
            setWalletBalance(guestData.profile.availableBalance || 100000.00);
          }
        }
      } catch (err) {
        console.warn("Failed to poll indices/wallet:", err.message);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  // Recalculate charges when price, quantity, or type changes
  useEffect(() => {
    const fetchCharges = async () => {
      const execPrice = orderCategory === 'MARKET' && stockDetails ? stockDetails.price : parseFloat(limitPrice);
      if (execPrice > 0 && quantity > 0) {
        try {
          const info = await estimateCharges(orderType, quantity, execPrice);
          setChargesInfo(info);
        } catch (err) {
          console.warn("Charges calculation error:", err.message);
        }
      }
    };
    fetchCharges();
  }, [orderType, orderCategory, quantity, limitPrice, stockDetails]);

  // Toggle watchlist symbol
  const toggleWatchlist = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Simulate watchlist for Sandbox guest
      const storedWl = localStorage.getItem('guestWatchlist') || '[]';
      let wl = JSON.parse(storedWl);
      if (isWatchlisted) {
        wl = wl.filter(w => w !== selectedSymbol);
        setIsWatchlisted(false);
        alert(`Removed ${selectedSymbol} from Sandbox Watchlist`);
      } else {
        wl.push(selectedSymbol);
        setIsWatchlisted(true);
        alert(`Added ${selectedSymbol} to Sandbox Watchlist`);
      }
      localStorage.setItem('guestWatchlist', JSON.stringify(wl));
      return;
    }

    try {
      if (isWatchlisted) {
        await removeFromWatchlist(selectedSymbol);
        setIsWatchlisted(false);
      } else {
        await addToWatchlist(selectedSymbol);
        setIsWatchlisted(true);
      }
    } catch (err) {
      alert(err.message || "Failed to edit watchlist");
    }
  };

  // Execute Order submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const execPrice = orderCategory === 'MARKET' ? stockDetails.price : parseFloat(limitPrice);
    if (isNaN(execPrice) || execPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      // Sandbox Order execution logic
      setOrderLoading(true);
      setTimeout(() => {
        const storedGuest = localStorage.getItem('guestPortfolio');
        if (!storedGuest) {
          alert("Please open the TradeFlow dashboard first to initialize the Sandbox!");
          setOrderLoading(false);
          return;
        }

        const guestData = JSON.parse(storedGuest);
        const totalCost = quantity * execPrice;
        const charges = 20.00 + (totalCost * 0.001);

        if (orderType === 'BUY') {
          if (guestData.profile.availableBalance < (totalCost + charges)) {
            alert("Insufficient virtual balance in Sandbox!");
            setOrderLoading(false);
            return;
          }
          guestData.profile.availableBalance -= (totalCost + charges);
          const holdingIndex = guestData.holdings.findIndex(h => h.symbol === selectedSymbol);
          if (holdingIndex >= 0) {
            const h = guestData.holdings[holdingIndex];
            const oldTotalCost = h.qty * h.avgPrice;
            const newQty = h.qty + quantity;
            h.avgPrice = parseFloat(((oldTotalCost + totalCost) / newQty).toFixed(2));
            h.qty = newQty;
            h.currentPrice = execPrice;
            h.currentValue = h.qty * execPrice;
            h.pnl = h.currentValue - (h.qty * h.avgPrice);
            h.pnlPercent = parseFloat(((h.pnl / (h.qty * h.avgPrice)) * 100).toFixed(2));
          } else {
            guestData.holdings.push({
              symbol: selectedSymbol,
              name: stockDetails.name,
              qty: quantity,
              avgPrice: execPrice,
              currentPrice: execPrice,
              currentValue: quantity * execPrice,
              pnl: 0,
              pnlPercent: 0,
              exchange: stockDetails.exchange || "NSE"
            });
          }
        } else {
          // SELL
          const holdingIndex = guestData.holdings.findIndex(h => h.symbol === selectedSymbol);
          if (holdingIndex < 0 || guestData.holdings[holdingIndex].qty < quantity) {
            alert("Insufficient shares to sell in Sandbox!");
            setOrderLoading(false);
            return;
          }
          const h = guestData.holdings[holdingIndex];
          guestData.profile.availableBalance += (totalCost - charges);
          h.qty -= quantity;
          if (h.qty === 0) {
            guestData.holdings.splice(holdingIndex, 1);
          } else {
            h.currentPrice = execPrice;
            h.currentValue = h.qty * execPrice;
            h.pnl = h.currentValue - (h.qty * h.avgPrice);
            h.pnlPercent = parseFloat(((h.pnl / (h.qty * h.avgPrice)) * 100).toFixed(2));
          }
        }

        // Add order logs
        const orderId = `ORD_${Math.floor(10000 + Math.random() * 90000)}`;
        guestData.orders.unshift({
          id: orderId,
          time: new Date().toISOString(),
          symbol: selectedSymbol,
          type: orderType,
          qty: quantity,
          price: execPrice,
          charges: charges,
          status: "COMPLETED",
          orderCategory: orderCategory
        });

        // Recalculate values
        let totalInvested = guestData.holdings.reduce((sum, h) => sum + (h.qty * h.avgPrice), 0);
        let currentHoldingsVal = guestData.holdings.reduce((sum, h) => sum + h.currentValue, 0);
        guestData.profile.totalInvestment = totalInvested;
        guestData.profile.currentPortfolioValue = currentHoldingsVal;
        guestData.profile.totalProfit = currentHoldingsVal - totalInvested;
        guestData.profile.totalProfitPercent = totalInvested > 0 ? parseFloat(((guestData.profile.totalProfit / totalInvested) * 100).toFixed(2)) : 0;
        
        localStorage.setItem('guestPortfolio', JSON.stringify(guestData));
        setWalletBalance(guestData.profile.availableBalance);
        setOrderLoading(false);
        alert(`Sandbox Order Executed: ${orderType} ${quantity} shares of ${selectedSymbol} at ₹${execPrice}`);
        if (onOrderExecuted) onOrderExecuted();
      }, 500);
      return;
    }

    try {
      setOrderLoading(true);
      const res = await placeOrder(selectedSymbol, orderType, orderCategory, quantity, execPrice);
      alert(res.message);
      setWalletBalance(res.updatedBalance);
      if (onOrderExecuted) onOrderExecuted(res);
      await loadStockData(selectedSymbol);
    } catch (err) {
      alert(err.message || "Order execution failed");
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate dynamic Bid/Ask ladder based on current stock price
  const getBidAskLadder = () => {
    if (!stockDetails) return { bids: [], asks: [] };
    const price = stockDetails.price;
    // Static distribution sizes representing order depth visual lengths
    return {
      bids: [
        { price: price - 0.05, qty: 8521, pct: 85 },
        { price: price - 0.10, qty: 12402, pct: 100 },
        { price: price - 0.15, qty: 7120, pct: 70 },
        { price: price - 0.20, qty: 4503, pct: 45 },
        { price: price - 0.25, qty: 2314, pct: 23 }
      ],
      asks: [
        { price: price + 0.05, qty: 9140, pct: 78 },
        { price: price + 0.10, qty: 11045, pct: 92 },
        { price: price + 0.15, qty: 8203, pct: 68 },
        { price: price + 0.20, qty: 5120, pct: 42 },
        { price: price + 0.25, qty: 1950, pct: 16 }
      ]
    };
  };

  const marketLadder = getBidAskLadder();

  return (
    <div className="space-y-6">
      
      {/* FINANCE.hub Market Indicators Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {indices.slice(0, 6).map((ind, idx) => {
          const isUp = ind.change >= 0;
          const isCurrency = ind.symbol === "USD/INR";
          return (
            <div key={idx} className="glass-card p-3 flex flex-col justify-between hover:border-cyan-500/30 cursor-pointer font-mono bg-slate-950/20">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold text-white">{ind.symbol}</span>
                <span className="text-slate-500 scale-90 uppercase font-bold">{ind.exchange}</span>
              </div>
              <div className="mt-1.5 flex justify-between items-baseline gap-1">
                <span className="text-[13px] font-black text-white">
                  {isCurrency ? `₹${ind.price.toFixed(2)}` : `₹${ind.price.toLocaleString('en-IN')}`}
                </span>
                <span className={`text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{ind.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FINANCE.hub Terminal Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Search and Stock Selector */}
        <div className="glass-card p-5 space-y-4 flex flex-col h-[650px] bg-slate-950/25">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">FINANCE.hub Terminal</h3>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{lastRefreshed.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search TCS, Reliance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-9 text-xs text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredStocks.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-6">No matching assets found</div>
            ) : (
              filteredStocks.map((stock) => {
                const isActive = selectedSymbol === stock.symbol;
                const isUp = stock.change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isActive
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs">{stock.symbol}</span>
                      <span className="badge-exchange text-[9px]">{stock.exchange || 'NSE'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-medium">{stock.name}</p>
                    <div className="flex items-baseline justify-between pt-1 font-mono">
                      <span className="text-xs font-bold text-white">₹{stock.price.toFixed(2)}</span>
                      <span className={`text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center & Right Columns */}
        {stockDetails ? (
          <div className="lg:col-span-3 flex flex-col xl:grid xl:grid-cols-3 gap-6">
            
            {/* Mobile Tab Navigation */}
            <div className="xl:hidden flex items-center justify-between bg-slate-950/80 p-1 rounded-2xl border border-white/5 w-full shrink-0">
              {[
                { id: 'CHART', label: '📊 Chart' },
                { id: 'DEPTH', label: '📋 Order Book' },
                { id: 'TICKET', label: '⚡ Trade Ticket' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black text-center transition-all ${
                    mobileTab === tab.id
                      ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40'
                      : 'text-slate-400 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart + Fundamentals Panel */}
            <div className={`xl:col-span-2 space-y-6 ${mobileTab === 'CHART' ? 'block' : 'hidden xl:block'}`}>
              
              {/* Real-time Price Card & Title */}
              <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/15">
                    {selectedSymbol.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white leading-none">{stockDetails.name}</h2>
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1.5">
                      {stockDetails.exchange}: {selectedSymbol} • Equity
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-right">
                  <div>
                    <div className="text-xl font-black text-white">{formatINR(stockDetails.price)}</div>
                    <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${stockDetails.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stockDetails.change >= 0 ? '▲' : '▼'}
                      <span>{stockDetails.change >= 0 ? '+' : ''}{stockDetails.change.toFixed(2)} ({stockDetails.change >= 0 ? '+' : ''}{stockDetails.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  <button
                    onClick={toggleWatchlist}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isWatchlisted 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Technical Chart Panel */}
              <div className="glass-card p-5 space-y-4 bg-slate-950/20">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-white/5 text-[10px]">
                    {['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          timeframe === tf ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Chart Style Mode */}
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-white/5 text-[10px]">
                    {['CANDLESTICK', 'AREA', 'LINE'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setChartMode(mode)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          chartMode === mode ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High-Performance Canvas Candlestick Chart */}
                <div className="relative w-full h-72 bg-slate-950/70 rounded-2xl border border-white/5 p-3 overflow-hidden flex flex-col justify-between">
                  {hoveredCandle ? (
                    <div className="text-[10px] font-mono text-slate-400 flex flex-wrap gap-3 border-b border-white/5 pb-1 relative z-10 bg-slate-950/40 p-1 rounded">
                      <span>O: <span className="text-white font-bold">{formatINR(hoveredCandle.open)}</span></span>
                      <span>H: <span className="text-emerald-400 font-bold">{formatINR(hoveredCandle.high)}</span></span>
                      <span>L: <span className="text-rose-400 font-bold">{formatINR(hoveredCandle.low)}</span></span>
                      <span>C: <span className="text-white font-bold">{formatINR(hoveredCandle.close)}</span></span>
                      <span>Vol: <span className="text-slate-300 font-bold">{hoveredCandle.volume.toLocaleString()}</span></span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-slate-500 relative z-10">Hover chart for OHLC and timeline ticks</div>
                  )}

                  {candles.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">Loading live candles...</div>
                  ) : (
                    <div className="flex-1 w-full pt-2 relative overflow-hidden">
                      <CanvasChart
                        candles={candles}
                        chartMode={chartMode}
                        hoveredCandle={hoveredCandle}
                        setHoveredCandle={setHoveredCandle}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Company Profile card */}
              <div className="glass-card p-5 space-y-4 bg-slate-950/20">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Company Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Market Cap</span>
                    <span className="text-white font-extrabold">{stockDetails.marketCap}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">P/E Ratio</span>
                    <span className="text-white font-extrabold">{stockDetails.peRatio}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">EPS (Earnings / Share)</span>
                    <span className="text-cyan-400 font-extrabold">{stockDetails.eps}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Dividend Yield</span>
                    <span className="text-emerald-400 font-extrabold">{stockDetails.divYield}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">52-Week High</span>
                    <span className="text-emerald-400 font-extrabold">₹{stockDetails.fiftyTwoHigh.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">52-Week Low</span>
                    <span className="text-rose-400 font-extrabold">₹{stockDetails.fiftyTwoLow.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 col-span-2">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Sector Equity / Industry Group</span>
                    <span className="text-slate-300 font-extrabold truncate block">{stockDetails.sector} • {stockDetails.industry}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Order Ticket & Order Book Depth */}
            <div className={`space-y-6 ${mobileTab !== 'CHART' ? 'block' : 'hidden xl:block'}`}>
              
              {/* Order Form Card */}
              <div className={`glass-card p-5 space-y-4 flex flex-col justify-between bg-slate-950/20 rounded-3xl ${mobileTab === 'TICKET' ? 'block' : 'hidden xl:block'}`}>
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execute Order</h3>
                    <span className="text-[9.5px] text-slate-400 font-mono">Cash: {formatINR(walletBalance)}</span>
                  </div>
                  
                  <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs mt-4">
                    {/* BUY / SELL Switch */}
                    <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setOrderType('BUY')}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all text-center uppercase tracking-wider text-[10px] ${
                          orderType === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('SELL')}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all text-center uppercase tracking-wider text-[10px] ${
                          orderType === 'SELL' ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-400'
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Order Category */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9.5px]">Order Category</label>
                      <select 
                        value={orderCategory} 
                        onChange={(e) => setOrderCategory(e.target.value)}
                        className="w-full glass-input text-white"
                      >
                        <option value="MARKET" className="bg-slate-950">MARKET (LTP Execution)</option>
                        <option value="LIMIT" className="bg-slate-950">LIMIT (Custom Target Price)</option>
                        <option value="SL" className="bg-slate-950">STOP LOSS (Trigger Execution)</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9.5px]">Quantity (Shares)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full glass-input text-white font-mono"
                      />
                    </div>

                    {/* Price Input (if LIMIT or SL) */}
                    {orderCategory !== 'MARKET' && (
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold uppercase text-[9.5px]">Target Price (₹)</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          required
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(Math.max(0.05, parseFloat(e.target.value) || 0))}
                          className="w-full glass-input text-white font-mono"
                        />
                      </div>
                    )}

                    {/* Charges Breakdown */}
                    {chargesInfo && (
                      <div className="space-y-2 text-[9px] font-mono bg-slate-950/70 p-3 rounded-xl border border-white/5 text-slate-400">
                        <div className="flex justify-between">
                          <span>Total Turnover</span>
                          <span className="text-white font-bold">{formatINR(chargesInfo.turnover)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flat Brokerage</span>
                          <span>{formatINR(chargesInfo.brokerage)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18% Brokerage)</span>
                          <span>{formatINR(chargesInfo.gst)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>STT & Exchange Fees</span>
                          <span>{formatINR(chargesInfo.stt + chargesInfo.stampDuty)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 text-xs font-bold">
                          <span className="text-slate-300">Total Est. Cash</span>
                          <span className="text-cyan-400">{formatINR(chargesInfo.estimatedTotalAmount)}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={orderLoading}
                      className={`w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-md transition-all ${
                        orderType === 'BUY'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white'
                      }`}
                    >
                      {orderLoading ? (
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block"></span>
                      ) : (
                        <span>Execute {orderType} ({quantity} Sh)</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Order Book & Market Depth with Volume Bars */}
              <div className={`glass-card p-5 space-y-3 bg-slate-950/20 border border-white/10 rounded-3xl ${mobileTab === 'DEPTH' ? 'block' : 'hidden xl:block'}`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Order Book & Market Depth
                  </h4>
                  <span className="text-[9px] text-cyan-400 font-mono font-bold">{selectedSymbol}</span>
                </div>

                <div className="space-y-4">
                  {/* Bids Ladder */}
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-500 font-bold mb-1 text-[8.5px] uppercase tracking-wider">
                      <span>Bid Price</span>
                      <span>Volume (Shares)</span>
                    </div>
                    {marketLadder.bids.map((b, i) => (
                      <div key={i} className="relative flex justify-between items-center py-1 px-1.5 rounded overflow-hidden">
                        {/* Background volume bar */}
                        <div 
                          className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300"
                          style={{ width: `${b.pct}%` }}
                        />
                        <span className="text-emerald-400 font-bold relative z-10">{formatINR(b.price)}</span>
                        <span className="text-slate-300 font-bold relative z-10">{b.qty.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ask Ladder */}
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-500 font-bold mb-1 text-[8.5px] uppercase tracking-wider">
                      <span>Ask Price</span>
                      <span>Volume (Shares)</span>
                    </div>
                    {marketLadder.asks.map((a, i) => (
                      <div key={i} className="relative flex justify-between items-center py-1 px-1.5 rounded overflow-hidden">
                        {/* Background volume bar */}
                        <div 
                          className="absolute right-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-300"
                          style={{ width: `${a.pct}%` }}
                        />
                        <span className="text-rose-400 font-bold relative z-10">{formatINR(a.price)}</span>
                        <span className="text-slate-300 font-bold relative z-10">{a.qty.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual ratio bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[8px] text-slate-500 font-bold font-mono uppercase">
                      <span>Total Bids: 58.2%</span>
                      <span>Total Asks: 41.8%</span>
                    </div>
                    <div className="flex items-center gap-1 h-1.5 rounded-full overflow-hidden bg-slate-950">
                      <div className="h-full bg-emerald-500" style={{ width: '58.2%' }} />
                      <div className="h-full bg-rose-500" style={{ width: '41.8%' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 glass-card p-12 text-center text-slate-400 text-xs font-semibold">
            Select an asset from the left panel terminal search to initialize analysis and trade.
          </div>
        )}

      </div>
    </div>
  );
};
