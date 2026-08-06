import React from 'react';
import { BarChart3, PieChart, ShieldAlert, Calendar, Zap } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';

export const PortfolioAnalytics: React.FC = () => {
  const sectorData = [
    { sector: "Oil & Gas / Conglomerates", percentage: 36.3, color: "#00f2fe", value: 451867.50 },
    { sector: "Information Technology", percentage: 27.5, color: "#4facfe", value: 342824.00 },
    { sector: "Financial Services / Banking", percentage: 15.8, color: "#00e676", value: 197058.00 },
    { sector: "Consumer Services (Q-Commerce)", percentage: 12.9, color: "#ffb300", value: 161040.00 },
    { sector: "Defense & Aerospace", percentage: 7.5, color: "#e040fb", value: 92400.00 }
  ];

  const monthlyReturns = [
    { month: "Jan 2026", returnPct: 3.4 },
    { month: "Feb 2026", returnPct: -1.2 },
    { month: "Mar 2026", returnPct: 5.8 },
    { month: "Apr 2026", returnPct: 2.1 },
    { month: "May 2026", returnPct: 4.5 },
    { month: "Jun 2026", returnPct: -0.8 },
    { month: "Jul 2026", returnPct: 6.2 },
    { month: "Aug 2026", returnPct: 1.56 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Risk Score & Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 space-y-3 border-l-4 border-emerald-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Portfolio Risk Score</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">6.8 / 10</div>
          <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
            MODERATE RISK (Balanced Indian Bluechip Equity)
          </div>
          <p className="text-[11px] text-slate-400">Low beta Nifty 50 stocks protect against market drawdowns.</p>
        </div>

        <div className="glass-card p-6 space-y-3 border-l-4 border-cyan-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Asset Class Allocation</span>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">100% Equity</div>
          <div className="text-xs text-cyan-300 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-block">
            NSE & BSE Large / Mid Cap Equity
          </div>
          <p className="text-[11px] text-slate-400">100% exposure to high quality Indian growth equities.</p>
        </div>

        <div className="glass-card p-6 space-y-3 border-l-4 border-purple-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Sharpe Ratio</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">2.14</div>
          <div className="text-xs text-purple-300 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block">
            EXCELLENT RISK-ADJUSTED RETURN
          </div>
          <p className="text-[11px] text-slate-400">Outperforming Nifty 50 Index CAGR by 4.2%.</p>
        </div>

      </div>

      {/* Sector Allocation Breakdown */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Sector Allocation Breakdown (INR ₹)
        </h3>

        <div className="space-y-4">
          {sectorData.map((sec) => (
            <div key={sec.sector} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">{sec.sector}</span>
                <span className="font-mono text-cyan-300">{formatINR(sec.value)} ({sec.percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${sec.percentage}%`, backgroundColor: sec.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Returns Heatmap */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Monthly Returns Heatmap (2026)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {monthlyReturns.map((m) => {
            const isPos = m.returnPct >= 0;
            return (
              <div 
                key={m.month}
                className={`p-4 rounded-xl border text-center space-y-1 ${
                  isPos 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-400">{m.month}</div>
                <div className="text-base font-extrabold font-mono">{formatPercent(m.returnPct)}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
