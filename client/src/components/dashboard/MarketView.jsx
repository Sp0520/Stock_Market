import React, { useState, useEffect } from 'react';
import { Card3D } from '../common/Card3D.jsx';
import { fetchStocksList, fetchMarketIndices, fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';
import { Search, TrendingUp, TrendingDown, Eye, EyeOff, Activity, SlidersHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MarketView = ({ onSelectStock }) => {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('ALL'); // ALL, NSE, BSE
  const [sectorFilter, setSectorFilter] = useState('ALL'); // ALL, IT, Financials, etc.
  const [performanceFilter, setPerformanceFilter] = useState('ALL'); // ALL, GAINERS, LOSERS
  const [watchlistStatus, setWatchlistStatus] = useState({});

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true);
        const [stocksData, indicesData] = await Promise.all([
          fetchStocksList(),
          fetchMarketIndices()
        ]);
        setStocks(stocksData);
        setIndices(indicesData);

        // Try load watchlist if token is active
        const token = localStorage.getItem('authToken');
        if (token) {
          const wl = await fetchWatchlist();
          setWatchlist(wl);
          const wlMap = {};
          wl.forEach(item => {
            wlMap[item.symbol] = true;
          });
          setWatchlistStatus(wlMap);
        }
      } catch (err) {
        console.error("Failed loading market browser data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMarketData();

    // Poll for live tick updates
    const timer = setInterval(async () => {
      try {
        const [stocksData, indicesData] = await Promise.all([
          fetchStocksList(),
          fetchMarketIndices()
        ]);
        setStocks(stocksData);
        setIndices(indicesData);
      } catch (err) {
        // fail silently during ticks
      }
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleWatchlistToggle = async (e, symbol) => {
    e.stopPropagation(); // prevent card click triggers
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to manage your watchlist.");
      return;
    }

    try {
      if (watchlistStatus[symbol]) {
        await removeFromWatchlist(symbol);
        setWatchlistStatus(prev => ({ ...prev, [symbol]: false }));
      } else {
        await addToWatchlist(symbol);
        setWatchlistStatus(prev => ({ ...prev, [symbol]: true }));
      }
    } catch (err) {
      console.warn("Watchlist toggle failed:", err.message);
    }
  };

  // Get unique list of sectors
  const sectorsList = ['ALL', ...new Set(stocks.map(s => {
    if (s.sector.includes('Information Technology') || s.sector.includes('IT')) return 'IT';
    if (s.sector.includes('Financial Services') || s.sector.includes('Banking')) return 'Banking';
    if (s.sector.includes('Pharmaceuticals') || s.sector.includes('Pharma')) return 'Pharma';
    if (s.sector.includes('Metals') || s.sector.includes('Mining')) return 'Metals';
    return s.sector.split(' / ')[0];
  }))];

  // Filters
  const filteredStocks = stocks.filter(s => {
    // Search filter
    const matchesSearch = s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Exchange filter
    const matchesExchange = exchangeFilter === 'ALL' || s.exchange === exchangeFilter;

    // Sector filter
    let matchesSector = true;
    if (sectorFilter !== 'ALL') {
      const normalizedSector = s.sector.toLowerCase();
      if (sectorFilter === 'IT') {
        matchesSector = normalizedSector.includes('it') || normalizedSector.includes('information technology');
      } else if (sectorFilter === 'Banking') {
        matchesSector = normalizedSector.includes('financial') || normalizedSector.includes('banking');
      } else if (sectorFilter === 'Pharma') {
        matchesSector = normalizedSector.includes('pharma') || normalizedSector.includes('health');
      } else if (sectorFilter === 'Metals') {
        matchesSector = normalizedSector.includes('metal') || normalizedSector.includes('mining');
      } else {
        matchesSector = normalizedSector.includes(sectorFilter.toLowerCase());
      }
    }

    // Performance filter
    let matchesPerformance = true;
    if (performanceFilter === 'GAINERS') {
      matchesPerformance = s.change >= 0;
    } else if (performanceFilter === 'LOSERS') {
      matchesPerformance = s.change < 0;
    }

    return matchesSearch && matchesExchange && matchesSector && matchesPerformance;
  });

  return (
    <div className="space-y-6">
      
      {/* Indices Bar */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Indian Market Indices
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-1">
          {indices.slice(0, 10).map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <Card3D 
                key={idx.symbol}
                className={`p-4 rounded-2xl border transition-all ${
                  isPos 
                    ? 'border-emerald-500/10 hover:border-emerald-500/30 bg-slate-900/60' 
                    : 'border-rose-500/10 hover:border-rose-500/30 bg-slate-900/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-white text-xs tracking-tight">{idx.symbol}</span>
                    <span className="text-[8.5px] block text-slate-400 font-semibold uppercase">{idx.exchange}</span>
                  </div>
                  <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded ${
                    isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
                
                <div className="mt-3 font-mono">
                  <div className="text-sm font-black text-white">{formatINR(idx.price)}</div>
                  <div className={`text-[9px] font-semibold flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{idx.change.toFixed(2)}
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-5 space-y-4 bg-slate-950/20 border border-white/5 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Symbol, Company Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 py-2.5 text-xs text-white"
            />
          </div>

          {/* Filters summary count */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Showing <strong className="text-white font-bold font-mono">{filteredStocks.length}</strong> matching assets</span>
          </div>

        </div>

        <div className="flex flex-wrap gap-3 items-center text-xs">
          {/* Exchange Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-white/5">
            {['ALL', 'NSE', 'BSE'].map(ex => (
              <button
                key={ex}
                onClick={() => setExchangeFilter(ex)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  exchangeFilter === ex 
                    ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Performance Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-white/5">
            {[
              { id: 'ALL', label: 'All Movers' },
              { id: 'GAINERS', label: 'Gainers ▲' },
              { id: 'LOSERS', label: 'Losers ▼' }
            ].map(perf => (
              <button
                key={perf.id}
                onClick={() => setPerformanceFilter(perf.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  performanceFilter === perf.id 
                    ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {perf.label}
              </button>
            ))}
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/70 py-1 px-2.5 rounded-xl border border-white/5">
            <span className="text-slate-500 font-bold text-[10px] uppercase">Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-transparent text-white font-bold text-[10px] outline-none cursor-pointer"
            >
              {sectorsList.map(sec => (
                <option key={sec} value={sec} className="bg-slate-950 text-white">
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Stocks Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 text-xs">
          No equities found matching the active search and filter options. Try resetting parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => {
            const isUp = stock.change >= 0;
            const isWatchlisted = watchlistStatus[stock.symbol];
            
            // Calculate 52w high/low relative position percent
            const low = stock.fiftyTwoLow || (stock.price * 0.8);
            const high = stock.fiftyTwoHigh || (stock.price * 1.2);
            const range = high - low;
            const currentPositionPercent = range > 0 ? Math.min(100, Math.max(0, ((stock.price - low) / range) * 100)) : 50;

            return (
              <Card3D
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isUp 
                    ? 'border-emerald-500/10 hover:border-emerald-400/40 bg-gradient-to-br from-slate-900/60 to-emerald-950/5' 
                    : 'border-rose-500/10 hover:border-rose-400/40 bg-gradient-to-br from-slate-900/60 to-rose-950/5'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm tracking-tight">{stock.symbol}</span>
                        <span className="badge-exchange text-[9px]">{stock.exchange}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px] mt-0.5">{stock.name}</p>
                    </div>

                    <button
                      onClick={(e) => handleWatchlistToggle(e, stock.symbol)}
                      className={`p-2 rounded-xl border transition-all ${
                        isWatchlisted
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {isWatchlisted ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="mt-3.5 flex justify-between items-baseline border-b border-white/5 pb-3">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Last Traded Price</span>
                    <div className="text-right font-mono">
                      <div className="text-base font-black text-white">{formatINR(stock.price)}</div>
                      <div className={`text-[10px] font-extrabold flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 52-week High/Low Range bar */}
                  <div className="py-3.5 space-y-1.5">
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
                      <span>52W L: {formatINR(low)}</span>
                      <span>52W H: {formatINR(high)}</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full absolute left-0 top-0 transition-all duration-500 ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{ width: `${currentPositionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-white/5 pt-3">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold mb-0.5">Market Cap</span>
                    <span className="text-white font-extrabold">{stock.marketCap}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block uppercase font-bold mb-0.5">P/E Ratio</span>
                    <span className="text-white font-extrabold">{stock.peRatio || '—'}</span>
                  </div>
                </div>

              </Card3D>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MarketView;
