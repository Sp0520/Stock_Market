import React from 'react';
import { PieChart, Download } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';
import type { Holding } from '../../services/api';

interface HoldingsViewProps {
  holdings: Holding[];
  onSelectStock: (symbol: string) => void;
}

export const HoldingsView: React.FC<HoldingsViewProps> = ({ holdings, onSelectStock }) => {
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investmentValue, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInvestment;
  const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Holdings Header Summary */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-l-4 border-cyan-400">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Investment</span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{formatINR(totalInvestment)}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Value</span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{formatINR(totalCurrentValue)}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total P&L (Unrealized)</span>
          <div className={`text-2xl font-extrabold font-mono mt-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(totalPnl, { showSign: true })} ({formatPercent(totalPnlPercent)})
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button className="gradient-btn py-2.5 px-4 text-xs font-bold">
            <Download className="w-4 h-4" /> Download Statement
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Your Stock Holdings ({holdings.length})
          </h3>
          <span className="text-xs text-slate-400">NSE / BSE Equity Holdings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/60 font-semibold">
                <th className="p-4">Instrument</th>
                <th className="p-4 text-right">Qty</th>
                <th className="p-4 text-right">Avg. Price</th>
                <th className="p-4 text-right">LTP (Current)</th>
                <th className="p-4 text-right">Investment</th>
                <th className="p-4 text-right">Current Value</th>
                <th className="p-4 text-right">P&L (Returns)</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {holdings.map((h) => {
                const isGain = h.pnl >= 0;
                return (
                  <tr 
                    key={h.symbol}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onSelectStock(h.symbol)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-300 font-extrabold text-xs">
                          {h.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {h.symbol} <span className="badge-exchange">{h.exchange}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-white">{h.qty}</td>
                    <td className="p-4 text-right font-mono text-slate-300">{formatINR(h.avgPrice)}</td>
                    <td className="p-4 text-right font-mono text-white font-semibold">{formatINR(h.currentPrice)}</td>
                    <td className="p-4 text-right font-mono text-slate-300">{formatINR(h.investmentValue)}</td>
                    <td className="p-4 text-right font-mono text-white font-bold">{formatINR(h.currentValue)}</td>
                    <td className="p-4 text-right font-mono">
                      <div className={isGain ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {formatINR(h.pnl, { showSign: true })}
                      </div>
                      <div className={isGain ? "badge-gain text-[10px] ml-auto inline-flex" : "badge-loss text-[10px] ml-auto inline-flex"}>
                        {formatPercent(h.pnlPercent)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(h.symbol);
                        }}
                        className="gradient-btn-green text-[11px] py-1 px-3 rounded-lg font-bold"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
