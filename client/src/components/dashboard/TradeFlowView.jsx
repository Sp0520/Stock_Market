import React, { useState } from 'react';

export const TradeFlowView = ({ onOrderExecuted }) => {
  const [activeSideTab, setActiveSideTab] = useState('Portfolio Overview');
  const [selectedStock, setSelectedStock] = useState('TCS');

  const selectedSymbol = selectedStock;

  const handleQuickTrade = (type) => {
    onOrderExecuted({
      symbol: selectedSymbol,
      exchange: "NSE",
      type: type,
      orderCategory: "MARKET",
      qty: 10,
      price: selectedSymbol === 'TCS' ? 3745.20 : 2910.50,
      charges: 25.00,
      estimatedTotalAmount: selectedSymbol === 'TCS' ? 37477.00 : 29130.00
    });
  };

  return (
    <div className="flex gap-6">
      
      <div className="w-56 glass-card p-4 space-y-2 shrink-0">
        {[
          { id: 'Portfolio Overview', label: 'Portfolio Overview' },
          { id: 'Watchlist', label: 'Watchlist' },
          { id: 'Activity', label: 'Activity' },
          { id: 'Settings', label: 'Settings' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSideTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${
              activeSideTab === item.id
                ? 'bg-blue-600/30 border border-blue-500/50 text-cyan-300 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Owned Stocks</h3>

          <div className="space-y-3">
            
            <div
              onClick={() => setSelectedStock('TCS')}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                selectedStock === 'TCS'
                  ? 'bg-slate-900 border-cyan-400 shadow-lg'
                  : 'bg-slate-950/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-extrabold text-white text-sm">TCS</span>
                <span className="text-[11px] text-slate-400">120 shares</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg Price</span>
                  <span className="text-white">₹3,550.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Current</span>
                  <span className="text-white font-bold">₹3,745.20</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Value</span>
                  <span className="text-white font-bold">₹4,49,424.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">P/L</span>
                  <span className="text-emerald-400 font-bold">+₹23,424.00 | +5.5%</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedStock('RELIANCE')}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                selectedStock === 'RELIANCE'
                  ? 'bg-slate-900 border-cyan-400 shadow-lg'
                  : 'bg-slate-950/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-extrabold text-white text-sm">RELIANCE</span>
                <span className="text-[11px] text-slate-400">85 shares</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg Price</span>
                  <span className="text-white">₹2,820.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Current</span>
                  <span className="text-white font-bold">₹2,910.50</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Value</span>
                  <span className="text-white font-bold">₹2,47,392.50</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">P/L</span>
                  <span className="text-emerald-400 font-bold">+₹7,692.50 | +3.2%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white">{selectedSymbol}</h3>
              <p className="text-xs text-slate-400 font-medium">TATA CONSULTANCY SERVICES</p>
            </div>
            <select className="glass-input py-1 text-xs text-white">
              <option className="bg-slate-900">Last 30 days</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price</span>
            <div className="text-2xl font-extrabold font-mono text-white">
              {selectedSymbol === 'TCS' ? '₹3,745.20' : '₹2,910.50'}
            </div>
          </div>

          <div className="relative w-full h-52 bg-slate-950/80 rounded-xl border border-white/5 p-3 overflow-hidden flex items-center justify-center">
            
            <div className="absolute top-8 left-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 p-1 rounded-full text-[9px] font-bold animate-pulse">
              ▲ Buy
            </div>
            <div className="absolute bottom-12 left-1/3 bg-rose-500/20 text-rose-400 border border-rose-500/40 p-1 rounded-full text-[9px] font-bold animate-pulse">
              ▼ Sell
            </div>
            <div className="absolute top-12 left-2/3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 p-1 rounded-full text-[9px] font-bold animate-pulse">
              ▲ Buy
            </div>

            <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none" className="overflow-visible">
              <path
                d="M 0 80 Q 50 20, 100 60 T 200 40 T 300 20"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="3"
                className="drop-shadow-[0_0_10px_#00d4ff]"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <div className="flex items-center gap-1">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    tf === '1M' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block">Volume</span>
              <span className="text-white font-bold">2.1M</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Day's High</span>
              <span className="text-emerald-400 font-bold">₹3,760.00</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Low</span>
              <span className="text-rose-400 font-bold">₹3,680.00</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance & Actions</h3>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white space-y-2 shadow-xl shadow-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">Available Balance</span>
              <div className="text-3xl font-extrabold font-mono tracking-tight">₹60,123.30</div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Portfolio Value:</span>
              <span className="text-white font-extrabold text-base">₹7,56,940.00</span>
            </div>
          </div>

          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleQuickTrade('BUY')}
                className="btn-buy-green py-3.5 rounded-xl font-extrabold text-sm text-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>➕ BUY ↗</span>
              </button>
              <button
                onClick={() => handleQuickTrade('SELL')}
                className="gradient-btn py-3.5 rounded-xl font-extrabold text-sm text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <span>🔀 SELL ↘</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
