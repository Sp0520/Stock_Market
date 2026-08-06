import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';
import type { MarketIndex } from '../../services/api';

interface NavbarProps {
  indices: MarketIndex[];
  onSelectStock: (symbol: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  indices,
  onSelectStock,
  setActiveTab,
  availableBalance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const sampleStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd", price: 3012.45, change: 1.54, exchange: "NSE" },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd", price: 4285.30, change: -0.66, exchange: "NSE" },
    { symbol: "INFY", name: "Infosys Limited", price: 1874.50, change: 1.74, exchange: "NSE" },
    { symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1642.15, change: 0.91, exchange: "NSE" },
    { symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", price: 268.40, change: 3.43, exchange: "NSE" },
    { symbol: "HAL", name: "Hindustan Aeronautics Ltd", price: 4620.00, change: 2.50, exchange: "NSE" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", price: 1048.50, change: 2.15, exchange: "NSE" }
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      setSearchResults(
        sampleStocks.filter(
          s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        )
      );
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        
        {/* Logo & 3D Rotating Candlestick Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-cyan-500/30 group-hover:rotate-12 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="brand-font text-xl font-extrabold text-white tracking-tight">GROWW<span className="gradient-text">TRADE 3D</span></span>
              <span className="badge-exchange text-[10px]">NSE / BSE</span>
            </div>
            <p className="text-[11px] text-slate-400">Fintech Command Center</p>
          </div>
        </div>

        {/* Live Indices Ticker Tape */}
        <div className="hidden xl:flex items-center gap-6 bg-slate-950/80 border border-white/5 rounded-2xl px-5 py-2 overflow-x-auto">
          {indices.slice(0, 3).map((idx) => (
            <div key={idx.symbol} className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-300">{idx.symbol}</span>
              <span className="font-mono text-white font-medium">{idx.price.toLocaleString('en-IN')}</span>
              <span className={idx.change >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                {formatPercent(idx.changePercent)}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE FEED
          </div>
        </div>

        {/* Search Input with 3D Depressed Glass Effect */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search NSE / BSE Stocks (e.g. RELIANCE, TCS, ZOMATO)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input-3d pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{stock.symbol}</span>
                        <span className="badge-exchange">{stock.exchange}</span>
                      </div>
                      <p className="text-xs text-slate-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold font-mono text-white">{formatINR(stock.price)}</div>
                      <div className={stock.change >= 0 ? "text-xs text-emerald-400 font-semibold" : "text-xs text-rose-400 font-semibold"}>
                        {formatPercent(stock.change)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching Indian stock found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Balance & Actions */}
        <div className="flex items-center gap-4">
          
          <div 
            onClick={() => setActiveTab('funds')}
            className="hidden md:flex flex-col items-end cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl transition-colors"
          >
            <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">Available Funds</span>
            <span className="text-sm font-bold text-white font-mono">{formatINR(availableBalance)}</span>
          </div>

          <button 
            onClick={() => setActiveTab('news')}
            className="p-2.5 rounded-xl border border-white/10 hover:border-cyan-400/50 hover:bg-white/5 text-slate-300 relative transition-all"
            title="Notifications & Market News"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff] animate-ping"></span>
          </button>

          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 cursor-pointer border border-white/10 hover:border-emerald-400/40 p-1.5 pr-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs shadow-md">
              RS
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Rahul Sharma <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400">KYC Verified</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
