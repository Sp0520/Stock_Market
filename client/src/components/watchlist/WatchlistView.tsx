import React, { useState } from 'react';
import { Bookmark, Star, Bell, Plus } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ onSelectStock }) => {
  const [activeWatchlist, setActiveWatchlist] = useState<string>('Nifty Bluechips');

  const watchlists = [
    {
      name: "Nifty Bluechips",
      stocks: [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd", price: 3012.45, change: 45.80, changePercent: 1.54, exchange: "NSE" },
        { symbol: "TCS", name: "Tata Consultancy Services Ltd", price: 4285.30, change: -28.40, changePercent: -0.66, exchange: "NSE" },
        { symbol: "INFY", name: "Infosys Limited", price: 1874.50, change: 32.10, changePercent: 1.74, exchange: "NSE" },
        { symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1642.15, change: 14.85, changePercent: 0.91, exchange: "NSE" },
        { symbol: "ICICIBANK", name: "ICICI Bank Limited", price: 1215.80, change: 18.60, changePercent: 1.55, exchange: "NSE" },
        { symbol: "LT", name: "Larsen & Toubro Ltd", price: 3680.00, change: 52.40, changePercent: 1.44, exchange: "NSE" }
      ]
    },
    {
      name: "High Growth & Tech",
      stocks: [
        { symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", price: 268.40, change: 8.90, changePercent: 3.43, exchange: "NSE" },
        { symbol: "PAYTM", name: "One97 Communications Ltd", price: 785.10, change: 24.60, changePercent: 3.23, exchange: "NSE" },
        { symbol: "SWIGGY", name: "Swiggy Limited", price: 492.75, change: 14.25, changePercent: 2.98, exchange: "NSE" },
        { symbol: "HAL", name: "Hindustan Aeronautics Ltd", price: 4620.00, change: 112.50, changePercent: 2.50, exchange: "NSE" },
        { symbol: "BEL", name: "Bharat Electronics Ltd", price: 295.40, change: 6.80, changePercent: 2.35, exchange: "NSE" },
        { symbol: "IRCTC", name: "Indian Railway Catering", price: 935.40, change: 11.80, changePercent: 1.28, exchange: "NSE" }
      ]
    }
  ];

  const currentList = watchlists.find(w => w.name === activeWatchlist) || watchlists[0];

  return (
    <div className="space-y-6">
      
      {/* Watchlist Tabs & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {watchlists.map((wl) => (
            <button
              key={wl.name}
              onClick={() => setActiveWatchlist(wl.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeWatchlist === wl.name
                  ? 'gradient-btn text-black shadow-md'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              ⭐ {wl.name} ({wl.stocks.length})
            </button>
          ))}
        </div>

        <button className="gradient-btn py-2 px-4 text-xs font-bold">
          <Plus className="w-4 h-4" /> Create New Watchlist
        </button>
      </div>

      {/* Stocks Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            {currentList.name}
          </h3>
          <span className="text-xs text-slate-400">Real-time NSE / BSE Feed</span>
        </div>

        <div className="divide-y divide-white/5">
          {currentList.stocks.map((stock) => {
            const isPos = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{stock.symbol}</span>
                      <span className="badge-exchange">{stock.exchange}</span>
                    </div>
                    <p className="text-xs text-slate-400">{stock.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono text-white">{formatINR(stock.price)}</div>
                    <div className={isPos ? "text-xs text-emerald-400 font-semibold" : "text-xs text-rose-400 font-semibold"}>
                      {formatINR(stock.change, { showSign: true })} ({formatPercent(stock.changePercent)})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Price alert configured for ${stock.symbol} at ${formatINR(stock.price * 1.05)}`);
                      }}
                      className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-cyan-300 hover:bg-white/5"
                      title="Set Price Alert"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(stock.symbol);
                      }}
                      className="gradient-btn-green text-xs py-1.5 px-3 rounded-lg font-bold"
                    >
                      Buy / Sell
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
