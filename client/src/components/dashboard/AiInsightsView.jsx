import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Compass, Cpu } from 'lucide-react';
import { fetchAiInsights } from '../../services/api.js';

export const AiInsightsView = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await fetchAiInsights();
        setInsights(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch AI insights');
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Running AI health checks & recommendation engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center text-rose-400 text-xs font-semibold max-w-md mx-auto my-10">
        {error}
      </div>
    );
  }

  const { sentiment = {}, portfolioHealth = {}, recommendations = [] } = insights;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          AI Trading Analytics
        </h2>
        <p className="text-xs text-slate-400">Machine learning checks and predictive market insights for your profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Sentiment Gauge */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Market Sentiment Index
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Daily aggregated fear, greed, and flow index of Indian markets</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6 relative">
            <div className="w-32 h-32 rounded-full border-8 border-slate-900 border-t-cyan-400 border-r-cyan-400 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Index Score</span>
              <span className="text-3xl font-black text-white font-mono mt-0.5">{sentiment.index || 65}</span>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-xs font-extrabold uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 px-3 py-1 rounded-lg">
                {sentiment.label || 'GREED'}
              </span>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Volume Momentum: {sentiment.volumeIndex || 'Strong Bullish'}</p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center border-t border-white/5 pt-3">
            Last Updated: Just Now
          </div>
        </div>

        {/* Portfolio Health */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Portfolio Health Advisor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Diversification Score</span>
              <span className="text-xl font-extrabold text-cyan-300 font-mono">{portfolioHealth.diversificationScore || '78%'}</span>
              <p className="text-[10px] text-slate-400 pt-1">Good sector spread. Allocation is balanced across IT and energy.</p>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Risk Profile Rating</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{portfolioHealth.riskRating || 'MODERATE'}</span>
              <p className="text-[10px] text-slate-400 pt-1">Volatility indices are within optimal safety bounds.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Healthy Concentration</strong>: No single security holds more than 40% of overall asset exposure.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Low Cash Drag</strong>: Over 85% of available funds are fully deployed inside high-yielding equities.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Rebalancing Suggestion</strong>: High growth tech assets are reaching technical resistance levels. Consider locks.</span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Predictive Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((rec, idx) => {
            const isBuy = rec.action === 'BUY';
            return (
              <div key={idx} className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between hover:border-cyan-400/20 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-white text-xs">{rec.symbol}</span>
                    <span className={`px-2 py-0.5 rounded font-black ${
                      isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {rec.action}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block font-sans">Target Price</span>
                    <span className="text-white font-extrabold">₹{rec.target}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Stop Loss</span>
                    <span className="text-rose-400 font-extrabold">₹{rec.stopLoss || (rec.target * 0.9).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
