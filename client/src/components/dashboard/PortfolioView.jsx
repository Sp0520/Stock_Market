import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, DollarSign } from 'lucide-react';
import { fetchPortfolio, addFunds, withdrawFunds } from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';
import { Donut3DChart } from './Donut3DChart.jsx';

export const PortfolioView = ({ onSelectStock }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Funds Transaction State
  const [fundAmount, setFundAmount] = useState('');
  const [fundAction, setFundAction] = useState('DEPOSIT'); // DEPOSIT or WITHDRAW
  const [fundLoading, setFundLoading] = useState(false);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const data = await fetchPortfolio();
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
      // Reload portfolio
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
        <p className="text-slate-400 text-xs font-semibold">Loading live portfolio holdings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto my-10 space-y-4">
        <h3 className="text-lg font-bold text-rose-400">🔒 Login Required</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must be logged in to view your live portfolio holdings and manage wallet funds.
        </p>
      </div>
    );
  }

  const { profile, holdings = [] } = portfolio;
  const isOverallProfit = profile.totalProfit >= 0;
  const isTodayProfit = profile.todaysProfit >= 0;

  return (
    <div className="space-y-6">
      
      {/* Upper Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Available Balance */}
        <div className="glass-card p-5 flex flex-col justify-between h-36 bg-gradient-to-br from-slate-900/80 to-slate-950/80">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Wallet Balance</span>
            <div className="text-2xl font-black font-mono text-white tracking-tight mt-1.5">
              {formatINR(profile.availableBalance)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-white/5 pt-2 font-mono">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Virtual trading credit</span>
          </div>
        </div>

        {/* Invested Value */}
        <div className="glass-card p-5 flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Invested</span>
            <div className="text-2xl font-black font-mono text-white tracking-tight mt-1.5">
              {formatINR(profile.totalInvestment)}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2 font-mono">
            <span>In active stocks</span>
          </div>
        </div>

        {/* Current Value */}
        <div className="glass-card p-5 flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Current Value</span>
            <div className="text-2xl font-black font-mono text-white tracking-tight mt-1.5">
              {formatINR(profile.currentPortfolioValue)}
            </div>
          </div>
          <div className={`text-[10px] font-bold border-t border-white/5 pt-2 flex items-center gap-1 font-mono ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOverallProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>Total Returns {formatPercent(profile.totalProfitPercent)}</span>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="glass-card p-5 flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Profit / Loss</span>
            <div className={`text-2xl font-black font-mono tracking-tight mt-1.5 ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isOverallProfit ? '+' : ''}{formatINR(profile.totalProfit)}
            </div>
          </div>
          <div className={`text-[10px] font-bold border-t border-white/5 pt-2 flex items-center gap-1 font-mono ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>Today's P&L: {isTodayProfit ? '+' : ''}{formatINR(profile.todaysProfit)} ({formatPercent(profile.todaysProfitPercent)})</span>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Holdings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Holdings</h3>
            
            {holdings.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs text-slate-400">You don't own any shares yet.</p>
                <button
                  onClick={() => onSelectStock('RELIANCE')}
                  className="btn-buy-green py-2 px-4 text-xs font-bold"
                >
                  Explore Stocks
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-900/30 font-semibold">
                      <th className="p-3">Symbol</th>
                      <th className="p-3 text-right">Shares</th>
                      <th className="p-3 text-right">Avg Price</th>
                      <th className="p-3 text-right">LTP</th>
                      <th className="p-3 text-right">Current Value</th>
                      <th className="p-3 text-right">Total P&L</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {holdings.map((h) => {
                      const isUp = h.pnl >= 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-sans font-extrabold text-white">
                            <span 
                              onClick={() => onSelectStock(h.symbol)}
                              className="hover:underline cursor-pointer text-cyan-300"
                            >
                              {h.symbol}
                            </span>
                            <span className="text-[9px] block font-normal text-slate-400 mt-0.5">{h.exchange}</span>
                          </td>
                          <td className="p-3 text-right text-slate-200 font-bold">{h.qty}</td>
                          <td className="p-3 text-right text-slate-400">₹{h.avgPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-white">₹{h.currentPrice.toFixed(2)}</td>
                          <td className="p-3 text-right text-slate-200 font-bold">₹{h.currentValue.toLocaleString('en-IN')}</td>
                          <td className={`p-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                            <span className="text-[9px] block font-semibold mt-0.5">
                              {isUp ? '+' : ''}{h.pnlPercent}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => onSelectStock(h.symbol)}
                              className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold"
                            >
                              TRADE
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
        </div>

        {/* Right Columns: Charts & Wallet Management */}
        <div className="space-y-6">
          
          {/* Allocation Chart */}
          <div className="glass-card p-5">
            <Donut3DChart holdings={holdings} />
          </div>

          {/* Manage Funds */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-cyan-400" />
              Manage Wallet Funds
            </h3>
            
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
                <label className="text-slate-300 font-semibold">Amount (INR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount in ₹"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full glass-input text-white"
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
                {fundLoading ? 'Processing...' : fundAction === 'DEPOSIT' ? 'Add Funds Securely' : 'Withdraw Funds'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
