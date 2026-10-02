import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Layers, Rocket, PieChart, Repeat, Clock, ChevronRight, 
  Wallet, ShieldCheck, Newspaper, ExternalLink, Sparkles 
} from 'lucide-react';
import { 
  fetchStocksList, fetchMarketIndices, fetchUnifiedPortfolio, 
  fetchIpos, fetchMutualFunds, fetchSipPlans, fetchLiveNews 
} from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';

export const HomeDashboardView = ({ onSelectStock, setActiveTab, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [indices, setIndices] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [ipos, setIpos] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [sips, setSips] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [indData, stkData, ipoData, mfData, newsData] = await Promise.all([
          fetchMarketIndices().catch(() => []),
          fetchStocksList().catch(() => []),
          fetchIpos('ALL').catch(() => []),
          fetchMutualFunds('ALL').catch(() => []),
          fetchLiveNews().catch(() => [])
        ]);

        setIndices(indData || []);
        setStocks(stkData || []);
        setIpos(ipoData || []);
        setMutualFunds(mfData || []);
        setNews(newsData || []);

        const token = localStorage.getItem('authToken');
        if (token) {
          const [portData, sipData] = await Promise.all([
            fetchUnifiedPortfolio().catch(() => null),
            fetchSipPlans().catch(() => [])
          ]);
          setPortfolio(portData);
          setSips(sipData || []);
        }
      } catch (err) {
        console.error("Home dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Compute top gainers and losers
  const sortedStocks = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedStocks.slice(0, 4);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);

  const openIpos = ipos.filter(i => i.status === 'OPEN' || i.status === 'CURRENT');
  const upcomingIpos = ipos.filter(i => i.status === 'UPCOMING');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase font-mono">
          Loading Indian Markets, IPOs & Mutual Funds...
        </p>
      </div>
    );
  }

  const userGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = currentUser ? `${currentUser.firstname || currentUser.name || 'Investor'}` : 'Guest Investor';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. WELCOME BANNER & LIVE BADGES */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                NSE & BSE LIVE TERMINAL
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                INR (₹) Standard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {userGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">{displayName}</span> 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your comprehensive Indian wealth command center. Real-time NSE/BSE stock quotes, AMFI daily NAVs, upcoming IPO allotments, and automated SIP wealth management.
            </p>
          </div>

          {/* Quick Portfolio Widget or Demo Wallet Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-cyan-400" /> Virtual Trading Cash</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {formatINR(portfolio?.profile?.availableBalance || currentUser?.availableBalance || 125000.00)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
              <span className="text-slate-400">Total Net Worth:</span>
              <span className="text-cyan-400 font-bold font-mono">
                {formatINR(portfolio?.profile?.totalNetWorth || 172405.13)}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. LIVE INDIAN INDICES STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((idx) => {
          const isPos = idx.change >= 0;
          return (
            <div 
              key={idx.symbol}
              className="glass-card p-4 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
              onClick={() => setActiveTab('markets')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{idx.symbol}</span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{idx.exchange}</span>
                </div>
                <span className={`flex items-center text-xs font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {formatPercent(idx.changePercent)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-white">{formatINR(idx.price)}</span>
                <span className={`text-[11px] font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{idx.change.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. QUICK NAVIGATION HUBS (Groww/Upstox Style Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'stocks', title: 'Indian Stocks', desc: 'NSE & BSE Equities, Charts, Orders', icon: Layers, color: 'from-cyan-500/20 to-blue-500/10', border: 'hover:border-cyan-400/40' },
          { id: 'ipo', title: 'Indian IPOs', desc: 'Upcoming, Open & Listed IPOs with ASBA', icon: Rocket, color: 'from-amber-500/20 to-orange-500/10', border: 'hover:border-amber-400/40' },
          { id: 'mutual-funds', title: 'Mutual Funds', desc: 'Live AMFI NAVs, ELSS, Flexi Cap', icon: PieChart, color: 'from-emerald-500/20 to-teal-500/10', border: 'hover:border-emerald-400/40' },
          { id: 'sip', title: 'SIP Investment', desc: 'Automated Monthly Wealth Growth', icon: Repeat, color: 'from-purple-500/20 to-indigo-500/10', border: 'hover:border-purple-400/40' },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`glass-panel p-5 rounded-2xl border border-white/10 ${item.border} transition-all cursor-pointer group bg-gradient-to-br ${item.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
              <item.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
              {item.title}
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 4. TOP GAINERS & LOSERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Gainers */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Gainers (NSE/BSE)</h3>
            </div>
            <button 
              onClick={() => setActiveTab('markets')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All Stocks →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topGainers.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs group-hover:text-emerald-400">{s.symbol}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +{s.changePercent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.name}</p>
                <div className="mt-2 text-xs font-mono font-bold text-slate-200">
                  {formatINR(s.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Losers (NSE/BSE)</h3>
            </div>
            <button 
              onClick={() => setActiveTab('markets')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Market Depth →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topLosers.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs group-hover:text-rose-400">{s.symbol}</span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {s.changePercent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.name}</p>
                <div className="mt-2 text-xs font-mono font-bold text-slate-200">
                  {formatINR(s.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. OPEN & UPCOMING IPOS + POPULAR MUTUAL FUNDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IPO Spotlight */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Indian IPO Hub</h3>
            </div>
            <button 
              onClick={() => setActiveTab('ipo')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              All IPOs ({ipos.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {[...openIpos, ...upcomingIpos].slice(0, 3).map((ipo) => (
              <div 
                key={ipo.id}
                onClick={() => setActiveTab('ipo')}
                className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{ipo.logo || '🚀'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{ipo.company}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        ipo.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {ipo.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Price: {ipo.issuePrice} • Lot: {ipo.lotSize} shares</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white">Min. {formatINR(ipo.minInvestment)}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">{ipo.gmp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Mutual Funds with Live AMFI NAV */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Top Rated Mutual Funds</h3>
            </div>
            <button 
              onClick={() => setActiveTab('mutual-funds')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Explore Funds ({mutualFunds.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {mutualFunds.slice(0, 3).map((mf) => (
              <div
                key={mf.id}
                onClick={() => setActiveTab('mutual-funds')}
                className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{mf.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-slate-300">
                      {mf.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{mf.fundHouse} • Exp: {mf.expenseRatio}</p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white">NAV: ₹{mf.nav}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">3Y: +{mf.return3Y}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. REAL-TIME INDIAN MARKET NEWS TICKER */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Indian Market News Feed</h3>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Live Feed
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('news')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            All Market News →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.slice(0, 3).map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400 font-semibold">{item.source || 'Financial Express'}</span>
                  <span>{item.time || 'Today'}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {item.title}
                </h4>
              </div>
              <div className="pt-3 flex items-center justify-between text-[10px]">
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                  {item.category || 'Indian Market'}
                </span>
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Read <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
