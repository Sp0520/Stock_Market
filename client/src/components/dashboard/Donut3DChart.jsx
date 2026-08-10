import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export const Donut3DChart = ({ holdings = [] }) => {
  const [activeSector, setActiveSector] = useState(0);

  // Group holdings by sector or symbol
  const sectorMap = {};
  
  if (holdings.length === 0) {
    // Return empty placeholder state
    sectorMap["Cash / Available Funds"] = 100000;
  } else {
    holdings.forEach(h => {
      // Find sector details
      let sectorName = "Other";
      if (h.symbol === 'TCS' || h.symbol === 'INFY') sectorName = "Information Technology";
      else if (h.symbol === 'RELIANCE') sectorName = "Energy & Conglomerates";
      else if (h.symbol === 'HDFCBANK' || h.symbol === 'ICICIBANK' || h.symbol === 'SBIN') sectorName = "Financial Services / Banking";
      else if (h.symbol === 'ZOMATO' || h.symbol === 'SWIGGY') sectorName = "Consumer Internet / Q-Commerce";
      else if (h.symbol === 'HAL' || h.symbol === 'BEL') sectorName = "Defense & Aerospace";
      else if (h.symbol === 'ITC') sectorName = "FMCG";
      
      sectorMap[sectorName] = (sectorMap[sectorName] || 0) + h.currentValue;
    });
  }

  const totalVal = Object.values(sectorMap).reduce((sum, v) => sum + v, 0);

  const colors = ["#00d4ff", "#00f5a0", "#7000ff", "#ffb300", "#ff3b5c", "#ff5722", "#9c27b0", "#e91e63"];
  const sectors = Object.keys(sectorMap).map((name, idx) => {
    const value = sectorMap[name];
    const pct = totalVal > 0 ? parseFloat(((value / totalVal) * 100).toFixed(1)) : 0;
    return {
      name,
      value,
      pct,
      color: colors[idx % colors.length]
    };
  });

  let cumulativePct = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          3D Asset Allocation Donut
        </h3>
        <span className="badge-exchange text-[10px]">NSE Equity</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        <div className="relative flex items-center justify-center p-4">
          <div className="absolute w-44 h-44 rounded-full bg-cyan-500/10 blur-2xl animate-pulse"></div>

          <svg width="220" height="220" viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]">
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
            
            {sectors.map((sec, idx) => {
              const strokeDasharray = `${sec.pct} ${100 - sec.pct}`;
              const strokeDashoffset = 100 - cumulativePct;
              cumulativePct += sec.pct;

              const isHovered = activeSector === idx;

              return (
                <circle
                  key={sec.name}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={sec.color}
                  strokeWidth={isHovered ? "19" : "16"}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 12px ${sec.color})` : 'none'
                  }}
                  onMouseEnter={() => setActiveSector(idx)}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Portfolio</span>
            <span className="text-base font-extrabold font-mono text-white tracking-tight">
              {formatINR(totalVal, { compact: true })}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold mt-0.5">100% Allocation</span>
          </div>

        </div>

        <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
          {sectors.map((sec, idx) => {
            const isSelected = activeSector === idx;
            return (
              <div
                key={sec.name}
                onMouseEnter={() => setActiveSector(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sec.color, boxShadow: `0 0 8px ${sec.color}` }}></span>
                  <span className="font-semibold text-slate-200 truncate max-w-[130px]">{sec.name}</span>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="font-bold text-white">{formatINR(sec.value)}</div>
                  <div className="text-[10px] text-slate-400">{sec.pct}%</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
