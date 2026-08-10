import React, { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Eye, Plus, Search } from 'lucide-react';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist, fetchStocksList } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';
import { Card3D } from '../common/Card3D.jsx';

export const WatchlistView = ({ onSelectStock }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allStocks, setAllStocks] = useState([]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const list = await fetchWatchlist();
      setWatchlist(list);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const loadAllStocks = async () => {
    try {
      const list = await fetchStocksList();
      setAllStocks(list);
    } catch (err) {
      console.warn("Failed to prefetch stock database for search autocomplete");
    }
  };

  useEffect(() => {
    loadWatchlist();
    loadAllStocks();
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 0) {
      const filtered = allStocks.filter(s => 
        s.symbol.toLowerCase().includes(q.toLowerCase()) ||
        s.name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddStock = async (symbol) => {
    try {
      await addToWatchlist(symbol);
      setSearchQuery('');
      setSearchResults([]);
      await loadWatchlist();
    } catch (err) {
      alert(err.message || 'Failed to add to watchlist');
    }
  };

  const handleRemoveStock = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      await loadWatchlist();
    } catch (err) {
      alert(err.message || 'Failed to remove from watchlist');
    }
  };

  if (loading && watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Loading your personalized watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto my-10 space-y-4">
        <h3 className="text-lg font-bold text-rose-400">🔒 Login Required</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must be logged in to view and modify your database stock watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Watchlist
          </h2>
          <p className="text-xs text-slate-400">Monitor and quickly buy your favorite Indian companies</p>
        </div>

        {/* Watchlist Symbol Search Add Box */}
        <div className="relative w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol to add (e.g. TCS, INFY)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full glass-input pl-10 text-xs text-white"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 divide-y divide-white/5">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleAddStock(stock.symbol)}
                  className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <span className="font-extrabold text-white">{stock.symbol}</span>
                    <span className="text-slate-400 ml-2 font-medium">{stock.name}</span>
                  </div>
                  <Plus className="w-4 h-4 text-cyan-400 hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 text-xs font-semibold max-w-md mx-auto space-y-4">
          <p>Your watchlist is currently empty.</p>
          <p className="text-[11px] font-normal text-slate-500">
            Use the search box above to add stocks and keep track of daily market changes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.map((stock) => {
            const isUp = stock.change >= 0;
            return (
              <Card3D 
                key={stock.symbol} 
                className="p-5 relative border border-white/5 hover:border-cyan-400/20 group transition-all flex flex-col justify-between"
                onClick={() => onSelectStock(stock.symbol)}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-extrabold text-white tracking-tight">{stock.symbol}</span>
                      <span className="badge-exchange text-[9px]">{stock.exchange || 'NSE'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{stock.name}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveStock(stock.symbol)}
                    className="p-1.5 rounded-lg border border-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price and Action Grid */}
                <div className="flex justify-between items-end mt-6">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Live Price</span>
                    <div className="text-xl font-black font-mono text-white tracking-tight mt-0.5">
                      {formatINR(stock.price)}
                    </div>
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectStock(stock.symbol)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold rounded-xl text-xs hover:scale-102 hover:shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wider"
                  >
                    Trade
                  </button>
                </div>
              </Card3D>
            );
          })}
        </div>
      )}

    </div>
  );
};
