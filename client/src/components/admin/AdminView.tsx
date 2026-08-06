import React, { useState } from 'react';
import { ShieldAlert, Power, Plus } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [marketSessionOpen, setMarketSessionOpen] = useState<boolean>(true);

  const stats = {
    totalUsers: 142850,
    activeTradersToday: 38420,
    totalOrdersExecuted: 1894200,
    dailyTurnover: "₹4,250.80 Cr",
    systemStatus: "ALL SYSTEMS OPERATIONAL (NSE/BSE FEED OK)"
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Control Banner */}
      <div className="glass-card p-6 border-l-4 border-rose-500 bg-rose-950/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">System Admin & Market Control Panel</h2>
            <p className="text-xs text-slate-300">Manage Indian Stock Feed, User Accounts, Orders & IPO Listings.</p>
          </div>
        </div>

        <button 
          onClick={() => setMarketSessionOpen(!marketSessionOpen)}
          className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            marketSessionOpen ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          Market Session: {marketSessionOpen ? 'OPEN (NSE/BSE LIVE)' : 'CLOSED'}
        </button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Registered Investors</span>
          <div className="text-2xl font-extrabold font-mono text-white">{stats.totalUsers.toLocaleString('en-IN')}</div>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Traders Today</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-300">{stats.activeTradersToday.toLocaleString('en-IN')}</div>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Orders Executed Today</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{stats.totalOrdersExecuted.toLocaleString('en-IN')}</div>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Daily Turnover (NSE/BSE)</span>
          <div className="text-2xl font-extrabold font-mono text-purple-300">{stats.dailyTurnover}</div>
        </div>
      </div>

      {/* Quick Action Tools */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
          Admin Operations & Catalog Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => alert("Added new NSE stock listing modal.")}
            className="glass-card p-4 hover:border-cyan-400 text-left space-y-1 transition-all"
          >
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Add New NSE/BSE Stock Listing
            </div>
            <p className="text-xs text-slate-400">Add ticker symbol, fundamental ratios & circuit limits.</p>
          </button>

          <button 
            onClick={() => alert("Opened IPO listing manager.")}
            className="glass-card p-4 hover:border-emerald-400 text-left space-y-1 transition-all"
          >
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Launch New IPO Listing
            </div>
            <p className="text-xs text-slate-400">Configure issue price band, GMP, and lot size.</p>
          </button>

          <button 
            onClick={() => alert("Generated SEBI compliance audit report.")}
            className="glass-card p-4 hover:border-purple-400 text-left space-y-1 transition-all"
          >
            <div className="text-sm font-bold text-white flex items-center gap-2">
              📜 SEBI Audit & Regulatory Log
            </div>
            <p className="text-xs text-slate-400">Export transaction audit trails and trade logs.</p>
          </button>
        </div>
      </div>

    </div>
  );
};
