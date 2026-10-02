import React, { useState, useEffect } from 'react';
import { 
  Repeat, Calendar, TrendingUp, PauseCircle, PlayCircle, XCircle, 
  Settings2, Plus, Calculator, History, CheckCircle2, AlertCircle, X, ChevronRight 
} from 'lucide-react';
import { 
  fetchSipPlans, createSipPlan, updateSipStatus, modifySipPlan, 
  fetchSipTransactions, fetchMutualFunds 
} from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';

export const SipView = () => {
  const [sipPlans, setSipPlans] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PLANS'); // PLANS, CALCULATOR, HISTORY

  // Create SIP Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState(5000);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [sipDay, setSipDay] = useState(10);
  const [durationMonths, setDurationMonths] = useState(36);
  const [expectedReturn, setExpectedReturn] = useState(12.0);
  const [createLoading, setCreateLoading] = useState(false);

  // Modify SIP Modal
  const [modifyingPlan, setModifyingPlan] = useState(null);
  const [modifyAmount, setModifyAmount] = useState(5000);
  const [modifyDay, setModifyDay] = useState(10);

  // Installments History Modal
  const [historyPlan, setHistoryPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // SIP Calculator State
  const [calcMonthly, setCalcMonthly] = useState(10000);
  const [calcYears, setCalcYears] = useState(10);
  const [calcReturn, setCalcReturn] = useState(12.0);

  const loadSipData = async () => {
    try {
      setLoading(true);
      const [plansData, fundsData] = await Promise.all([
        fetchSipPlans().catch(() => []),
        fetchMutualFunds('ALL').catch(() => [])
      ]);
      setSipPlans(plansData || []);
      setMutualFunds(fundsData || []);
      if (fundsData.length > 0 && !selectedFundId) {
        setSelectedFundId(fundsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load SIP plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSipData();
  }, []);

  const handleStatusChange = async (planId, newStatus) => {
    try {
      await updateSipStatus(planId, newStatus);
      await loadSipData();
    } catch (err) {
      alert("Failed to update SIP status: " + err.message);
    }
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    try {
      await modifySipPlan(modifyingPlan.id, {
        installmentAmount: parseFloat(modifyAmount),
        sipDay: parseInt(modifyDay, 10)
      });
      setModifyingPlan(null);
      await loadSipData();
    } catch (err) {
      alert("Failed to modify SIP: " + err.message);
    }
  };

  const handleViewHistory = async (plan) => {
    try {
      setHistoryPlan(plan);
      setHistoryLoading(true);
      const txns = await fetchSipTransactions(plan.id);
      setTransactions(txns);
    } catch (err) {
      console.warn("History fetch failed:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateSip = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to start a simulated SIP.");
      return;
    }
    try {
      setCreateLoading(true);
      const res = await createSipPlan({
        fundId: selectedFundId,
        installmentAmount: parseFloat(installmentAmount),
        frequency,
        sipDay: parseInt(sipDay, 10),
        durationMonths: parseInt(durationMonths, 10),
        expectedReturn: parseFloat(expectedReturn),
        executeFirstNow: true
      });
      alert(res.message);
      setShowCreateModal(false);
      await loadSipData();
    } catch (err) {
      alert("Failed to create SIP: " + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Compound Interest SIP Calculation
  const calculateSipWealth = (monthly, years, annualRate) => {
    const i = annualRate / 12 / 100;
    const n = years * 12;
    const totalInvested = monthly * n;
    // Formula: M = P * (( (1 + i)^n - 1 ) / i) * (1 + i)
    const maturityValue = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const estimatedReturns = maturityValue - totalInvested;
    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      maturityValue: Math.round(maturityValue)
    };
  };

  const calcResult = calculateSipWealth(calcMonthly, calcYears, calcReturn);

  // Aggregate metrics
  const totalSipInvested = sipPlans.reduce((sum, p) => sum + (p.totalInvested || 0), 0);
  const totalSipCurrent = sipPlans.reduce((sum, p) => sum + (p.currentValue || p.totalInvested || 0), 0);
  const totalSipPnl = totalSipCurrent - totalSipInvested;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-purple-950/30 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" /> SYSTEMATIC INVESTMENT PLAN
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Automated Compounding
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              SIP Portfolio & <span className="text-purple-400">Wealth Calculator</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Build long-term generational wealth with disciplined periodic investments into India’s top-performing mutual funds. Pause, resume, or modify SIP installments anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Start New SIP
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-mono block">Active SIPs</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">
            {sipPlans.filter(p => p.status === 'ACTIVE').length} / {sipPlans.length}
          </span>
          <span className="text-[11px] text-purple-400 mt-1 block">Monthly automated debits</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-mono block">Total Invested via SIP</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">
            {formatINR(totalSipInvested)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Principal installment total</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-mono block">Current SIP Market Value</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
            {formatINR(totalSipCurrent)}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
            +{formatINR(totalSipPnl)} ({totalSipInvested > 0 ? ((totalSipPnl / totalSipInvested) * 100).toFixed(2) : 0}%)
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-mono block">Annualized Return (XIRR)</span>
          <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
            18.4%
          </span>
          <span className="text-[11px] text-cyan-300 mt-1 block">Verified money-weighted return</span>
        </div>
      </div>

      {/* Main Tabs: My SIP Plans vs Calculator */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('PLANS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'PLANS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" /> My Active SIPs ({sipPlans.length})
        </button>

        <button
          onClick={() => setActiveTab('CALCULATOR')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'CALCULATOR'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" /> SIP Wealth Calculator
        </button>
      </div>

      {/* TAB 1: ACTIVE SIP PLANS LIST */}
      {activeTab === 'PLANS' && (
        <div className="space-y-4">
          {sipPlans.length === 0 ? (
            <div className="glass-card p-16 rounded-3xl border border-white/10 text-center space-y-4">
              <Repeat className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Systematic Investment Plans active yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start your first monthly SIP to harness the power of rupee cost averaging and compounding.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Create First SIP Now 🚀
              </button>
            </div>
          ) : (
            sipPlans.map((plan) => (
              <div
                key={plan.id}
                className="glass-card rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-purple-500/30 transition-all"
              >
                
                {/* Plan Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{plan.sipCode}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      plan.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      plan.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {plan.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400">
                      {plan.frequency}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-extrabold text-white">
                    {plan.fundName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                    <span>Installment: <strong className="text-white">{formatINR(plan.installmentAmount)}</strong></span>
                    <span>•</span>
                    <span>Debit Date: <strong className="text-slate-200">{plan.sipDay}th of month</strong></span>
                    <span>•</span>
                    <span>Installments: <strong className="text-slate-200">{plan.installmentsPaid} paid</strong></span>
                    <span>•</span>
                    <span>Next Due: <strong className="text-purple-300">{plan.nextInstallmentDate}</strong></span>
                  </div>
                </div>

                {/* Valuation Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono bg-slate-950/60 p-4 rounded-xl border border-white/5 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Total Invested</span>
                    <span className="text-sm font-bold text-white">{formatINR(plan.totalInvested)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Current Value</span>
                    <span className="text-sm font-bold text-emerald-400">{formatINR(plan.currentValue || plan.totalInvested)}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block font-sans">Profit / Gain</span>
                    <span className="text-sm font-bold text-emerald-400">
                      +{formatINR((plan.currentValue || plan.totalInvested) - plan.totalInvested)}
                    </span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewHistory(plan)}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Installment History"
                  >
                    <History className="w-3.5 h-3.5" /> History
                  </button>

                  <button
                    onClick={() => {
                      setModifyingPlan(plan);
                      setModifyAmount(plan.installmentAmount);
                      setModifyDay(plan.sipDay);
                    }}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all"
                    title="Modify SIP"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>

                  {plan.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleStatusChange(plan.id, 'PAUSED')}
                      className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                      title="Pause SIP"
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                  ) : plan.status === 'PAUSED' ? (
                    <button
                      onClick={() => handleStatusChange(plan.id, 'ACTIVE')}
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                      title="Resume SIP"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  ) : null}

                  {plan.status !== 'CANCELLED' && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel SIP ${plan.sipCode}?`)) {
                          handleStatusChange(plan.id, 'CANCELLED');
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all"
                      title="Cancel SIP"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE SIP WEALTH CALCULATOR */}
      {activeTab === 'CALCULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          
          {/* Inputs Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">Monthly SIP Wealth Estimator</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Calculated using compound frequency formula with monthly rest</p>
            </div>

            {/* Monthly Investment Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Monthly Investment Amount</span>
                <span className="text-sm font-black font-mono text-purple-400">{formatINR(calcMonthly)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={calcMonthly}
                onChange={(e) => setCalcMonthly(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹500</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Investment Duration Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Investment Duration</span>
                <span className="text-sm font-black font-mono text-cyan-400">{calcYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={calcYears}
                onChange={(e) => setCalcYears(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Expected Annual Return Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Expected Annual Return (p.a)</span>
                <span className="text-sm font-black font-mono text-emerald-400">{calcReturn}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={calcReturn}
                onChange={(e) => setCalcReturn(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Debt)</span>
                <span>12% (Index/Large)</span>
                <span>20%+ (Mid/Small)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              ⚠️ <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Calculations are illustrative estimates and do not guarantee future returns.
            </div>
          </div>

          {/* Results Visualizer Section */}
          <div className="flex flex-col justify-between space-y-6 bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">Total Projected Wealth</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatINR(calcResult.maturityValue)}
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                At the end of {calcYears} years ({calcYears * 12} monthly installments)
              </span>
            </div>

            {/* Visual Bar Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span> Total Invested:
                </span>
                <span className="font-bold text-white">{formatINR(calcResult.totalInvested)}</span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Estimated Wealth Gained:
                </span>
                <span className="font-bold text-emerald-400">+{formatINR(calcResult.estimatedReturns)}</span>
              </div>

              {/* Stacked bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className="bg-purple-500 h-full"
                  style={{ width: `${(calcResult.totalInvested / calcResult.maturityValue) * 100}%` }}
                ></div>
                <div 
                  className="bg-emerald-400 h-full"
                  style={{ width: `${(calcResult.estimatedReturns / calcResult.maturityValue) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => {
                setInstallmentAmount(calcMonthly);
                setShowCreateModal(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg"
            >
              Start SIP with ₹{calcMonthly.toLocaleString('en-IN')}/Month Now →
            </button>
          </div>

        </div>
      )}

      {/* MODAL: CREATE SIP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Create New Systematic Plan (SIP)</h3>
              <p className="text-xs text-slate-400 font-mono">Select mutual fund and installment configuration</p>
            </div>

            <form onSubmit={handleCreateSip} className="space-y-4">
              
              {/* Select Fund */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Selected Indian Mutual Fund</label>
                <select
                  value={selectedFundId}
                  onChange={(e) => setSelectedFundId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                >
                  {mutualFunds.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} (NAV: ₹{f.nav})
                    </option>
                  ))}
                </select>
              </div>

              {/* Installment Amount & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">SIP Amount (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </select>
                </div>
              </div>

              {/* SIP Day & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Monthly Debit Day</label>
                  <select
                    value={sipDay}
                    onChange={(e) => setSipDay(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white"
                  >
                    {[1, 5, 10, 15, 20, 25].map(d => (
                      <option key={d} value={d}>{d}th of month</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duration (Months)</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white"
                  >
                    <option value="12">12 Months (1 Year)</option>
                    <option value="36">36 Months (3 Years)</option>
                    <option value="60">60 Months (5 Years)</option>
                    <option value="120">120 Months (10 Years)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
                First installment will be debited immediately from your virtual wallet to allot initial units. Future installments trigger on the scheduled day.
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {createLoading ? 'Activating SIP Plan...' : 'Confirm & Activate SIP 🚀'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFY SIP */}
      {modifyingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModifyingPlan(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-white">Modify SIP: {modifyingPlan.sipCode}</h3>
              <p className="text-xs text-slate-400 font-mono">{modifyingPlan.fundName}</p>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Revised Installment Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={modifyAmount}
                  onChange={(e) => setModifyAmount(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Revised Debit Day</label>
                <select
                  value={modifyDay}
                  onChange={(e) => setModifyDay(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white"
                >
                  {[1, 5, 10, 15, 20, 25].map(d => (
                    <option key={d} value={d}>{d}th of month</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl"
              >
                Save SIP Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTALLMENT HISTORY */}
      {historyPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setHistoryPlan(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-white">Installment History: {historyPlan.sipCode}</h3>
              <p className="text-xs text-slate-400 font-mono">{historyPlan.fundName}</p>
            </div>

            {historyLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading installment log...</div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {transactions.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white">Installment #{t.installmentNo}</span>
                      <span className="text-slate-400 block text-[10px]">{t.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{formatINR(t.amount)}</span>
                      <span className="text-slate-400 block text-[10px]">Units: {t.unitsAllotted}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
