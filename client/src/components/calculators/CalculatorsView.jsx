import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, PieChart, Layers, 
  ArrowUpRight, RefreshCw, SlidersHorizontal, Info, ShieldAlert 
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export const CalculatorsView = () => {
  const [activeCalc, setActiveCalc] = useState('SIP'); // SIP, LUMPSUM, SWP, STEP_UP, COMPOUND

  // 1. SIP Calculator Inputs
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12.0);

  // 2. Lumpsum Calculator Inputs
  const [lumpInvest, setLumpInvest] = useState(100000);
  const [lumpYears, setLumpYears] = useState(5);
  const [lumpRate, setLumpRate] = useState(12.0);

  // 3. SWP Calculator Inputs
  const [swpInitial, setSwpInitial] = useState(1000000);
  const [swpMonthlyWithdrawal, setSwpMonthlyWithdrawal] = useState(8000);
  const [swpYears, setSwpYears] = useState(10);
  const [swpRate, setSwpRate] = useState(8.5);

  // 4. Step-up SIP Calculator Inputs
  const [stepInitialMonthly, setStepInitialMonthly] = useState(10000);
  const [stepAnnualStepUp, setStepAnnualStepUp] = useState(10); // 10% step-up each year
  const [stepYears, setStepYears] = useState(10);
  const [stepRate, setStepRate] = useState(12.0);

  // 5. Compound Interest Calculator Inputs
  const [ciPrincipal, setCiPrincipal] = useState(50000);
  const [ciRate, setCiRate] = useState(10.0);
  const [ciYears, setCiYears] = useState(5);
  const [ciFreq, setCiFreq] = useState(12); // Monthly compounding

  // --- Calculations ---

  // Standard SIP: M = P * (( (1 + i)^n - 1 ) / i) * (1 + i)
  const calcStandardSip = () => {
    const i = sipRate / 12 / 100;
    const n = sipYears * 12;
    const totalInvested = sipMonthly * n;
    const maturity = sipMonthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = maturity - totalInvested;
    return {
      totalInvested: Math.round(totalInvested),
      returns: Math.round(returns),
      maturity: Math.round(maturity)
    };
  };

  // Lumpsum: M = P * (1 + r/100)^t
  const calcLumpsum = () => {
    const maturity = lumpInvest * Math.pow(1 + lumpRate / 100, lumpYears);
    const returns = maturity - lumpInvest;
    return {
      totalInvested: Math.round(lumpInvest),
      returns: Math.round(returns),
      maturity: Math.round(maturity)
    };
  };

  // SWP Simulation
  const calcSwp = () => {
    const i = swpRate / 12 / 100;
    const n = swpYears * 12;
    let balance = swpInitial;
    let totalWithdrawn = 0;

    for (let m = 0; m < n; m++) {
      balance += balance * i;
      balance -= swpMonthlyWithdrawal;
      totalWithdrawn += swpMonthlyWithdrawal;
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    return {
      totalInvested: Math.round(swpInitial),
      totalWithdrawn: Math.round(totalWithdrawn),
      finalBalance: Math.round(balance),
      totalValue: Math.round(totalWithdrawn + balance)
    };
  };

  // Step-up SIP: annual increment
  const calcStepUpSip = () => {
    const i = stepRate / 12 / 100;
    let currentMonthly = stepInitialMonthly;
    let totalInvested = 0;
    let accumulated = 0;

    for (let y = 0; y < stepYears; y++) {
      for (let m = 0; m < 12; m++) {
        totalInvested += currentMonthly;
        // Remaining months until end of tenure
        const remainingMonths = (stepYears * 12) - (y * 12 + m);
        accumulated += currentMonthly * Math.pow(1 + i, remainingMonths);
      }
      currentMonthly += (currentMonthly * (stepAnnualStepUp / 100));
    }

    const returns = accumulated - totalInvested;
    return {
      totalInvested: Math.round(totalInvested),
      returns: Math.round(returns),
      maturity: Math.round(accumulated)
    };
  };

  // Compound Interest: A = P * (1 + r / (100 * k))^(k * t)
  const calcCompoundInterest = () => {
    const maturity = ciPrincipal * Math.pow(1 + (ciRate / (100 * ciFreq)), ciFreq * ciYears);
    const interest = maturity - ciPrincipal;
    return {
      principal: Math.round(ciPrincipal),
      interest: Math.round(interest),
      maturity: Math.round(maturity)
    };
  };

  const sipRes = calcStandardSip();
  const lumpRes = calcLumpsum();
  const swpRes = calcSwp();
  const stepRes = calcStepUpSip();
  const ciRes = calcCompoundInterest();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-blue-950/30 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> INDIAN WEALTH FINANCIAL CALCULATORS
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Accurate Mathematical Models
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Investment <span className="text-cyan-400">Calculators</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Plan your financial milestones with precision. Estimate maturity wealth for Regular SIP, Lumpsum, SWP retirement withdrawals, Step-Up SIPs, and Compounding interest.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Mode Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {[
          { id: 'SIP', label: 'SIP Calculator' },
          { id: 'LUMPSUM', label: 'Lumpsum Calculator' },
          { id: 'SWP', label: 'SWP Calculator' },
          { id: 'STEP_UP', label: 'Step-up SIP' },
          { id: 'COMPOUND', label: 'Compound Interest' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCalc(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeCalc === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CALCULATOR 1: SIP */}
      {activeCalc === 'SIP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Regular Monthly SIP</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Monthly Investment</span>
                <span className="font-mono font-bold text-cyan-400">{formatINR(sipMonthly)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Investment Period (Years)</span>
                <span className="font-mono font-bold text-cyan-400">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                value={sipYears}
                onChange={(e) => setSipYears(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Annual Return Rate</span>
                <span className="font-mono font-bold text-emerald-400">{sipRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Estimated Total Maturity Value</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatINR(sipRes.maturity)}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Invested:</span>
                <span className="text-white font-bold">{formatINR(sipRes.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Returns:</span>
                <span className="text-emerald-400 font-bold">+{formatINR(sipRes.returns)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="bg-cyan-500 h-full" style={{ width: `${(sipRes.totalInvested / sipRes.maturity) * 100}%` }}></div>
                <div className="bg-emerald-400 h-full" style={{ width: `${(sipRes.returns / sipRes.maturity) * 100}%` }}></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              *Calculated with formula: M = P × [((1+i)^n - 1) / i] × (1+i). Mutual fund investments are subject to market risks.
            </p>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: LUMPSUM */}
      {activeCalc === 'LUMPSUM' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Lumpsum (One-Time) Investment</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Total One-Time Investment</span>
                <span className="font-mono font-bold text-cyan-400">{formatINR(lumpInvest)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="5000000"
                step="5000"
                value={lumpInvest}
                onChange={(e) => setLumpInvest(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Time Horizon (Years)</span>
                <span className="font-mono font-bold text-cyan-400">{lumpYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={lumpYears}
                onChange={(e) => setLumpYears(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Annual CAGR</span>
                <span className="font-mono font-bold text-emerald-400">{lumpRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={lumpRate}
                onChange={(e) => setLumpRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Projected Maturity Wealth</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatINR(lumpRes.maturity)}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Invested:</span>
                <span className="text-white font-bold">{formatINR(lumpRes.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Capital Gain:</span>
                <span className="text-emerald-400 font-bold">+{formatINR(lumpRes.returns)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="bg-cyan-500 h-full" style={{ width: `${(lumpRes.totalInvested / lumpRes.maturity) * 100}%` }}></div>
                <div className="bg-emerald-400 h-full" style={{ width: `${(lumpRes.returns / lumpRes.maturity) * 100}%` }}></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              *Calculated with formula: \(M = P \times (1 + r/100)^t\).
            </p>
          </div>
        </div>
      )}

      {/* CALCULATOR 3: SWP */}
      {activeCalc === 'SWP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Systematic Withdrawal Plan (SWP)</h3>
            <p className="text-xs text-slate-400">Ideal for retirement monthly cash flow while capital stays invested</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Initial Corpus Invested</span>
                <span className="font-mono font-bold text-cyan-400">{formatINR(swpInitial)}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="20000000"
                step="50000"
                value={swpInitial}
                onChange={(e) => setSwpInitial(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Monthly Withdrawal</span>
                <span className="font-mono font-bold text-purple-400">{formatINR(swpMonthlyWithdrawal)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="150000"
                step="1000"
                value={swpMonthlyWithdrawal}
                onChange={(e) => setSwpMonthlyWithdrawal(parseInt(e.target.value))}
                className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Withdrawal Tenure (Years)</span>
                <span className="font-mono font-bold text-cyan-400">{swpYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={swpYears}
                onChange={(e) => setSwpYears(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Annual Fund Return</span>
                <span className="font-mono font-bold text-emerald-400">{swpRate}%</span>
              </div>
              <input
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={swpRate}
                onChange={(e) => setSwpRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Total Amount Withdrawn</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-purple-400 mt-1">
                {formatINR(swpRes.totalWithdrawn)}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Corpus:</span>
                <span className="text-white font-bold">{formatINR(swpRes.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Final Remaining Portfolio Value:</span>
                <span className="text-emerald-400 font-bold">{formatINR(swpRes.finalBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cumulative Value (Withdrawn + Left):</span>
                <span className="text-cyan-400 font-bold">{formatINR(swpRes.totalValue)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              SWP allows you to withdraw a fixed income every month while your remaining mutual fund units continue to compound.
            </p>
          </div>
        </div>
      )}

      {/* CALCULATOR 4: STEP-UP SIP */}
      {activeCalc === 'STEP_UP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Step-up (Top-up) SIP</h3>
            <p className="text-xs text-slate-400">Increase SIP every year inline with salary increments</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Starting Monthly Investment</span>
                <span className="font-mono font-bold text-cyan-400">{formatINR(stepInitialMonthly)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={stepInitialMonthly}
                onChange={(e) => setStepInitialMonthly(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Annual Step-up Percentage (%)</span>
                <span className="font-mono font-bold text-purple-400">{stepAnnualStepUp}% per year</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={stepAnnualStepUp}
                onChange={(e) => setStepAnnualStepUp(parseInt(e.target.value))}
                className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tenure (Years)</span>
                <span className="font-mono font-bold text-cyan-400">{stepYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={stepYears}
                onChange={(e) => setStepYears(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Return Rate (CAGR)</span>
                <span className="font-mono font-bold text-emerald-400">{stepRate}%</span>
              </div>
              <input
                type="range"
                min="6"
                max="25"
                step="0.5"
                value={stepRate}
                onChange={(e) => setStepRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Accelerated Step-up Maturity</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatINR(stepRes.maturity)}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount Invested:</span>
                <span className="text-white font-bold">{formatINR(stepRes.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wealth Gain from Stepping Up:</span>
                <span className="text-emerald-400 font-bold">+{formatINR(stepRes.returns)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="bg-purple-500 h-full" style={{ width: `${(stepRes.totalInvested / stepRes.maturity) * 100}%` }}></div>
                <div className="bg-emerald-400 h-full" style={{ width: `${(stepRes.returns / stepRes.maturity) * 100}%` }}></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Stepping up your monthly SIP by just {stepAnnualStepUp}% each year creates dramatically higher wealth than a flat SIP!
            </p>
          </div>
        </div>
      )}

      {/* CALCULATOR 5: COMPOUND INTEREST */}
      {activeCalc === 'COMPOUND' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white">Compound Interest Calculator</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Principal Amount (₹)</span>
                <span className="font-mono font-bold text-cyan-400">{formatINR(ciPrincipal)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="2000000"
                step="1000"
                value={ciPrincipal}
                onChange={(e) => setCiPrincipal(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Annual Interest Rate</span>
                <span className="font-mono font-bold text-emerald-400">{ciRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.25"
                value={ciRate}
                onChange={(e) => setCiRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Time Period (Years)</span>
                <span className="font-mono font-bold text-cyan-400">{ciYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={ciYears}
                onChange={(e) => setCiYears(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Compounding Frequency</label>
              <select
                value={ciFreq}
                onChange={(e) => setCiFreq(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-white"
              >
                <option value="1">Annually (1 time/year)</option>
                <option value="2">Semi-Annually (2 times/year)</option>
                <option value="4">Quarterly (4 times/year)</option>
                <option value="12">Monthly (12 times/year)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Maturity Amount</span>
              <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatINR(ciRes.maturity)}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Amount:</span>
                <span className="text-white font-bold">{formatINR(ciRes.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Compound Interest Earned:</span>
                <span className="text-emerald-400 font-bold">+{formatINR(ciRes.interest)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Formula: A = P × [1 + r / (100 × k)]^(k × t). Albert Einstein famously called compound interest the 8th wonder of the world.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
