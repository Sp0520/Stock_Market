import React, { useState, useEffect } from 'react';
import { Card3D } from '../common/Card3D.jsx';
import { WatchlistView } from './WatchlistView.jsx';
import { formatINR } from '../../utils/formatters.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  Settings, 
  Eye, 
  LayoutDashboard, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp as GainIcon,
  PieChart
} from 'lucide-react';
import { Donut3DChart } from './Donut3DChart.jsx';
import { MarketHeatmap3D } from './MarketHeatmap3D.jsx';
import { fetchPortfolio, fetchStockDetails, fetchStockChart, placeOrder } from '../../services/api.js';

export const TradeFlowView = ({ onOrderExecuted }) => {
  const [activeSideTab, setActiveSideTab] = useState('Portfolio Overview');
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState('1M');
  
  // Data States
  const [portfolio, setPortfolio] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQty, setQuickQty] = useState(10);
  const [orderLoading, setOrderLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Mock Fallback Portfolio for Guests / Sandbox
  const getMockPortfolio = () => ({
    profile: {
      name: "Guest Investor",
      email: "guest@investor.in",
      availableBalance: 100000.00,
      totalInvestment: 85200.00,
      currentPortfolioValue: 92450.00,
      todaysProfit: 1450.00,
      todaysProfitPercent: 1.59,
      totalProfit: 7250.00,
      totalProfitPercent: 8.51
    },
    holdings: [
      { symbol: "RELIANCE", name: "Reliance Industries Ltd", qty: 20, avgPrice: 2850.00, currentPrice: 3012.45, currentValue: 60249.00, pnl: 3249.00, pnlPercent: 5.70, exchange: "NSE" },
      { symbol: "TCS", name: "Tata Consultancy Services Ltd", qty: 5, avgPrice: 4100.00, currentPrice: 4285.30, currentValue: 21426.50, pnl: 926.50, pnlPercent: 4.52, exchange: "NSE" }
    ],
    orders: [
      { id: "ORD_91823", time: new Date(Date.now() - 3600000).toISOString(), symbol: "RELIANCE", type: "BUY", qty: 10, price: 2850.00, charges: 15.20, status: "COMPLETED", orderCategory: "MARKET" }
    ]
  });

  // Load live data from backend proxy
  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    
    try {
      let livePortfolio;
      const token = localStorage.getItem('authToken');
      
      if (token) {
        livePortfolio = await fetchPortfolio();
      } else {
        // Fallback to local guest data
        const storedGuest = localStorage.getItem('guestPortfolio');
        if (storedGuest) {
          livePortfolio = JSON.parse(storedGuest);
        } else {
          livePortfolio = getMockPortfolio();
          localStorage.setItem('guestPortfolio', JSON.stringify(livePortfolio));
        }
      }
      
      setPortfolio(livePortfolio);

      // Fetch stock details and chart for selected symbol
      const details = await fetchStockDetails(selectedStock);
      setStockQuote(details);

      const chart = await fetchStockChart(selectedStock, timeframe);
      setCandles(chart);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Failed to load dashboard data:", err.message);
      // Fallback
      if (!portfolio) {
        setPortfolio(getMockPortfolio());
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData(false);
  }, [selectedStock, timeframe]);

  // Live polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStock, timeframe, portfolio]);

  const handleQuickTrade = async (type) => {
    const currentPrice = stockQuote ? stockQuote.price : 100;
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Execute in Sandbox mode
      setOrderLoading(true);
      setTimeout(() => {
        const storedGuest = localStorage.getItem('guestPortfolio') || JSON.stringify(getMockPortfolio());
        const guestData = JSON.parse(storedGuest);
        
        const totalCost = quickQty * currentPrice;
        const charges = 20.00 + (totalCost * 0.001); // flat 20 + 0.1% STT

        if (type === 'BUY') {
          if (guestData.profile.availableBalance < (totalCost + charges)) {
            alert("Insufficient virtual balance in Sandbox!");
            setOrderLoading(false);
            return;
          }
          // Deduct balance
          guestData.profile.availableBalance -= (totalCost + charges);
          // Add holding
          const holdingIndex = guestData.holdings.findIndex(h => h.symbol === selectedStock);
          if (holdingIndex >= 0) {
            const h = guestData.holdings[holdingIndex];
            const oldTotalCost = h.qty * h.avgPrice;
            const newQty = h.qty + quickQty;
            h.avgPrice = parseFloat(((oldTotalCost + totalCost) / newQty).toFixed(2));
            h.qty = newQty;
            h.currentPrice = currentPrice;
            h.currentValue = h.qty * currentPrice;
            h.pnl = h.currentValue - (h.qty * h.avgPrice);
            h.pnlPercent = parseFloat(((h.pnl / (h.qty * h.avgPrice)) * 100).toFixed(2));
          } else {
            guestData.holdings.push({
              symbol: selectedStock,
              name: stockQuote ? stockQuote.name : `${selectedStock} Ltd`,
              qty: quickQty,
              avgPrice: currentPrice,
              currentPrice: currentPrice,
              currentValue: quickQty * currentPrice,
              pnl: 0,
              pnlPercent: 0,
              exchange: "NSE"
            });
          }
        } else {
          // SELL
          const holdingIndex = guestData.holdings.findIndex(h => h.symbol === selectedStock);
          if (holdingIndex < 0 || guestData.holdings[holdingIndex].qty < quickQty) {
            alert("Insufficient shares to sell in Sandbox!");
            setOrderLoading(false);
            return;
          }
          const h = guestData.holdings[holdingIndex];
          guestData.profile.availableBalance += (totalCost - charges);
          h.qty -= quickQty;
          if (h.qty === 0) {
            guestData.holdings.splice(holdingIndex, 1);
          } else {
            h.currentPrice = currentPrice;
            h.currentValue = h.qty * currentPrice;
            h.pnl = h.currentValue - (h.qty * h.avgPrice);
            h.pnlPercent = parseFloat(((h.pnl / (h.qty * h.avgPrice)) * 100).toFixed(2));
          }
        }

        // Add order transaction
        const orderId = `ORD_${Math.floor(10000 + Math.random() * 90000)}`;
        guestData.orders.unshift({
          id: orderId,
          time: new Date().toISOString(),
          symbol: selectedStock,
          type: type,
          qty: quickQty,
          price: currentPrice,
          charges: charges,
          status: "COMPLETED",
          orderCategory: "MARKET"
        });

        // Recalculate portfolio total value
        let totalInvested = guestData.holdings.reduce((sum, h) => sum + (h.qty * h.avgPrice), 0);
        let currentHoldingsVal = guestData.holdings.reduce((sum, h) => sum + h.currentValue, 0);
        
        guestData.profile.totalInvestment = totalInvested;
        guestData.profile.currentPortfolioValue = currentHoldingsVal;
        guestData.profile.totalProfit = currentHoldingsVal - totalInvested;
        guestData.profile.totalProfitPercent = totalInvested > 0 ? parseFloat(((guestData.profile.totalProfit / totalInvested) * 100).toFixed(2)) : 0;
        
        localStorage.setItem('guestPortfolio', JSON.stringify(guestData));
        setPortfolio(guestData);
        setOrderLoading(false);
        alert(`Sandbox Order Executed: ${type} ${quickQty} shares of ${selectedStock}`);
        if (onOrderExecuted) onOrderExecuted();
      }, 500);

      return;
    }

    try {
      setOrderLoading(true);
      const res = await placeOrder(selectedStock, type, 'MARKET', quickQty, currentPrice);
      alert(res.message);
      await loadDashboardData(true);
      if (onOrderExecuted) onOrderExecuted(res);
    } catch (err) {
      alert(err.message || "Order execution failed");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setActiveSideTab('Portfolio Overview');
  };

  // Render SVG Sparkline
  const renderSparkline = () => {
    if (candles.length === 0) return null;
    const prices = candles.map(c => c.close);
    const maxVal = Math.max(...prices);
    const minVal = Math.min(...prices);
    const range = maxVal - minVal || 1;
    const padding = 15;
    const height = 180;
    
    // Generate points
    const points = candles.map((c, index) => {
      const x = (index / (candles.length - 1)) * 340;
      const y = height - (((c.close - minVal) / range) * (height - padding * 2) + padding);
      return `${x},${y}`;
    }).join(' ');

    const lastCandle = candles[candles.length - 1];
    const isUp = lastCandle.close >= candles[0].close;
    const strokeColor = isUp ? '#10b981' : '#ef4444';

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 340 ${height}`}>
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Shaded Area */}
        <path
          d={`M 0,${height} L ${points} L 340,${height} Z`}
          fill="url(#chartGlow)"
        />

        {/* Glow Line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          points={points}
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />

        {/* Start Point Marker */}
        <circle cx="2" cy={height - (((prices[0] - minVal) / range) * (height - padding * 2) + padding)} r="4" fill={strokeColor} />
        {/* End Point Marker */}
        <circle cx="338" cy={height - (((prices[prices.length - 1] - minVal) / range) * (height - padding * 2) + padding)} r="5" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" className="animate-ping" />
        <circle cx="338" cy={height - (((prices[prices.length - 1] - minVal) / range) * (height - padding * 2) + padding)} r="4.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
      </svg>
    );
  };

  const getProfile = () => {
    return portfolio ? portfolio.profile : {
      name: "Guest Investor",
      availableBalance: 100000,
      totalInvestment: 0,
      currentPortfolioValue: 0,
      todaysProfit: 0,
      todaysProfitPercent: 0,
      totalProfit: 0,
      totalProfitPercent: 0
    };
  };

  const getHoldings = () => {
    return portfolio ? portfolio.holdings : [];
  };

  const getOrders = () => {
    return portfolio ? portfolio.orders : [];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-56 glass-card p-4 space-y-2 shrink-0 flex flex-row lg:flex-col justify-between lg:justify-start gap-2 overflow-x-auto lg:overflow-x-visible">
        {[
          { id: 'Portfolio Overview', label: 'Portfolio Overview', icon: LayoutDashboard },
          { id: 'Watchlist', label: 'Watchlist', icon: Eye },
          { id: 'Analytics', label: 'Allocation & Heatmap', icon: PieChart },
          { id: 'Activity', label: 'Activity Logs', icon: Activity },
          { id: 'Settings', label: 'Settings', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSideTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${
                activeSideTab === item.id
                  ? 'bg-blue-600/20 border border-blue-500/40 text-cyan-300 shadow-md shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="hidden lg:block pt-6 border-t border-white/5 mt-auto text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
            <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Loading Indicator */}
        {loading && !portfolio && (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-semibold">Loading dashboard terminal...</p>
          </div>
        )}

        {/* 1. Portfolio Overview */}
        {activeSideTab === 'Portfolio Overview' && portfolio && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Owned Stocks list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Owned Holdings</h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold">Qty: {getHoldings().length} Stocks</span>
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {getHoldings().length === 0 ? (
                  <div className="glass-card p-8 text-center text-xs text-slate-500">
                    No active holdings. Buy some shares using the action buttons to see your portfolio grow!
                  </div>
                ) : (
                  getHoldings().map((stock) => {
                    const isSelected = selectedStock === stock.symbol;
                    const isProfitable = stock.pnl >= 0;
                    return (
                      <Card3D
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock.symbol)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer block ${
                          isSelected
                            ? 'bg-slate-900/90 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-extrabold text-white text-sm">{stock.symbol}</span>
                            <span className="text-[9px] block text-slate-400 font-semibold uppercase">{stock.exchange}</span>
                          </div>
                          <span className="text-[11px] text-slate-300 font-mono">{stock.qty} Shares</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-white/5 mt-3">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Avg Price</span>
                            <span className="text-slate-300 font-bold">{formatINR(stock.avgPrice)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Current LTP</span>
                            <span className="text-white font-black">{formatINR(stock.currentPrice)}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-baseline font-mono mt-1">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Current Value</span>
                            <span className="text-white font-extrabold">{formatINR(stock.currentValue)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Returns P&L</span>
                            <span className={`font-black flex items-center justify-end text-[11px] ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfitable ? '+' : ''}{formatINR(stock.pnl)}
                              <span className="text-[9px] font-bold ml-1">
                                ({isProfitable ? '+' : ''}{stock.pnlPercent}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      </Card3D>
                    );
                  })
                )}
              </div>
            </div>

            {/* Center Column: Price Chart */}
            <div className="glass-card p-5 space-y-4 bg-slate-950/20 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {selectedStock}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {stockQuote ? stockQuote.name : 'Indian Equity Ltd'}
                    </p>
                  </div>
                  
                  {stockQuote && (
                    <div className="text-right font-mono">
                      <div className="text-lg font-black text-white">{formatINR(stockQuote.price)}</div>
                      <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${stockQuote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stockQuote.change >= 0 ? '▲' : '▼'}
                        <span>{stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.change >= 0 ? '+' : ''}{stockQuote.changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Glowing Sparkline Line Chart */}
                <div className="relative w-full h-52 bg-slate-950/80 rounded-2xl border border-white/5 p-2 overflow-hidden flex items-center justify-center my-4">
                  {candles.length > 0 ? (
                    <div className="w-full h-full relative">
                      {renderSparkline()}
                      
                      {/* Trade markers overlaid inside chart */}
                      <div className="absolute top-6 left-8 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                        ▲ Buy Order
                      </div>
                      <div className="absolute bottom-10 left-1/3 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                        ▼ Sell Order
                      </div>
                      <div className="absolute top-12 right-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                        ▲ Buy Order
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Loading market ticker chart...</span>
                  )}
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-white/5">
                    {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-1 rounded font-bold text-[10px] transition-all ${
                          timeframe === tf 
                            ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fundamental Volume/High/Low stats */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-950/70 p-3 rounded-2xl border border-white/5 mt-4">
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-0.5">Volume</span>
                  <span className="text-white font-extrabold">
                    {stockQuote ? stockQuote.volume : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-0.5">Day's High</span>
                  <span className="text-emerald-400 font-extrabold">
                    {stockQuote ? formatINR(stockQuote.high) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-0.5">Day's Low</span>
                  <span className="text-rose-400 font-extrabold">
                    {stockQuote ? formatINR(stockQuote.low) : '—'}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Balance & Quick Actions */}
            <div className="space-y-6">
              
              {/* Balance Summary */}
              <Card3D className="p-5 bg-gradient-to-br from-emerald-600/30 via-emerald-800/20 to-teal-900/30 border border-emerald-500/20 rounded-3xl shadow-xl shadow-emerald-500/5">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Available Trading Balance</span>
                    <div className="text-3xl font-black font-mono text-white tracking-tight mt-1.5">
                      {formatINR(getProfile().availableBalance)}
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                      Includes welcome credits and simulated earnings
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Total Portfolio Value:</span>
                    <span className="text-white font-black text-sm">
                      {formatINR(getProfile().currentPortfolioValue)}
                    </span>
                  </div>
                </div>
              </Card3D>

              {/* Quick Actions Panel */}
              <div className="glass-card p-5 space-y-4 bg-slate-950/20 border border-white/10 rounded-3xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Trade Ticket</h3>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">{selectedStock}</span>
                </div>

                {/* Shares Size Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity Size</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 5, 10, 25, 50].map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setQuickQty(sz)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-extrabold transition-all border ${
                          quickQty === sz 
                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                            : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => handleQuickTrade('BUY')}
                    disabled={orderLoading || !stockQuote}
                    className="w-full btn-buy-green py-3.5 rounded-2xl font-extrabold text-xs text-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 active:scale-98 transition-transform uppercase tracking-wider"
                  >
                    {orderLoading ? (
                      <span className="w-4 h-4 border-2 border-black/25 border-t-black rounded-full animate-spin"></span>
                    ) : (
                      <span>BUY ↗</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleQuickTrade('SELL')}
                    disabled={orderLoading || !stockQuote}
                    className="w-full py-3.5 rounded-2xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-500 hover:shadow-blue-600/25 border border-blue-500/40 flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all uppercase tracking-wider"
                  >
                    {orderLoading ? (
                      <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span>SELL ↘</span>
                    )}
                  </button>
                </div>

                {stockQuote && (
                  <p className="text-[9px] text-slate-500 text-center font-mono mt-2">
                    Estimated trade value: {formatINR(quickQty * stockQuote.price)} + statutory fees
                  </p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 2. Watchlist View tab integration */}
        {activeSideTab === 'Watchlist' && (
          <WatchlistView onSelectStock={handleSelectStock} />
        )}

        {/* 3. Activity Logs */}
        {activeSideTab === 'Activity' && portfolio && (
          <div className="glass-card p-5 space-y-4 bg-slate-950/20 border border-white/10 rounded-3xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Logs</h3>
              <p className="text-xs text-slate-400">Past transactions and orders executed on this account</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest font-bold">
                    <th className="p-3">Time</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Action</th>
                    <th className="p-3 text-right">Shares</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Charges</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {getOrders().length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500">No executed orders logged yet.</td>
                    </tr>
                  ) : (
                    getOrders().slice(0, 10).map((ord) => {
                      const isBuy = ord.type === 'BUY';
                      return (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-slate-400">{new Date(ord.time).toLocaleString('en-IN')}</td>
                          <td className="p-3 font-bold text-cyan-400">{ord.id}</td>
                          <td className="p-3 font-sans font-black text-white">{ord.symbol}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                              isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {ord.type}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-200 font-bold">{ord.qty}</td>
                          <td className="p-3 text-right text-slate-200">₹{ord.price.toFixed(2)}</td>
                          <td className="p-3 text-right text-slate-500">₹{ord.charges.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="badge-status-completed">{ord.status}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Settings View */}
        {activeSideTab === 'Settings' && (
          <div className="glass-card p-6 space-y-6 bg-slate-950/20 border border-white/10 rounded-3xl max-w-2xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trading Sandbox Settings</h3>
              <p className="text-xs text-slate-400">Configure parameters for virtual trading simulation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-400 block font-bold">Default Trade Order Size</span>
                <input 
                  type="number" 
                  value={quickQty} 
                  onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full glass-input text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block font-bold">LTP Refresh Polling Interval</span>
                <select className="w-full glass-input text-white">
                  <option>4 Seconds (Real-Time)</option>
                  <option>10 Seconds (Conserves Data)</option>
                  <option>Manual Refresh Only</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <span className="text-slate-400 block font-bold">Trading System State</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-mono font-bold text-[10px]">
                    ONLINE
                  </span>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg font-mono font-bold text-[10px]">
                    YAHOO PROXY: ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-3">
              <button 
                onClick={() => {
                  localStorage.removeItem('guestPortfolio');
                  alert("Sandbox data reset successfully!");
                  loadDashboardData(false);
                }}
                className="py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                Reset Sandbox Portfolio
              </button>
            </div>
          </div>
        )}

        {/* 2.5 Analytics Tab */}
        {activeSideTab === 'Analytics' && (
          <div className="space-y-8 animate-[fadeInUp_0.4s_ease-out]">
            <div className="glass-card p-6 bg-slate-950/20 border border-white/10 rounded-3xl">
              <Donut3DChart holdings={getHoldings()} />
            </div>
            <div className="glass-card p-6 bg-slate-950/20 border border-white/10 rounded-3xl">
              <MarketHeatmap3D />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
