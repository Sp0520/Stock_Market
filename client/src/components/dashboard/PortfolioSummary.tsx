import React from 'react';
import { Wallet, PieChart, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';

interface PortfolioSummaryProps {
  portfolio: any;
  onDepositClick: () => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio, onDepositClick }) => {
  const profile = portfolio?.profile || {
    currentPortfolioValue: 1245680.50,
    todaysProfit: 18250.00,
    todaysProfitPercent: 1.56,
    totalInvestment: 1050000.00,
    totalProfit: 195680.50,
    availableBalance: 125000.00,
    buyingPower: 250000.00,
    marginUsed: 45000.00
  };

  const isTodayProfitPositive = profile.todaysProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* Portfolio Value Card */}
      <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Portfolio Value</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
          {formatINR(profile.currentPortfolioValue)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Investment</span>
          <span className="font-mono font-medium text-slate-200">{formatINR(profile.totalInvestment)}</span>
        </div>
      </div>

      {/* Today's Profit / Loss Card */}
      <div className="glass-card p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all ${isTodayProfitPositive ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Today's Profit / Loss</span>
          <div className={`p-2 rounded-xl border ${isTodayProfitPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {isTodayProfitPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>
        <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${isTodayProfitPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatINR(profile.todaysProfit, { showSign: true })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Day Return %</span>
          <span className={isTodayProfitPositive ? "badge-gain" : "badge-loss"}>
            {formatPercent(profile.todaysProfitPercent)}
          </span>
        </div>
      </div>

      {/* Available Balance Card */}
      <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Available Funds</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
          {formatINR(profile.availableBalance)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <button 
            onClick={onDepositClick}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
          >
            + Add Funds via UPI
          </button>
          <span className="text-slate-400 font-mono">Buying Power: {formatINR(profile.buyingPower, { compact: true })}</span>
        </div>
      </div>

      {/* Total Returns Card */}
      <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Overall Returns</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
          {formatINR(profile.totalProfit, { showSign: true })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total CAGR / Return</span>
          <span className="badge-gain">
            {formatPercent(profile.totalProfitPercent)}
          </span>
        </div>
      </div>

    </div>
  );
};
