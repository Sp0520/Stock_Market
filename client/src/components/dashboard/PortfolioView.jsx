import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, 
  DollarSign, PieChart, Layers, Repeat, Rocket, ShieldCheck 
} from 'lucide-react';
import { fetchUnifiedPortfolio, addFunds, withdrawFunds } from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';

export const PortfolioView = ({ onSelectStock, setActiveTab }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioTab, setPortfolioTab] = useState('ALL'); // ALL, STOCKS, MUTUAL_FUNDS, SIPS, IPOS
  
  // Funds Transaction State
  const [fundAmount, setFundAmount] = useState('');
  const [fundAction, setFundAction] = useState('DEPOSIT');
  const [fundLoading, setFundLoading] = useState(false);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const data = await fetchUnifiedPortfolio();
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch portfolio details. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const handleFundSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(fundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setFundLoading(true);
      if (fundAction === 'DEPOSIT') {
        const res = await addFunds(amountNum, 'UPI/Netbanking');
        alert(res.message);
      } else {
        const res = await withdrawFunds(amountNum);
        alert(res.message);
      }
      setFundAmount('');
      await loadPortfolioData();
    } catch (err) {
      alert(err.message || 'Fund transaction failed');
    } finally {
      setFundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold font-mono tracking-wider">
          Aggregating Stocks, Mutual Funds, SIPs & IPOs...
        </p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto my-10 space-y-4">
        <h3 className="text-lg font-bold text-rose-400">🔒 Session Active or Demo</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || "Could not retrieve unified portfolio."}
        </p>
      </div>
    );
  }

  const { 
    profile, 
    stockMetrics = { holdings: [] }, 
    mfMetrics = { holdings: [] }, 
    sipMetrics = { plans: [] }, 
    ipoMetrics = { applications: [] },
    allocation = []
  } = portfolio;

  const isOverallProfit = profile.overallProfit >= 0;
  const isTodayProfit = profile.todaysProfit >= 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* 1. TOP CARDS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net Worth */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-cyan-950/40">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
            Total Net Worth
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatINR(profile.totalNetWorth)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2 mt-3 font-mono">
            <span>Available Cash:</span>
            <span className="text-cyan-400 font-bold">{formatINR(profile.availableBalance)}</span>
          </div>
        </div>

        {/* Total Invested vs Current */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
            Invested vs Current Value
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatINR(profile.currentAssetsValue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2 mt-3 font-mono">
            <span>Invested:</span>
            <span className="text-slate-200 font-bold">{formatINR(profile.totalInvested)}</span>
          </div>
        </div>

        {/* Overall Profit / Loss */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
            Overall Profit / Loss
          </span>
          <div className={`text-2xl font-black font-mono mt-1 ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOverallProfit ? '+' : ''}{formatINR(profile.overallProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] border-t border-white/10 pt-2 mt-3 font-mono">
            <span className="text-slate-400">Total Return:</span>
            <span className={`font-bold ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isOverallProfit ? '+' : ''}{profile.overallProfitPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Day P&L & XIRR */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
            Today's P&L & XIRR
          </span>
          <div className={`text-2xl font-black font-mono mt-1 ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTodayProfit ? '+' : ''}{formatINR(profile.todaysProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] border-t border-white/10 pt-2 mt-3 font-mono">
            <span className="text-slate-400">Annualized XIRR:</span>
            <span className="text-cyan-400 font-bold">{profile.xirr}%</span>
          </div>
        </div>

      </div>

      {/* 2. ASSET BREAKDOWN PILLS & ALLOCATION BAR */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Unified Asset Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distributed multi-asset wealth distribution in Indian Rupees</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-mono">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Stocks: <strong>{formatINR(stockMetrics.current)}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Mutual Funds: <strong>{formatINR(mfMetrics.current)}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
              SIPs: <strong>{formatINR(sipMetrics.current)}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
              IPO ASBA: <strong>{formatINR(ipoMetrics.current)}</strong>
            </span>
          </div>
        </div>

        {/* Multi-segmented Allocation Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          {allocation.map((item, idx) => (
            <div
              key={idx}
              title={`${item.label}: ${item.percent.toFixed(1)}%`}
              style={{ width: `${item.percent}%`, backgroundColor: item.color }}
              className="h-full transition-all"
            ></div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400 pt-1">
          {allocation.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.label}: <strong className="text-slate-200">{item.percent.toFixed(1)}%</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ASSETS SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Holdings', count: stockMetrics.holdings.length + mfMetrics.holdings.length },
          { id: 'STOCKS', label: `Stocks (${stockMetrics.holdings.length})` },
          { id: 'MUTUAL_FUNDS', label: `Mutual Funds (${mfMetrics.holdings.length})` },
          { id: 'SIPS', label: `Active SIPs (${sipMetrics.plans.length})` },
          { id: 'IPOS', label: `IPO Applications (${ipoMetrics.applications.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPortfolioTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              portfolioTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. ASSET HOLDINGS TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Table Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION: STOCKS HOLDINGS */}
          {(portfolioTab === 'ALL' || portfolioTab === 'STOCKS') && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Indian Stock Holdings ({stockMetrics.holdings.length})
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Valuation: <strong className="text-white">{formatINR(stockMetrics.current)}</strong>
                </span>
              </div>

              {stockMetrics.holdings.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">No equity stocks currently held.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5 text-right">Qty</th>
                        <th className="p-3.5 text-right">Avg Buy</th>
                        <th className="p-3.5 text-right">CMP</th>
                        <th className="p-3.5 text-right">Current Value</th>
                        <th className="p-3.5 text-right">P&L</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {stockMetrics.holdings.map((s) => {
                        const isUp = s.pnl >= 0;
                        return (
                          <tr key={s.symbol} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-bold font-sans text-white">
                              <span 
                                onClick={() => onSelectStock && onSelectStock(s.symbol)}
                                className="cursor-pointer hover:underline text-cyan-300"
                              >
                                {s.symbol}
                              </span>
                            </td>
                            <td className="p-3.5 text-right text-slate-200">{s.qty}</td>
                            <td className="p-3.5 text-right text-slate-400">₹{s.avgPrice.toFixed(2)}</td>
                            <td className="p-3.5 text-right text-white font-bold">₹{s.currentPrice.toFixed(2)}</td>
                            <td className="p-3.5 text-right text-slate-200 font-bold">{formatINR(s.currentValue)}</td>
                            <td className={`p-3.5 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isUp ? '+' : ''}{formatINR(s.pnl)} ({s.pnlPercent.toFixed(2)}%)
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => onSelectStock && onSelectStock(s.symbol)}
                                className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold"
                              >
                                Trade
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION: MUTUAL FUNDS HOLDINGS */}
          {(portfolioTab === 'ALL' || portfolioTab === 'MUTUAL_FUNDS') && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 text-emerald-400" /> Mutual Fund Holdings ({mfMetrics.holdings.length})
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Valuation: <strong className="text-emerald-400">{formatINR(mfMetrics.current)}</strong>
                </span>
              </div>

              {mfMetrics.holdings.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">No mutual fund holdings currently held.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Scheme Name</th>
                        <th className="p-3.5 text-right">Units</th>
                        <th className="p-3.5 text-right">Avg NAV</th>
                        <th className="p-3.5 text-right">Current NAV</th>
                        <th className="p-3.5 text-right">Invested</th>
                        <th className="p-3.5 text-right">Current Value</th>
                        <th className="p-3.5 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {mfMetrics.holdings.map((m) => {
                        const isUp = m.pnl >= 0;
                        return (
                          <tr key={m.id || m.fundId} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-bold font-sans text-white max-w-[220px] truncate">
                              {m.fundName}
                              <span className="text-[10px] block font-mono text-slate-400">{m.folioNumber}</span>
                            </td>
                            <td className="p-3.5 text-right text-slate-200">{m.units}</td>
                            <td className="p-3.5 text-right text-slate-400">₹{m.averageNav}</td>
                            <td className="p-3.5 text-right text-white font-bold">₹{m.currentNav}</td>
                            <td className="p-3.5 text-right text-slate-300">{formatINR(m.investedAmount)}</td>
                            <td className="p-3.5 text-right text-emerald-400 font-bold">{formatINR(m.currentValue)}</td>
                            <td className={`p-3.5 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isUp ? '+' : ''}{formatINR(m.pnl)} ({m.pnlPercent.toFixed(2)}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION: SIPS */}
          {(portfolioTab === 'ALL' || portfolioTab === 'SIPS') && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 text-purple-400" /> Active SIP Plans ({sipMetrics.plans.length})
                </span>
                <span className="text-xs text-purple-300 font-mono">
                  Valuation: <strong>{formatINR(sipMetrics.current)}</strong>
                </span>
              </div>

              {sipMetrics.plans.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">No SIP plans active.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">SIP Code</th>
                        <th className="p-3.5">Fund Name</th>
                        <th className="p-3.5 text-right">Installment</th>
                        <th className="p-3.5 text-right">Paid</th>
                        <th className="p-3.5 text-right">Total Invested</th>
                        <th className="p-3.5 text-right">Next Due</th>
                        <th className="p-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {sipMetrics.plans.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 text-cyan-400 font-bold">{p.sipCode}</td>
                          <td className="p-3.5 font-sans font-semibold text-white max-w-[200px] truncate">{p.fundName}</td>
                          <td className="p-3.5 text-right text-white font-bold">{formatINR(p.installmentAmount)}</td>
                          <td className="p-3.5 text-right text-slate-400">{p.installmentsPaid}</td>
                          <td className="p-3.5 text-right text-emerald-400 font-bold">{formatINR(p.totalInvested)}</td>
                          <td className="p-3.5 text-right text-purple-300">{p.nextInstallmentDate}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION: IPOS */}
          {(portfolioTab === 'ALL' || portfolioTab === 'IPOS') && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-amber-400" /> IPO Applications ({ipoMetrics.applications.length})
                </span>
                <span className="text-xs text-amber-300 font-mono">
                  Blocked/Held: <strong>{formatINR(ipoMetrics.current)}</strong>
                </span>
              </div>

              {ipoMetrics.applications.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">No active IPO applications.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Application No</th>
                        <th className="p-3.5">Company</th>
                        <th className="p-3.5 text-right">Lots</th>
                        <th className="p-3.5 text-right">Amount Held</th>
                        <th className="p-3.5 text-right">UPI Mandate</th>
                        <th className="p-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {ipoMetrics.applications.map((app) => (
                        <tr key={app.id || app.applicationNo} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 text-cyan-400 font-bold">{app.applicationNo || app.application_no}</td>
                          <td className="p-3.5 font-sans font-semibold text-white">{app.company}</td>
                          <td className="p-3.5 text-right text-slate-200">{app.lots} Lot(s)</td>
                          <td className="p-3.5 text-right text-emerald-400 font-bold">{formatINR(app.totalAmount || app.total_amount)}</td>
                          <td className="p-3.5 text-right text-slate-400">{app.upiId || app.upi_id}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Manage Funds / Deposit Simulation */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Wallet className="w-4 h-4 text-cyan-400" /> Virtual Trading Cash
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Available Cash</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {formatINR(profile.availableBalance)}
              </div>
            </div>

            <form onSubmit={handleFundSubmit} className="space-y-4 text-xs">
              <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setFundAction('DEPOSIT')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all text-center ${
                    fundAction === 'DEPOSIT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setFundAction('WITHDRAW')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all text-center ${
                    fundAction === 'WITHDRAW' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  placeholder="Enter amount in ₹"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={fundLoading}
                className={`w-full py-3 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-md transition-all ${
                  fundAction === 'DEPOSIT'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 text-white'
                }`}
              >
                {fundLoading ? 'Processing simulated transaction...' : fundAction === 'DEPOSIT' ? 'Deposit Funds (Simulation)' : 'Withdraw Funds'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
