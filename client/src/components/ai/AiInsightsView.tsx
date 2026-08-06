import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface AiInsightsProps {
  onSelectStock: (symbol: string) => void;
}

export const AiInsightsView: React.FC<AiInsightsProps> = ({ onSelectStock }) => {
  const recommendations = [
    {
      symbol: "HAL",
      name: "Hindustan Aeronautics Ltd",
      action: "STRONG BUY",
      targetPrice: 5250.00,
      currentPrice: 4620.00,
      timeframe: "6 - 12 Months",
      confidence: "94%",
      rationale: "Strong defense order book pipeline of ₹94,000 Cr, increasing indigenization, and export deals signed with Southeast Asian defense partners."
    },
    {
      symbol: "ZOMATO",
      name: "Eternal Ltd (Zomato)",
      action: "BUY",
      targetPrice: 320.00,
      currentPrice: 268.40,
      timeframe: "3 - 6 Months",
      confidence: "88%",
      rationale: "Blinkit quick commerce EBITDA expansion outperforming expectations; high monthly active transacting user retention across metro cities."
    },
    {
      symbol: "INFY",
      name: "Infosys Limited",
      action: "ACCUMULATE",
      targetPrice: 2100.00,
      currentPrice: 1874.50,
      timeframe: "6 Months",
      confidence: "85%",
      rationale: "GenAI contract wins expanding, attractive dividend yield of 2.05%, and recovering US BFSI tech expenditure."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* AI Header Banner */}
      <div className="glass-card p-6 border-l-4 border-purple-400 bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              AI Market Intelligence & Recommendation Engine
              <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase">PRO AI</span>
            </h2>
            <p className="text-xs text-slate-300">Powered by machine learning models trained on 15 years of NSE/BSE financial tick data.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">AI Sentiment Index</span>
            <span className="text-emerald-400 font-extrabold text-base font-mono">BULLISH (68/100)</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Top AI Stock Recommendations (NSE Equity)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.symbol} className="glass-card p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-lg">{rec.symbol}</span>
                    <span className="badge-exchange">NSE</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {rec.action} ({rec.confidence})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{rec.name}</p>

                <div className="mt-4 space-y-2 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current LTP:</span>
                    <span className="text-white font-bold">{formatINR(rec.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Target Price:</span>
                    <span className="text-emerald-400 font-bold">{formatINR(rec.targetPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-purple-300 font-bold">{rec.timeframe}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  💡 <strong>AI Rationale:</strong> {rec.rationale}
                </p>
              </div>

              <button 
                onClick={() => onSelectStock(rec.symbol)}
                className="gradient-btn w-full py-2.5 rounded-xl text-xs font-bold text-black"
              >
                Trade {rec.symbol} Now
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
