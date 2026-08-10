import React from 'react';
import { Layers } from 'lucide-react';
import { formatPercent } from '../../utils/formatters.js';
import { Card3D } from '../common/Card3D.jsx';

export const MarketHeatmap3D = () => {
  const heatmapData = [
    { name: "Banking & Financials", stocks: "HDFCBANK, ICICIBANK, SBIN, KOTAK, AXIS", changePct: 1.25, marketCap: "₹37.1 Lakh Cr", topStock: "ICICIBANK (+1.55%)" },
    { name: "IT Services & Consulting", stocks: "TCS, INFY, WIPRO, HCLTECH", changePct: 0.84, marketCap: "₹30.3 Lakh Cr", topStock: "INFY (+1.74%)" },
    { name: "Defense & Aerospace", stocks: "HAL, BEL", changePct: 2.42, marketCap: "₹5.2 Lakh Cr", topStock: "HAL (+2.50%)" },
    { name: "Oil & Gas Conglomerates", stocks: "RELIANCE, ONGC, IOC", changePct: 1.54, marketCap: "₹27.8 Lakh Cr", topStock: "RELIANCE (+1.54%)" },
    { name: "Consumer & Q-Commerce", stocks: "ZOMATO, SWIGGY, IRCTC", changePct: 3.12, marketCap: "₹4.2 Lakh Cr", topStock: "ZOMATO (+3.43%)" },
    { name: "Automobile & EV", stocks: "TATAMOTORS, MARUTI, M&M", changePct: 2.15, marketCap: "₹11.2 Lakh Cr", topStock: "TATAMOTORS (+2.15%)" },
    { name: "FMCG & Retail", stocks: "ITC, HUL, NESTLEIND", changePct: -0.48, marketCap: "₹20.5 Lakh Cr", topStock: "HUL (-0.63%)" },
    { name: "Metals & Mining", stocks: "TATASTEEL, JSWSTEEL, COALINDIA", changePct: -0.85, marketCap: "₹7.1 Lakh Cr", topStock: "COALINDIA (-0.74%)" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Sector Market Heatmap
        </h3>
        <span className="text-[9px] text-slate-500 font-bold uppercase">NSE / BSE Real-Time Sectoral Depth</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {heatmapData.map((sec) => {
          const isPos = sec.changePct >= 0;
          return (
            <Card3D
              key={sec.name}
              className={`p-5 space-y-4 relative overflow-hidden border transition-all ${
                isPos 
                  ? 'border-emerald-500/10 hover:border-emerald-500/35 bg-gradient-to-br from-slate-900/80 to-emerald-950/10 shadow-lg shadow-emerald-500/5' 
                  : 'border-rose-500/10 hover:border-rose-500/35 bg-gradient-to-br from-slate-900/80 to-rose-950/10 shadow-lg shadow-rose-500/5'
              }`}
            >
              {/* Inner 3D Translate elements */}
              <div style={{ transform: 'translateZ(10px)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-xs tracking-tight">{sec.name}</h4>
                    <p className="text-[9.5px] text-slate-500 mt-1 font-semibold truncate max-w-[170px]">{sec.stocks}</p>
                  </div>
                  <span className={`text-[10px] font-bold font-mono py-0.5 px-1.5 rounded shrink-0 ${
                    isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {formatPercent(sec.changePct)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono mt-4 pt-3.5 border-t border-white/5 text-slate-500">
                  <div>
                    <span className="block font-bold">M-Cap Size</span>
                    <span className="text-white font-extrabold">{sec.marketCap}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold">Top Mover</span>
                    <span className={`font-black ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sec.topStock.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
};

export default MarketHeatmap3D;
