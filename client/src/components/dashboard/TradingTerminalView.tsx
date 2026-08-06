import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';

interface TradingTerminalViewProps {
  onOrderExecuted: (orderData: any) => void;
}

export const TradingTerminalView: React.FC<TradingTerminalViewProps> = ({ onOrderExecuted }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [timeframe, setTimeframe] = useState<string>('5D');

  const handleOrder = (type: 'BUY' | 'SELL') => {
    onOrderExecuted({
      symbol: selectedSymbol,
      exchange: "NSE",
      type: type,
      orderCategory: "MARKET",
      qty: 10,
      price: selectedSymbol === 'RELIANCE' ? 2455.70 : 3410.90,
      charges: 25.50,
      estimatedTotalAmount: selectedSymbol === 'RELIANCE' ? 24582.50 : 34134.50
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      
      {/* LEFT COLUMN: Search Results / Stock List */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Search Results</h3>

        <div className="space-y-3">
          
          {/* RELIANCE Card */}
          <div
            onClick={() => setSelectedSymbol('RELIANCE')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              selectedSymbol === 'RELIANCE'
                ? 'bg-gradient-to-r from-blue-900/40 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/50 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-base">RELIANCE</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">Reliance Industries Ltd. | INE002A01018 | NSE</p>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-extrabold font-mono text-white">₹2,455.70</span>
              <span className="text-xs font-bold text-emerald-400">+0.85% (+20.75)</span>
            </div>
          </div>

          {/* TCS Card */}
          <div
            onClick={() => setSelectedSymbol('TCS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              selectedSymbol === 'TCS'
                ? 'bg-gradient-to-r from-blue-900/40 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/50 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">TCS</span>
                <span className="badge-exchange text-[9px]">NSE</span>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">Tata Consultancy Services Ltd. | INE467B01029 | NSE</p>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-extrabold font-mono text-white">₹3,410.90</span>
              <span className="text-xs font-bold text-emerald-400">+1.20% (+40.50)</span>
            </div>
          </div>

        </div>
      </div>

      {/* CENTER & RIGHT COLUMNS: Main Terminal Content */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* TOP ROW: Real-time Price Card + Main Candlestick Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Real-time Price Metric Card */}
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Real-time Price</span>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-1">₹2,455.70</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">+20.75, +0.85%</div>
            </div>

            {/* Sparkline Graphic */}
            <div className="h-16 flex items-end gap-1 pt-2">
              {[30, 45, 38, 55, 48, 62, 58, 72, 68, 85, 78, 92].map((val, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 bg-emerald-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            <div className="space-y-1.5 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Volume</span>
                <span className="text-white font-bold">120.8M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Open</span>
                <span className="text-white">₹2,455.70</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">High</span>
                <span className="text-emerald-400">₹2,455.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Low</span>
                <span className="text-rose-400">₹2,755.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prev close</span>
                <span className="text-slate-300">₹2,180.00</span>
              </div>
            </div>
          </div>

          {/* Main Candlestick Chart */}
          <div className="md:col-span-2 glass-card p-5 space-y-4">
            
            {/* Chart Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                  R
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">RELIANCE INDUSTRIES LTD.</h2>
                  <span className="text-[11px] text-slate-400 font-mono">NSE: RELIANCE</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleOrder('BUY')} className="btn-buy-green px-5 py-2 text-xs font-extrabold">BUY</button>
                <button onClick={() => handleOrder('SELL')} className="btn-sell-red px-5 py-2 text-xs font-extrabold">SELL</button>
              </div>
            </div>

            {/* Timeframes Selector Bar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                {['5D', '1M', '3M', '1Y', 'YTD'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      timeframe === tf ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-cyan-300">LTP: ₹2,455.70</span>
            </div>

            {/* Canvas Candlestick Chart */}
            <div className="relative w-full h-64 bg-slate-950/80 rounded-xl border border-white/5 p-2 overflow-hidden flex items-center justify-center">
              <div className="w-full h-full flex items-end gap-2 px-4">
                {[
                  { open: 2400, close: 2420, high: 2430, low: 2390 },
                  { open: 2420, close: 2410, high: 2435, low: 2405 },
                  { open: 2410, close: 2445, high: 2450, low: 2400 },
                  { open: 2445, close: 2430, high: 2460, low: 2425 },
                  { open: 2430, close: 2455, high: 2470, low: 2420 },
                  { open: 2455, close: 2470, high: 2485, low: 2440 },
                  { open: 2470, close: 2455.7, high: 2480, low: 2445 }
                ].map((c, i) => {
                  const isUp = c.close >= c.open;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end relative">
                      <div 
                        className={`w-full rounded ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                        style={{ height: `${Math.abs(c.close - c.open) * 2 + 30}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM ROW: Market Indicators + Stock Profile + Order Book Depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Market Indicators */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Market Indicators</h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">NIFTY 50</div>
                  <div className="text-slate-400">19,410.20</div>
                </div>
                <span className="text-emerald-400 font-bold">+75.30 | +0.39%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">SENSEX</div>
                  <div className="text-slate-400">65,450.60</div>
                </div>
                <span className="text-emerald-400 font-bold">+250.90 | +0.38%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">USD/INR</div>
                  <div className="text-slate-400">83.12</div>
                </div>
                <span className="text-rose-400 font-bold">-0.05</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">NIFTY BANK</div>
                  <div className="text-slate-400">44,520.80</div>
                </div>
                <span className="text-emerald-400 font-bold">+180.20</span>
              </div>
            </div>
          </div>

          {/* Card 2: Stock Profile */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">RELIANCE Profile</h4>

            <div className="space-y-2 text-xs font-mono bg-slate-900/60 p-4 rounded-xl border border-white/5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Industry</span>
                <span className="font-bold text-white">Oil, Gas & Fuels</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sector</span>
                <span className="font-bold text-white">Conglomerate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MCAP</span>
                <span className="font-bold text-cyan-300">₹16.60 T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/E</span>
                <span className="font-bold text-white">23.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Div Yield</span>
                <span className="font-bold text-emerald-400">0.35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W High</span>
                <span className="font-bold text-emerald-400">₹2,755.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">52W Low</span>
                <span className="font-bold text-rose-400">₹2,180.00</span>
              </div>
            </div>
          </div>

          {/* Card 3: Order Book & Market Depth */}
          <div className="glass-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  Order Book & Depth <Info className="w-3.5 h-3.5 text-slate-400" />
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">RELIANCE</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Bid Prices</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-emerald-400"><span>2,455.70</span> <span>1,245</span></div>
                    <div className="flex justify-between text-emerald-400"><span>2,455.80</span> <span>1,120</span></div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-rose-400 uppercase font-bold block mb-1">Ask Prices</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-rose-400"><span>2,455.65</span> <span>890</span></div>
                    <div className="flex justify-between text-rose-400"><span>2,455.85</span> <span>1,450</span></div>
                  </div>
                </div>
              </div>

              {/* Depth Volume Indicator Bars */}
              <div className="flex items-center gap-1 h-3 pt-2">
                <div className="h-full bg-emerald-500 rounded-l" style={{ width: '60%' }} />
                <div className="h-full bg-rose-500 rounded-r" style={{ width: '40%' }} />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => handleOrder('BUY')} className="btn-buy-green py-2.5 text-xs font-extrabold">BUY</button>
              <button onClick={() => handleOrder('SELL')} className="btn-sell-red py-2.5 text-xs font-extrabold">SELL</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
