import React from 'react';
import { Layers } from 'lucide-react';
import { formatPercent } from '../../utils/formatters.js';

export const MarketHeatmap3D = () => {
  const heatmapData = [
    { name: "Banking & Financials", stocks: "HDFCBANK, ICICIBANK, SBIN", changePct: 1.25, marketCap: "₹28.5 Lakh Cr", topStock: "ICICIBANK (+1.55%)" },
    { name: "IT Services", stocks: "TCS, INFY, WIPRO", changePct: 0.84, marketCap: "₹24.1 Lakh Cr", topStock: "INFY (+1.74%)" },
    { name: "Defense & Aerospace", stocks: "HAL, BEL", changePct: 2.42, marketCap: "₹5.2 Lakh Cr", topStock: "HAL (+2.50%)" },
    { name: "Oil & Conglomerate", stocks: "RELIANCE, ONGC, IOC", changePct: 1.54, marketCap: "₹23.8 Lakh Cr", topStock: "RELIANCE (+1.54%)" },
    { name: "Consumer & Q-Commerce", stocks: "ZOMATO, SWIGGY, IRCTC", changePct: 3.12, marketCap: "₹4.2 Lakh Cr", topStock: "ZOMATO (+3.43%)" },
    { name: "Automobile & EV", stocks: "TATAMOTORS, MARUTI", changePct: 2.15, marketCap: "₹7.8 Lakh Cr", topStock: "TATAMOTORS (+2.15%)" },
    { name: "FMCG & Retail", stocks: "ITC, ASIANPAINT, TITAN", changePct: -0.48, marketCap: "₹12.4 Lakh Cr", topStock: "ITC (-0.48%)" },
    { name: "Metals & Mining", stocks: "TATASTEEL, JSWSTEEL", changePct: -0.85, marketCap: "₹3.9 Lakh Cr", topStock: "TATASTEEL (-0.85%)" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          3D Sector Market Heatmap
        </h3>
        <span className="text-[11px] text-slate-400">NSE / BSE Real-Time Depth</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heatmapData.map((sec) => {
          const isPos = sec.changePct >= 0;
          return (
            <div
              key={sec.name}
              className={`tile-3d p-4 space-y-3 relative overflow-hidden border ${
                isPos 
                  ? 'border-emerald-500/20 hover:border-emerald-400/50 bg-gradient-to-br from-slate-900/80 to-emerald-950/20' 
                  : 'border-rose-500/20 hover:border-rose-400/50 bg-gradient-to-br from-slate-900/80 to-rose-950/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-sm">{sec.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sec.stocks}</p>
                </div>
                <span className={isPos ? "badge-gain font-mono text-xs" : "badge-loss font-mono text-xs"}>
                  {formatPercent(sec.changePct)}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Top Mover:</span>
                <span className={isPos ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{sec.topStock}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
