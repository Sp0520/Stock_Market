import React, { useState, useEffect } from 'react';
import { 
  PieChart, Search, SlidersHorizontal, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Shield, Award, Layers, CheckCircle2, 
  ChevronRight, X, Info, Plus, Repeat, Calendar 
} from 'lucide-react';
import { fetchMutualFunds, fetchMutualFundDetails, investMutualFund, createSipPlan } from '../../services/api.js';
import { formatINR, formatPercent } from '../../utils/formatters.js';

export const MutualFundsView = ({ onStartSipWithFund }) => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('returns3y'); // returns1y, returns3y, returns5y, rating, aum
  
  // Selected Fund Details Modal
  const [detailFund, setDetailFund] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Compare Funds Drawer / Modal
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Invest / Lumpsum Modal
  const [investModalFund, setInvestModalFund] = useState(null);
  const [investAmount, setInvestAmount] = useState(5000);
  const [investLoading, setInvestLoading] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(null);

  // Quick SIP Modal
  const [sipModalFund, setSipModalFund] = useState(null);
  const [sipAmount, setSipAmount] = useState(2000);
  const [sipDay, setSipDay] = useState(10);
  const [sipLoading, setSipLoading] = useState(false);
  const [sipSuccess, setSipSuccess] = useState(null);

  const categories = [
    { id: 'ALL', label: 'All Funds' },
    { id: 'Flexi Cap', label: 'Flexi Cap' },
    { id: 'Large Cap', label: 'Large Cap' },
    { id: 'Mid Cap', label: 'Mid Cap' },
    { id: 'Small Cap', label: 'Small Cap' },
    { id: 'Index Funds', label: 'Index Funds' },
    { id: 'ELSS', label: 'ELSS Tax Saver' },
    { id: 'Hybrid Funds', label: 'Hybrid Funds' },
    { id: 'Debt Funds', label: 'Debt Funds' },
    { id: 'Liquid Funds', label: 'Liquid Funds' }
  ];

  const loadFunds = async () => {
    try {
      setLoading(true);
      const data = await fetchMutualFunds(selectedCategory, searchQuery, sortBy);
      setFunds(data);
    } catch (err) {
      console.error("Failed loading mutual funds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, [selectedCategory, sortBy]);

  const handleOpenDetails = async (fund) => {
    try {
      setLoadingDetail(true);
      setDetailFund(fund); // display immediately
      const full = await fetchMutualFundDetails(fund.id);
      setDetailFund(full);
    } catch (err) {
      console.warn("Failed fetching full fund details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleCompare = (fund) => {
    if (compareList.find(f => f.id === fund.id)) {
      setCompareList(compareList.filter(f => f.id !== fund.id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 mutual funds at once.");
        return;
      }
      setCompareList([...compareList, fund]);
    }
  };

  const handleLumpsumSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to make a simulated Mutual Fund investment.");
      return;
    }
    try {
      setInvestLoading(true);
      const res = await investMutualFund({
        fundId: investModalFund.id,
        amount: parseFloat(investAmount)
      });
      setInvestSuccess(res);
      await loadFunds();
    } catch (err) {
      alert(err.message || "Investment failed");
    } finally {
      setInvestLoading(false);
    }
  };

  const handleQuickSipSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to register a simulated SIP.");
      return;
    }
    try {
      setSipLoading(true);
      const res = await createSipPlan({
        fundId: sipModalFund.id,
        installmentAmount: parseFloat(sipAmount),
        frequency: 'MONTHLY',
        sipDay: parseInt(sipDay, 10),
        durationMonths: 36,
        expectedReturn: 12.00,
        executeFirstNow: true
      });
      setSipSuccess(res);
      await loadFunds();
    } catch (err) {
      alert(err.message || "SIP registration failed");
    } finally {
      setSipLoading(false);
    }
  };

  const filteredFunds = funds.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.fundHouse.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-emerald-950/30 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" /> LIVE AMFI INDIA NAV
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Direct Plans • Zero Commission
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Indian Mutual Funds (<span className="text-emerald-400">Wealth Hub</span>)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Research top Indian mutual fund houses (PPFAS, Quant, SBI, Mirae Asset, HDFC, ICICI). Live daily NAV updates direct from AMFI schemes, verified 1Y/3Y/5Y returns, and instant SIP setup.
            </p>
          </div>

          {/* Compare Funds Button */}
          {compareList.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-4">
              <div className="text-xs">
                <span className="text-slate-400 block font-mono">Selected for Comparison:</span>
                <span className="text-emerald-400 font-bold font-mono">{compareList.length} Funds</span>
              </div>
              <button
                onClick={() => setShowCompareModal(true)}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Compare Now ⚖️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Category Pills & Sort Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by fund name, AMC (e.g. Parag Parikh, Quant)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="returns3y">3-Year Returns (CAGR)</option>
              <option value="returns1y">1-Year Returns</option>
              <option value="returns5y">5-Year Returns</option>
              <option value="rating">Rating (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MUTUAL FUNDS LIST TABLE / CARDS */}
      <div className="space-y-4">
        {filteredFunds.map((fund) => {
          const isComparing = compareList.some(f => f.id === fund.id);
          return (
            <div
              key={fund.id}
              className="glass-card rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
            >
              
              {/* Fund Title & Basic Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {fund.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10">
                    {fund.fundHouse}
                  </span>
                  {fund.isLiveNav && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      AMFI Verified NAV
                    </span>
                  )}
                </div>

                <h3 
                  onClick={() => handleOpenDetails(fund)}
                  className="text-sm md:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {fund.name}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                  <span>AUM: <strong className="text-slate-200">{fund.aum}</strong></span>
                  <span>•</span>
                  <span>Expense: <strong className="text-slate-200">{fund.expenseRatio}</strong></span>
                  <span>•</span>
                  <span>Min SIP: <strong className="text-slate-200">{formatINR(fund.minSip)}</strong></span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">★ {fund.rating} Star</span>
                </div>
              </div>

              {/* NAV & Multi-Year Returns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-right font-mono bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Current NAV</span>
                  <span className="text-sm font-bold text-white">₹{fund.nav}</span>
                  <span className="text-[9px] text-slate-500 block">{fund.navDate}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">1Y Return</span>
                  <span className={`text-xs font-bold ${fund.return1Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{fund.return1Y}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">3Y CAGR</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{fund.return3Y}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">5Y CAGR</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{fund.return5Y}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCompare(fund)}
                  title="Compare Fund"
                  className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold ${
                    isComparing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⚖️
                </button>

                <button
                  onClick={() => handleOpenDetails(fund)}
                  className="py-2.5 px-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  Details
                </button>

                <button
                  onClick={() => {
                    setSipModalFund(fund);
                    setSipAmount(fund.minSip || 1000);
                    setSipSuccess(null);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" /> Start SIP
                </button>

                <button
                  onClick={() => {
                    setInvestModalFund(fund);
                    setInvestAmount(fund.minLumpsum || 5000);
                    setInvestSuccess(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black transition-all shadow-md shadow-emerald-500/20"
                >
                  Invest Lumpsum
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: FUND DETAILS */}
      {detailFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-3xl border border-white/20 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setDetailFund(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {detailFund.category} • {detailFund.fundHouse}
              </span>
              <h2 className="text-xl font-black text-white pt-1">{detailFund.name}</h2>
              <p className="text-xs text-slate-400 font-mono">AMFI Scheme Code: {detailFund.schemeCode || 'N/A'}</p>
            </div>

            {/* NAV Metric Strip */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs text-slate-400 block font-sans">Current AMFI Net Asset Value</span>
                <span className="text-2xl font-black text-white">₹{detailFund.nav}</span>
                <span className="text-[10px] text-slate-500 block">As of {detailFund.navDate}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-sans">1D Day Change</span>
                <span className={`text-base font-bold ${detailFund.return1D >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {detailFund.return1D >= 0 ? '+' : ''}{detailFund.return1D}%
                </span>
              </div>
            </div>

            {/* Returns Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Verified Historical Returns</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">1 Year</span>
                  <span className="font-bold text-emerald-400">+{detailFund.return1Y}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">3 Year CAGR</span>
                  <span className="font-bold text-emerald-400">+{detailFund.return3Y}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">5 Year CAGR</span>
                  <span className="font-bold text-emerald-400">+{detailFund.return5Y}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Benchmark</span>
                  <span className="font-bold text-slate-300 text-[11px] truncate block">{detailFund.benchmark}</span>
                </div>
              </div>
            </div>

            {/* Fund Profile Details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Total Assets Under Mgmt (AUM)</span>
                <span className="text-white font-bold">{detailFund.aum}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Expense Ratio</span>
                <span className="text-white font-bold">{detailFund.expenseRatio}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Exit Load</span>
                <span className="text-slate-300 block font-sans text-[11px] leading-tight">{detailFund.exitLoad || "1% if redeemed within 1 year"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Fund Manager</span>
                <span className="text-white font-bold font-sans">{detailFund.fundManager || "Senior Portfolio Manager"}</span>
              </div>
            </div>

            {/* Portfolio Allocation Sector Breakdown */}
            {detailFund.portfolioAllocation && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Sector Allocation Breakdown</h4>
                <div className="space-y-1.5">
                  {detailFund.portfolioAllocation.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{sec.sector}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${sec.percent}%` }}></div>
                        </div>
                        <span className="font-mono text-slate-400 w-10 text-right">{sec.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={() => {
                  setSipModalFund(detailFund);
                  setSipAmount(detailFund.minSip || 1000);
                  setDetailFund(null);
                }}
                className="flex-1 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all text-center"
              >
                Start Monthly SIP
              </button>
              <button
                onClick={() => {
                  setInvestModalFund(detailFund);
                  setInvestAmount(detailFund.minLumpsum || 5000);
                  setDetailFund(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all text-center shadow-md shadow-emerald-500/20"
              >
                Invest Lumpsum Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: LUMPSUM INVESTMENT */}
      {investModalFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setInvestModalFund(null);
                setInvestSuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">ONE-TIME LUMPSUM PURCHASE</span>
              <h3 className="text-base font-extrabold text-white mt-1">{investModalFund.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Current NAV: ₹{investModalFund.nav}</p>
            </div>

            {investSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Investment Executed!</h4>
                <p className="text-xs text-emerald-300 font-mono">{investSuccess.message}</p>
                <button
                  onClick={() => {
                    setInvestModalFund(null);
                    setInvestSuccess(null);
                  }}
                  className="w-full py-2.5 bg-emerald-500 text-black text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleLumpsumSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Investment Amount (₹)</label>
                  <input
                    type="number"
                    min={investModalFund.minLumpsum || 1000}
                    step="500"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Min: {formatINR(investModalFund.minLumpsum || 1000)}</span>
                    <span>Units to receive: ~{(investAmount / investModalFund.nav).toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exit Load:</span>
                    <span className="font-mono">{investModalFund.exitLoad || "1% within 365 days"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statutory Stamp Duty:</span>
                    <span className="font-mono text-emerald-400">0.005% included</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={investLoading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {investLoading ? 'Processing simulated debit...' : `Confirm Investment of ${formatINR(investAmount)} ⚡`}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL: START SIP */}
      {sipModalFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSipModalFund(null);
                setSipSuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400">START MONTHLY SIP</span>
              <h3 className="text-base font-extrabold text-white mt-1">{sipModalFund.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Automated Recurring Investment</p>
            </div>

            {sipSuccess ? (
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
                <h4 className="text-base font-bold text-white">SIP Created Successfully!</h4>
                <p className="text-xs text-purple-300 font-mono">{sipSuccess.message}</p>
                <button
                  onClick={() => {
                    setSipModalFund(null);
                    setSipSuccess(null);
                  }}
                  className="w-full py-2.5 bg-purple-500 text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickSipSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Monthly SIP Amount (₹)</label>
                  <input
                    type="number"
                    min={sipModalFund.minSip || 500}
                    step="500"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">Min SIP: {formatINR(sipModalFund.minSip || 500)}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Monthly SIP Debit Day</label>
                  <select
                    value={sipDay}
                    onChange={(e) => setSipDay(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-400"
                  >
                    {[1, 5, 10, 15, 20, 25].map(d => (
                      <option key={d} value={d}>{d}th of every month</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
                  First monthly installment of <strong>{formatINR(sipAmount)}</strong> will be debited now, and future installments will be scheduled automatically on the {sipDay}th of each month.
                </div>

                <button
                  type="submit"
                  disabled={sipLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {sipLoading ? 'Registering SIP...' : 'Confirm & Start SIP 🚀'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL: COMPARE FUNDS SIDE-BY-SIDE */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full rounded-3xl border border-white/20 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-black text-white">Compare Mutual Funds</h2>
              <p className="text-xs text-slate-400 font-mono">Head-to-head performance, risk, and fund metrics</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-slate-400 font-sans">Metric</th>
                    {compareList.map(f => (
                      <th key={f.id} className="p-3 text-white font-sans font-bold">
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">AMC / House</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{f.fundHouse}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">Category</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-cyan-400">{f.category}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">Current NAV</td>
                    {compareList.map(f => <td key={f.id} className="p-3 font-bold text-white">₹{f.nav}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">1Y Return</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400 font-bold">+{f.return1Y}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">3Y CAGR</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400 font-bold">+{f.return3Y}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">5Y CAGR</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400 font-bold">+{f.return5Y}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">Expense Ratio</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{f.expenseRatio}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">AUM</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{f.aum}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">Risk Level</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-amber-300 font-sans">{f.riskLevel}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-sans">Min SIP</td>
                    {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{formatINR(f.minSip)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setCompareList([])}
                className="px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                Clear Compare
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
