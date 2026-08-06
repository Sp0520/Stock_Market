import React from 'react';
import { Newspaper, Calendar } from 'lucide-react';

export const NewsView: React.FC = () => {
  const newsList = [
    {
      id: "n-1",
      title: "RBI Monetary Policy Committee keeps Repo Rate unchanged at 6.50% with neutral stance",
      category: "RBI & Economy",
      time: "25 mins ago",
      source: "Moneycontrol",
      sentiment: "BULLISH",
      summary: "The Reserve Bank of India governor announced that inflation is trending downwards towards 4%, keeping interest rates steady while supporting robust GDP growth projection of 7.2%."
    },
    {
      id: "n-2",
      title: "Reliance Industries announces ₹75,000 Cr capex expansion in Green Hydrogen & solar manufacturing",
      category: "Corporate News",
      time: "1 hour ago",
      source: "Economic Times",
      sentiment: "BULLISH",
      summary: "RIL chairman outlined the roadmap for gigafactories in Jamnagar, targeting ultra-low-cost green hydrogen production by 2027."
    },
    {
      id: "n-3",
      title: "SEBI issues updated guidelines for F&O derivative contracts with increased lot sizes",
      category: "SEBI Regulatory",
      time: "3 hours ago",
      source: "Livemint",
      sentiment: "NEUTRAL",
      summary: "Capital markets regulator SEBI introduced measures to curb retail losses in futures and options trading by revising strike price intervals."
    }
  ];

  const corporateActions = [
    { symbol: "RELIANCE", action: "DIVIDEND", details: "Final Dividend ₹10.00 per share", exDate: "2026-08-19" },
    { symbol: "TCS", action: "INTERIM DIVIDEND", details: "Interim Dividend ₹12.50 per share", exDate: "2026-08-25" },
    { symbol: "HAL", action: "STOCK SPLIT", details: "Split 1 Share of ₹10 into 2 Shares of ₹5", exDate: "2026-09-02" },
    { symbol: "ITC", action: "BONUS ISSUE", details: "Bonus 1:1 (1 bonus share for every 1 share held)", exDate: "2026-09-10" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Corporate Actions Tab */}
      <div className="glass-card p-6 space-y-4 border-l-4 border-cyan-400">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Upcoming Corporate Actions (Dividends, Splits & Bonus)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {corporateActions.map((ca) => (
            <div key={ca.symbol + ca.action} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{ca.symbol}</span>
                <span className="badge-exchange text-[9px]">{ca.action}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{ca.details}</p>
              <div className="text-[10px] text-cyan-300 font-mono">Ex-Date: {ca.exDate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial News Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-emerald-400" />
          Latest Indian Stock Market News (NSE / BSE / SEBI)
        </h3>

        <div className="space-y-4">
          {newsList.map((item) => (
            <div key={item.id} className="glass-card p-5 space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-bold uppercase">{item.category} • {item.source}</span>
                <span className="badge-gain text-[10px]">{item.sentiment}</span>
              </div>
              <h4 className="text-base font-extrabold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
              <div className="text-[10px] text-slate-500 font-mono">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
