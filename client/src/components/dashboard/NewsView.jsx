import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, Sparkles, ExternalLink, Search, RefreshCw, Calendar } from 'lucide-react';
import { fetchNews, fetchLiveNews } from '../../services/api.js';

export const NewsView = () => {
  const [news, setNews] = useState([]);
  const [corporateActions, setCorporateActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, STOCKS, IPOS, MUTUAL_FUNDS, ACTIONS
  const [searchQuery, setSearchQuery] = useState('');

  const loadNews = async () => {
    try {
      setLoading(true);
      const [staticData, liveData] = await Promise.all([
        fetchNews().catch(() => ({ news: [], corporateActions: [] })),
        fetchLiveNews().catch(() => [])
      ]);

      const mergedNews = [...(liveData || []), ...(staticData.news || [])];
      setNews(mergedNews);
      setCorporateActions(staticData.corporateActions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch market news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (activeTab === 'STOCKS') {
      if (!item.category?.toLowerCase().includes('stock') && !item.category?.toLowerCase().includes('corporate')) return false;
    } else if (activeTab === 'IPOS') {
      if (!item.category?.toLowerCase().includes('ipo')) return false;
    } else if (activeTab === 'MUTUAL_FUNDS') {
      if (!item.category?.toLowerCase().includes('mutual') && !item.category?.toLowerCase().includes('fund')) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" /> LIVE FINANCIAL INTELLIGENCE
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Economic Times • Livemint • Business Standard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Indian Market <span className="text-cyan-400">News & Events</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Real-time Indian business headlines, macroeconomic updates, company quarterly earnings, SEBI circulars, IPO announcements, and corporate actions.
            </p>
          </div>

          <button
            onClick={loadNews}
            className="py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh News
          </button>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All News' },
            { id: 'STOCKS', label: 'Stocks & Economy' },
            { id: 'IPOS', label: 'IPO News' },
            { id: 'MUTUAL_FUNDS', label: 'Mutual Funds' },
            { id: 'ACTIONS', label: `Corporate Actions (${corporateActions.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'ACTIONS' && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter headlines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold">Streaming Indian market news...</p>
        </div>
      ) : activeTab === 'ACTIONS' ? (
        /* Corporate Actions Table */
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Announcement Details</th>
                  <th className="p-4 font-mono">Ex-Date</th>
                  <th className="p-4 font-mono">Record Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {corporateActions.map((action, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-sans font-bold text-white">{action.company}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {action.type}
                      </span>
                    </td>
                    <td className="p-4 font-sans text-slate-200">{action.details}</td>
                    <td className="p-4 text-slate-400">{action.exDate}</td>
                    <td className="p-4 text-slate-400">{action.recordDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* News Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, idx) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';
            return (
              <div
                key={item.id || idx}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-400 font-bold">{item.source || 'Economic Times'}</span>
                    <span className="text-slate-400">{item.time || 'Today'}</span>
                  </div>

                  <h3 className="font-extrabold text-white text-sm group-hover:text-cyan-300 transition-colors leading-snug line-clamp-3">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {item.summary || item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    isBearish ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-700/20 text-slate-300 border border-white/5'
                  }`}>
                    {item.sentiment || 'NEUTRAL'}
                  </span>

                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      Read Article <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500 font-mono text-[10px]">Market Wire</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
