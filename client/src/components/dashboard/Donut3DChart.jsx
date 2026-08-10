import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export const Donut3DChart = ({ holdings = [] }) => {
  const [activeSector, setActiveSector] = useState(0);

  // Group holdings by sector
  const sectorMap = {};
  
  if (holdings.length === 0) {
    sectorMap["Cash / Available Funds"] = 100000;
  } else {
    holdings.forEach(h => {
      let sectorName = "Other";
      if (h.symbol === 'TCS' || h.symbol === 'INFY' || h.symbol === 'WIPRO' || h.symbol === 'HCLTECH') sectorName = "Information Technology";
      else if (h.symbol === 'RELIANCE') sectorName = "Energy & Conglomerates";
      else if (h.symbol === 'HDFCBANK' || h.symbol === 'ICICIBANK' || h.symbol === 'SBIN' || h.symbol === 'KOTAKBANK' || h.symbol === 'AXISBANK') sectorName = "Financial Services / Banking";
      else if (h.symbol === 'ZOMATO' || h.symbol === 'SWIGGY') sectorName = "Consumer Internet / Q-Commerce";
      else if (h.symbol === 'HAL' || h.symbol === 'BEL') sectorName = "Defense & Aerospace";
      else if (h.symbol === 'ITC' || h.symbol === 'HINDUNILVR') sectorName = "FMCG";
      else if (h.symbol === 'TATASTEEL' || h.symbol === 'COALINDIA') sectorName = "Metals & Mining";
      else if (h.symbol === 'DLF') sectorName = "Realty";
      else if (h.symbol === 'BHARTIARTL') sectorName = "Telecom";
      else if (h.symbol === 'NTPC' || h.symbol === 'ONGC') sectorName = "Energy / Utilities";
      
      sectorMap[sectorName] = (sectorMap[sectorName] || 0) + h.currentValue;
    });
  }

  const totalVal = Object.values(sectorMap).reduce((sum, v) => sum + v, 0);

  const colors = ["#7C5CFC", "#00E38A", "#22D3EE", "#FFB020", "#FF3B5C", "#ec4899", "#8b5cf6", "#f97316"];
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

  // Function to generate SVG path for a donut sector
  const getSvgPathForSector = (startPct, endPct, radius = 35) => {
    if (endPct - startPct >= 0.999) {
      // If it's 100%, render a almost full circle path to avoid SVG arc coordinate bugs
      return `M 50 ${50 - radius} A ${radius} ${radius} 0 1 1 49.99 ${50 - radius}`;
    }

    const startAngle = (startPct * 2 * Math.PI) - Math.PI / 2;
    const endAngle = (endPct * 2 * Math.PI) - Math.PI / 2;
    
    const x1 = 50 + radius * Math.cos(startAngle);
    const y1 = 50 + radius * Math.sin(startAngle);
    const x2 = 50 + radius * Math.cos(endAngle);
    const y2 = 50 + radius * Math.sin(endAngle);
    
    const largeArcFlag = (endPct - startPct) > 0.5 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  let cumulativePct = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          3D Sector Asset Allocation
        </h3>
        <span className="badge-exchange text-[9px] uppercase">Portfolio Analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* SVG Arc 3D Chart Container */}
        <div className="relative flex items-center justify-center p-4">
          <div className="absolute w-44 h-44 rounded-full bg-cyan-500/5 blur-2xl animate-pulse"></div>

          {/* Perspective 3D rotation frame */}
          <div 
            className="transform transition-transform duration-500 ease-out hover:rotate-x-12"
            style={{ 
              perspective: '800px', 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(30deg) rotateY(0deg)'
            }}
          >
            <svg 
              width="230" 
              height="230" 
              viewBox="0 0 100 100" 
              className="overflow-visible select-none drop-shadow-[0_12px_20px_rgba(0,0,0,0.65)]"
            >
              <defs>
                {/* Real shadow filter */}
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8"/>
                </filter>
              </defs>

              {/* Stacked background guide */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />

              {/* Map sectors */}
              {sectors.map((sec, idx) => {
                const startPct = cumulativePct;
                const endPct = cumulativePct + (sec.pct / 100);
                cumulativePct = endPct;

                const isHovered = activeSector === idx;
                const pathData = getSvgPathForSector(startPct, endPct, 35);

                return (
                  <g key={sec.name} className="transition-all duration-300">
                    
                    {/* Layer 1: Pseudo-3D Depth Cylinder (Bottom offset layer in dark color) */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={isHovered ? 15 : 12}
                      transform="translate(0, 3)"
                      className="transition-all duration-300"
                    />

                    {/* Layer 2: Main Top Face Layer */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={sec.color}
                      strokeWidth={isHovered ? 15 : 12}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        filter: isHovered 
                          ? `url(#shadowFilter) drop-shadow(0 0 8px ${sec.color}80)` 
                          : 'url(#shadowFilter)',
                        strokeLinecap: 'round'
                      }}
                      onMouseEnter={() => setActiveSector(idx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Central absolute values overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center pt-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Value</span>
            <span className="text-sm font-black font-mono text-white tracking-tight">
              {formatINR(totalVal)}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
              {sectors[activeSector] ? `${sectors[activeSector].pct}% Allocation` : '100% Allocation'}
            </span>
          </div>

        </div>

        {/* Legend Panel */}
        <div className="space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
          {sectors.map((sec, idx) => {
            const isSelected = activeSector === idx;
            return (
              <div
                key={sec.name}
                onMouseEnter={() => setActiveSector(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-slate-950/40 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ 
                      backgroundColor: sec.color, 
                      boxShadow: isSelected ? `0 0 10px ${sec.color}` : 'none' 
                    }}
                  ></span>
                  <span className="font-bold text-slate-300 truncate">{sec.name}</span>
                </div>

                <div className="text-right font-mono shrink-0 ml-2">
                  <div className="font-extrabold text-white">{formatINR(sec.value)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">{sec.pct}%</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Donut3DChart;
