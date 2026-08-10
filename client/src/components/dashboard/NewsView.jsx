import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, Sparkles } from 'lucide-react';
import { fetchNews } from '../../services/api.js';

export const NewsView = () => {
  const [newsData, setNewsData] = useState({ news: [], corporateActions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('NEWS'); // NEWS or ACTIONS

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchNews();
        setNewsData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch market news');
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Fetching latest Dalal Street news...</p>
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

  return (
    <div className="space-y-6">
      
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyan-400" />
            Market News & Events
          </h2>
          <p className="text-xs text-slate-400">Stay informed with live news and upcoming corporate actions</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'NEWS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            📰 Top News
          </button>
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ACTIONS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            🔔 Corporate Actions
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'NEWS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsData.news.map((item, idx) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';
            return (
              <div key={idx} className="glass-card p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
                
                {/* Background glow for sentiment */}
                {isBullish && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full"></div>}
                {isBearish && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full"></div>}

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">{item.source} • {item.time}</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold uppercase ${
                      isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      isBearish ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-extrabold text-white leading-snug hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-3 border-t border-white/5 text-[10px] text-cyan-300 font-semibold uppercase font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Related Asset: {item.symbol}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-900/30 font-semibold">
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Announcement</th>
                  <th className="p-3.5 font-mono">Ex-Date</th>
                  <th className="p-3.5 font-mono">Record Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono font-medium">
                {newsData.corporateActions.map((action, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-sans font-extrabold text-white">{action.company}</td>
                    <td className="p-3.5">
                      <span className="badge-exchange text-[9px] uppercase">
                        {action.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-200">{action.details}</td>
                    <td className="p-3.5 text-slate-400">{action.exDate}</td>
                    <td className="p-3.5 text-slate-400">{action.recordDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
