import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface FinanceHubNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectStock: (symbol: string) => void;
  availableBalance: number;
}

export const FinanceHubNavbar: React.FC<FinanceHubNavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectStock,
  availableBalance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const sampleStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2455.70, change: 0.85, exchange: "NSE" },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3410.90, change: 1.20, exchange: "NSE" },
    { symbol: "INFY", name: "Infosys Limited", price: 1874.50, change: 1.74, exchange: "NSE" },
    { symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1642.15, change: 0.91, exchange: "NSE" },
    { symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", price: 268.40, change: 3.43, exchange: "NSE" }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.trim().length > 0);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        
        {/* Brand Logo - FINANCE.hub */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            f
          </div>
          <span className="brand-font text-xl font-extrabold text-white tracking-tight">
            FINANCE<span className="text-cyan-400">.hub</span>
          </span>
        </div>

        {/* Pill Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search RELIANCE, TCS, Stocks..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pill-search text-xs text-white placeholder-slate-500"
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 max-h-80 overflow-y-auto">
              {sampleStocks
                .filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((stock) => (
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
                    <div className="text-right font-mono">
                      <div className="text-sm font-semibold text-white">{formatINR(stock.price)}</div>
                      <div className="text-xs text-emerald-400 font-semibold">+{stock.change}%</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'watchlist', label: 'Watchlist' },
            { id: 'markets', label: 'Markets' },
            { id: 'news', label: 'News' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'orders', label: 'Transactions' },
            { id: 'ai', label: 'AI Insights' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors py-1 relative ${
                activeTab === item.id ? 'text-white font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00d4ff]"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Balance & Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Available</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{formatINR(availableBalance)}</span>
          </div>

          <button 
            onClick={() => setActiveTab('news')}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </button>

          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 border border-white/20 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
              RS
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
