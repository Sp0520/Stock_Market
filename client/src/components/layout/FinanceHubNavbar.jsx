import React, { useState } from 'react';
import { Search, Bell, Menu, X, ShieldCheck, ChevronRight, Wallet } from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export const FinanceHubNavbar = ({
  activeTab,
  setActiveTab,
  onSelectStock,
  availableBalance,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sampleSearchItems = [
    { type: 'STOCK', symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2455.70, change: 0.85, exchange: "NSE" },
    { type: 'STOCK', symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3410.90, change: 1.20, exchange: "NSE" },
    { type: 'STOCK', symbol: "INFY", name: "Infosys Limited", price: 1874.50, change: 1.74, exchange: "NSE" },
    { type: 'STOCK', symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1642.15, change: 0.91, exchange: "NSE" },
    { type: 'STOCK', symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", price: 268.40, change: 3.43, exchange: "NSE" },
    { type: 'IPO', symbol: "NTPCGREEN", name: "NTPC Green Energy IPO", price: 108.00, change: 13.0, exchange: "IPO" },
    { type: 'MF', symbol: "PPFAS", name: "Parag Parikh Flexi Cap Fund", price: 88.25, change: 0.62, exchange: "AMFI" },
    { type: 'MF', symbol: "SBI-NIFTY", name: "SBI Nifty 50 Index Fund", price: 218.45, change: 0.54, exchange: "AMFI" }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.trim().length > 0);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'markets', label: 'Markets' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'ipo', label: 'IPO' },
    { id: 'mutual-funds', label: 'Mutual Funds' },
    { id: 'sip', label: 'SIP' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'orders', label: 'Orders' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'news', label: 'News' },
    { id: 'admin', label: 'Admin' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 md:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="brand-font text-lg md:text-xl font-black text-white tracking-tight">
            Fin<span className="text-cyan-400">Nexa</span>
          </span>
        </div>

        {/* Search Bar (Desktop & Tablet) */}
        <div className="relative flex-1 max-w-sm lg:max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Indian Stocks, IPOs, Mutual Funds..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 max-h-80 overflow-y-auto">
              {sampleSearchItems
                .filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      if (item.type === 'STOCK') {
                        onSelectStock(item.symbol);
                        setActiveTab('stocks');
                      } else if (item.type === 'IPO') {
                        setActiveTab('ipo');
                      } else {
                        setActiveTab('mutual-funds');
                      }
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.symbol}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/10">
                          {item.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.name}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-semibold text-white">{formatINR(item.price)}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">+{item.change}%</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-bold text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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

        {/* Right Section: Balance, Notification, User & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Available Balance Pill */}
          <div 
            onClick={() => handleNavClick('portfolio')}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/30 cursor-pointer transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-right">
              <span className="hidden xs:inline text-[9px] text-slate-400 uppercase font-mono leading-none">Wallet</span>
              <span className="text-[11px] sm:text-xs font-bold font-mono text-emerald-400 leading-tight whitespace-nowrap">
                {formatINR(availableBalance)}
              </span>
            </div>
          </div>

          <button 
            onClick={() => handleNavClick('news')}
            className="p-1.5 sm:p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 relative"
            title="Market News"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-2 cursor-pointer"
            title="Profile & KYC"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 border border-white/20 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
              {currentUser ? (currentUser.firstname?.[0] || 'U') : 'IN'}
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* MOBILE / TABLET SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[53px] sm:top-[57px] bottom-0 bg-[#05070D]/95 backdrop-blur-2xl border-t border-white/10 z-50 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Search */}
          <div className="sm:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Stocks, IPOs, Mutual Funds..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {showDropdown && (
              <div className="mt-2 glass-panel border border-cyan-500/30 rounded-2xl p-2 shadow-2xl max-h-60 overflow-y-auto">
                {sampleSearchItems
                  .filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <div
                      key={item.symbol}
                      onClick={() => {
                        if (item.type === 'STOCK') {
                          onSelectStock(item.symbol);
                          setActiveTab('stocks');
                        } else if (item.type === 'IPO') {
                          setActiveTab('ipo');
                        } else {
                          setActiveTab('mutual-funds');
                        }
                        setShowDropdown(false);
                        setSearchQuery('');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{item.symbol}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/10">
                            {item.exchange}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.name}</p>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs font-semibold text-white">{formatINR(item.price)}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">+{item.change}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`p-3 sm:p-3.5 rounded-xl text-left transition-all flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>

          {/* Quick Account Info */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Available Wallet:</span>
              <span className="text-emerald-400 font-bold">{formatINR(availableBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">KYC Status:</span>
              <span className="text-cyan-400 font-bold">VERIFIED</span>
            </div>
          </div>

        </div>
      )}

    </header>
  );
};
