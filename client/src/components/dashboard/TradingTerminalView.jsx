import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Info, Search, Heart, Sparkles, HelpCircle } from 'lucide-react';
import { fetchMarketIndices, fetchStocksList, fetchStockDetails, fetchStockChart, estimateCharges, placeOrder, addToWatchlist, fetchWatchlist, removeFromWatchlist } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

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
  const [walletBalance, setWalletBalance] = useState(0);
  const [chargesInfo, setChargesInfo] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Watchlist check
  const [isWatchlisted, setIsWatchlisted] = useState(false);

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
      }
    } catch (err) {
      console.warn("Error loading startup terminal data:", err.message);
    }
  };

  const loadStockData = async (symbol) => {
    try {
      const details = await fetchStockDetails(symbol);
      setStockDetails(details);
      if (details) {
        setLimitPrice(details.price);
      }

      // Check watchlist status
      const token = localStorage.getItem('authToken');
      if (token) {
        const wl = await fetchWatchlist();
        const found = wl.some(w => w.symbol === symbol);
        setIsWatchlisted(found);
      }
    } catch (err) {
      console.warn(`Failed to load details for ${symbol}:`, err.message);
    }
  };

  const loadChartData = async (symbol, tf) => {
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
    loadStockData(selectedSymbol);
    loadChartData(selectedSymbol, timeframe);
  }, [selectedSymbol]);

  useEffect(() => {
    loadChartData(selectedSymbol, timeframe);
  }, [timeframe]);

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
      alert("Please log in to add stocks to your watchlist.");
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to execute trades.");
      return;
    }

    const execPrice = orderCategory === 'MARKET' ? stockDetails.price : parseFloat(limitPrice);
    if (isNaN(execPrice) || execPrice <= 0) {
      alert("Please enter a valid limit price.");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }

    try {
      setOrderLoading(true);
      const res = await placeOrder(selectedSymbol, orderType, orderCategory, quantity, execPrice);
      
      alert(res.message);
      
      // Update wallet balance in UI
      setWalletBalance(res.updatedBalance);
      
      // Notify parent to trigger reloading
      if (onOrderExecuted) {
        onOrderExecuted(res);
      }
      
      // Reload current stock data
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

  return (
    <div className="space-y-6">
      
      {/* Indices Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        {indices.map((ind, idx) => {
          const isUp = ind.change >= 0;
          return (
            <div key={idx} className="glass-card p-3 flex flex-col justify-between hover:border-cyan-400/20 cursor-pointer font-mono">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold text-white">{ind.symbol}</span>
                <span className="text-slate-400 scale-90">{ind.exchange}</span>
              </div>
              <div className="mt-1.5 flex justify-between items-baseline">
                <span className="text-[13px] font-black text-white">₹{ind.price.toLocaleString('en-IN')}</span>
                <span className={`text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{ind.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Search and Stock List */}
        <div className="glass-card p-5 space-y-4 flex flex-col h-[650px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Explore Markets</h3>

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
              <div className="text-center text-xs text-slate-500 py-6">No matching stocks found</div>
            ) : (
              filteredStocks.map((stock) => {
                const isActive = selectedSymbol === stock.symbol;
                const isUp = stock.change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isActive
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10'
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

        {/* Center & Right Column */}
        {stockDetails ? (
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart + Fundamentals Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stock Title Bar */}
              <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                    {selectedSymbol.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white leading-tight">{stockDetails.name}</h2>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stockDetails.exchange}: {selectedSymbol}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-right">
                  <div>
                    <div className="text-xl font-black text-white">₹{stockDetails.price.toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${stockDetails.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stockDetails.change >= 0 ? '+' : ''}{stockDetails.change.toFixed(2)} ({stockDetails.change >= 0 ? '+' : ''}{stockDetails.changePercent.toFixed(2)}%)
                    </div>
                  </div>

                  <button
                    onClick={toggleWatchlist}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isWatchlisted 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Technical Chart Panel */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
                  {/* Timeframe selector */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/5 text-[10px]">
                    {['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          timeframe === tf ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Chart type selector */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/5 text-[10px]">
                    {['CANDLESTICK', 'AREA', 'LINE'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setChartMode(mode)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          chartMode === mode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated/Yahoo Canvas Candlestick Chart */}
                <div className="relative w-full h-72 bg-slate-950/70 rounded-2xl border border-white/5 p-3 overflow-hidden flex flex-col justify-between">
                  {hoveredCandle ? (
                    <div className="text-[10px] font-mono text-slate-400 flex gap-3 border-b border-white/5 pb-1">
                      <span>O: <span className="text-white font-bold">{hoveredCandle.open}</span></span>
                      <span>H: <span className="text-emerald-400 font-bold">{hoveredCandle.high}</span></span>
                      <span>L: <span className="text-rose-400 font-bold">{hoveredCandle.low}</span></span>
                      <span>C: <span className="text-white font-bold">{hoveredCandle.close}</span></span>
                      <span>V: <span className="text-slate-200 font-bold">{hoveredCandle.volume.toLocaleString()}</span></span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-slate-500">Hover candles for OHLC details</div>
                  )}

                  {candles.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-500">Loading chart candles...</div>
                  ) : (
                    <div className="flex-1 flex items-end w-full pt-4 relative">
                      
                      {/* Interactive SVG Chart Drawing */}
                      <svg width="100%" height="100%" className="overflow-visible select-none">
                        {(() => {
                          const prices = candles.map(c => c.close);
                          const highs = candles.map(c => c.high);
                          const lows = candles.map(c => c.low);
                          
                          const maxVal = Math.max(...highs);
                          const minVal = Math.min(...lows);
                          const rangeVal = maxVal - minVal || 1;

                          const widthPercent = 100 / candles.length;
                          
                          return candles.map((c, idx) => {
                            const isUp = c.close >= c.open;
                            
                            // Coordinates
                            const x = (idx * widthPercent) + (widthPercent / 2);
                            const yOpen = 100 - (((c.open - minVal) / rangeVal) * 80 + 10);
                            const yClose = 100 - (((c.close - minVal) / rangeVal) * 80 + 10);
                            const yHigh = 100 - (((c.high - minVal) / rangeVal) * 80 + 10);
                            const yLow = 100 - (((c.low - minVal) / rangeVal) * 80 + 10);

                            const color = isUp ? '#10b981' : '#f43f5e';
                            
                            return (
                              <g 
                                key={idx} 
                                className="cursor-crosshair"
                                onMouseEnter={() => setHoveredCandle(c)}
                                onMouseLeave={() => setHoveredCandle(null)}
                              >
                                {chartMode === 'CANDLESTICK' ? (
                                  <>
                                    {/* Wick line */}
                                    <line x1={`${x}%`} y1={`${yHigh}%`} x2={`${x}%`} y2={`${yLow}%`} stroke={color} strokeWidth="1" />
                                    {/* Candle body rect */}
                                    <rect 
                                      x={`${x - (widthPercent * 0.35)}%`} 
                                      y={`${Math.min(yOpen, yClose)}%`} 
                                      width={`${widthPercent * 0.7}%`} 
                                      height={`${Math.max(1, Math.abs(yClose - yOpen))}%`} 
                                      fill={color} 
                                      stroke={color}
                                      strokeWidth="0.5"
                                    />
                                  </>
                                ) : chartMode === 'AREA' ? (
                                  idx < candles.length - 1 && (
                                    <>
                                      <line 
                                        x1={`${x}%`} 
                                        y1={`${yClose}%`} 
                                        x2={`${((idx+1) * widthPercent) + (widthPercent / 2)}%`} 
                                        y2={`${100 - (((candles[idx+1].close - minVal) / rangeVal) * 80 + 10)}%`} 
                                        stroke="#00d4ff" 
                                        strokeWidth="1.5" 
                                      />
                                      {/* Area fill poly */}
                                      <polygon
                                        points={`${x}%,${yClose}% ${((idx+1) * widthPercent) + (widthPercent / 2)}%,${100 - (((candles[idx+1].close - minVal) / rangeVal) * 80 + 10)}% ${((idx+1) * widthPercent) + (widthPercent / 2)}%,100% ${x}%,100%`}
                                        fill="url(#areaGrad)"
                                        opacity="0.15"
                                      />
                                    </>
                                  )
                                ) : (
                                  idx < candles.length - 1 && (
                                    <line 
                                      x1={`${x}%`} 
                                      y1={`${yClose}%`} 
                                      x2={`${((idx+1) * widthPercent) + (widthPercent / 2)}%`} 
                                      y2={`${100 - (((candles[idx+1].close - minVal) / rangeVal) * 80 + 10)}%`} 
                                      stroke="#00d4ff" 
                                      strokeWidth="1.5" 
                                    />
                                  )
                                )}
                              </g>
                            );
                          });
                        })()}
                        {/* Define gradients */}
                        <defs>
                          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}

                  {/* Axis values */}
                  <div className="absolute right-3 top-10 bottom-3 flex flex-col justify-between items-end pointer-events-none text-[9px] font-mono text-slate-500">
                    <span>Max: ₹{Math.max(...candles.map(c=>c.high)).toFixed(0)}</span>
                    <span>Min: ₹{Math.min(...candles.map(c=>c.low)).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Fundamental Profile card */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company Fundamentals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Market Cap</span>
                    <span className="text-white font-extrabold">{stockDetails.marketCap}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">P/E Ratio</span>
                    <span className="text-white font-extrabold">{stockDetails.peRatio}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">EPS</span>
                    <span className="text-cyan-300 font-extrabold">{stockDetails.eps}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Div Yield</span>
                    <span className="text-emerald-400 font-extrabold">{stockDetails.divYield}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">52-Week High</span>
                    <span className="text-emerald-400 font-extrabold">₹{stockDetails.fiftyTwoHigh}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">52-Week Low</span>
                    <span className="text-rose-400 font-extrabold">₹{stockDetails.fiftyTwoLow}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 col-span-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Sector / Industry</span>
                    <span className="text-slate-200 font-extrabold truncate block">{stockDetails.sector} • {stockDetails.industry}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Order execution panel */}
            <div className="space-y-6">
              
              {/* Order Form */}
              <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Place Order</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Wallet: ₹{walletBalance.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs mt-4">
                    {/* BUY / SELL Switch */}
                    <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setOrderType('BUY')}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all text-center uppercase tracking-wider text-[11px] ${
                          orderType === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('SELL')}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all text-center uppercase tracking-wider text-[11px] ${
                          orderType === 'SELL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Order Category */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Order Type</label>
                      <select 
                        value={orderCategory} 
                        onChange={(e) => setOrderCategory(e.target.value)}
                        className="w-full glass-input text-white"
                      >
                        <option value="MARKET" className="bg-slate-900">MARKET (Execute at LTP)</option>
                        <option value="LIMIT" className="bg-slate-900">LIMIT (Custom target price)</option>
                        <option value="SL" className="bg-slate-900">STOP LOSS (Execute triggers)</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Quantity (Shares)</label>
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
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Limit Price (₹)</label>
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

                    {/* Charges breakdown calculation */}
                    {chargesInfo && (
                      <div className="space-y-2 text-[10px] font-mono bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Turnover</span>
                          <span className="text-white font-bold">₹{chargesInfo.turnover.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Brokerage (Flat / 0.03%)</span>
                          <span>₹{chargesInfo.brokerage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GST (18% on brokerage)</span>
                          <span>₹{chargesInfo.gst}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">STT (0.1%) / Stamp Duty</span>
                          <span>₹{(chargesInfo.stt + chargesInfo.stampDuty).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-xs font-bold">
                          <span className="text-slate-300">Estimated Total Amount</span>
                          <span className="text-cyan-300">₹{chargesInfo.estimatedTotalAmount.toLocaleString('en-IN')}</span>
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
                          : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 text-white'
                      }`}
                    >
                      {orderLoading ? (
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block"></span>
                      ) : `${orderType} ${quantity} ${selectedSymbol}`}
                    </button>

                  </form>
                </div>
              </div>

              {/* Order Book Panel */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Order Book Depth
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{selectedSymbol}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-300">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">Bid Prices</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-emerald-400">
                        <span>₹{(stockDetails.price - 0.15).toFixed(2)}</span> 
                        <span className="text-slate-400">1,245</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>₹{(stockDetails.price - 0.40).toFixed(2)}</span> 
                        <span className="text-slate-400">3,120</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-rose-400 font-bold block mb-1">Ask Prices</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-rose-400">
                        <span>₹{(stockDetails.price + 0.15).toFixed(2)}</span> 
                        <span className="text-slate-400">890</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>₹{(stockDetails.price + 0.35).toFixed(2)}</span> 
                        <span className="text-slate-400">1,450</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 h-2 pt-2.5">
                  <div className="h-full bg-emerald-500 rounded-l" style={{ width: '58%' }} />
                  <div className="h-full bg-rose-500 rounded-r" style={{ width: '42%' }} />
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 glass-card p-10 text-center text-slate-400 text-xs font-semibold">
            Select a stock to load detailed analytics and order ticket.
          </div>
        )}

      </div>
    </div>
  );
};
