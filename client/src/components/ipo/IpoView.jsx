import React, { useState, useEffect } from 'react';
import { 
  Rocket, Search, Calendar, CheckCircle2, Clock, AlertCircle, 
  HelpCircle, ShieldCheck, ArrowUpRight, DollarSign, ChevronRight, X 
} from 'lucide-react';
import { fetchIpos, applyIpo, fetchMyIpoApplications, checkIpoAllotment } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

export const IpoView = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OPEN, UPCOMING, CLOSED, LISTED, MY_APPLICATIONS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIpo, setSelectedIpo] = useState(null);
  
  // Apply Modal state
  const [applyModalIpo, setApplyModalIpo] = useState(null);
  const [investorCategory, setInvestorCategory] = useState('RETAIL'); // RETAIL, HNI, EMPLOYEE
  const [lots, setLots] = useState(1);
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);

  // My Applications
  const [myApplications, setMyApplications] = useState([]);

  // Allotment Checker state
  const [allotmentPan, setAllotmentPan] = useState('');
  const [allotmentResult, setAllotmentResult] = useState(null);
  const [checkingAllotment, setCheckingAllotment] = useState(false);

  const loadIpos = async () => {
    try {
      setLoading(true);
      const data = await fetchIpos(activeTab === 'MY_APPLICATIONS' ? 'ALL' : activeTab, searchQuery);
      setIpos(data);

      const token = localStorage.getItem('authToken');
      if (token) {
        const myApps = await fetchMyIpoApplications().catch(() => []);
        setMyApplications(myApps);
      }
    } catch (err) {
      console.error("Failed loading IPO data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIpos();
  }, [activeTab]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!upiId || !upiId.includes('@')) {
      alert("Please enter a valid UPI ID (e.g. rahul@okaxis) to simulate the ASBA payment mandate.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await applyIpo({
        ipoId: applyModalIpo.id,
        investorCategory,
        lots: parseInt(lots, 10),
        upiId
      });
      setApplySuccess(res);
      await loadIpos();
    } catch (err) {
      alert(err.message || "Failed to submit IPO application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllotmentCheck = async (e) => {
    e.preventDefault();
    if (!allotmentPan || allotmentPan.length < 10) {
      alert("Please enter a valid 10-character PAN card number");
      return;
    }
    try {
      setCheckingAllotment(true);
      const res = await checkIpoAllotment(allotmentPan.toUpperCase(), selectedIpo ? selectedIpo.id : ipos[0]?.id);
      setAllotmentResult(res);
    } catch (err) {
      alert("Allotment verification failed: " + err.message);
    } finally {
      setCheckingAllotment(false);
    }
  };

  const filteredIpos = ipos.filter(ipo => {
    if (activeTab !== 'ALL' && activeTab !== 'MY_APPLICATIONS') {
      if (ipo.status !== activeTab) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return ipo.company.toLowerCase().includes(q) || ipo.symbol.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" /> INDIAN PRIMARY MARKET
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                SEBI ASBA / UPI Mandate
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Indian Initial Public Offerings (<span className="text-amber-400">IPOs</span>)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Track upcoming mainboard Indian IPOs, live subscription multiples, Gray Market Premiums (GMP), and submit simulated ASBA applications.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-1.5 max-w-xs text-amber-200/90">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-4 h-4" /> Safe Simulation Notice
            </div>
            <p className="text-[11px] leading-relaxed">
              All applications and UPI mandates are simulated inside your virtual wallet. No real funds are debited from external bank accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-bold scrollbar-none">
          {[
            { id: 'ALL', label: 'All IPOs' },
            { id: 'OPEN', label: '🟢 Open Now' },
            { id: 'UPCOMING', label: '⏳ Upcoming' },
            { id: 'CLOSED', label: '🔒 Closed' },
            { id: 'LISTED', label: '📈 Listed' },
            { id: 'MY_APPLICATIONS', label: `My Applications (${myApplications.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

      </div>

      {/* MY APPLICATIONS VIEW */}
      {activeTab === 'MY_APPLICATIONS' ? (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">My ASBA IPO Applications</h3>
            <span className="text-xs text-slate-400">Total: {myApplications.length} applied</span>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Rocket className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">You have not submitted any simulated IPO applications yet.</p>
              <button
                onClick={() => setActiveTab('OPEN')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
              >
                Browse Open IPOs
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-white/10">
                  <tr>
                    <th className="p-4">Application No</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Lots / Shares</th>
                    <th className="p-4">Amount Blocked</th>
                    <th className="p-4">UPI Mandate</th>
                    <th className="p-4">Allotment Status</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {myApplications.map((app) => (
                    <tr key={app.id || app.applicationNo} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-cyan-400">{app.applicationNo || app.application_no}</td>
                      <td className="p-4 font-sans font-semibold text-white">{app.company}</td>
                      <td className="p-4 text-slate-300">{app.investorCategory || app.investor_category || 'RETAIL'}</td>
                      <td className="p-4 text-slate-200">{app.lots} Lot(s) ({app.shares || app.lots * 38} shares)</td>
                      <td className="p-4 text-emerald-400 font-bold">{formatINR(app.totalAmount || app.total_amount)}</td>
                      <td className="p-4 text-slate-400">{app.upiId || app.upi_id}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          (app.status === 'ALLOTTED') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          (app.status === 'APPLIED') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 font-sans text-[11px]">
                        {new Date(app.appliedAt || app.applied_at || Date.now()).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* IPO CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIpos.map((ipo) => (
            <div
              key={ipo.id}
              className="glass-card rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {ipo.logo || '🚀'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors leading-tight">
                        {ipo.company}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">{ipo.symbol}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    ipo.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' :
                    ipo.status === 'UPCOMING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    ipo.status === 'LISTED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                  }`}>
                    {ipo.status}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Price Band</span>
                    <span className="text-white font-bold">{ipo.issuePrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Lot Size</span>
                    <span className="text-white font-bold">{ipo.lotSize} shares</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Min Investment</span>
                    <span className="text-emerald-400 font-bold">{formatINR(ipo.minInvestment)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Estimated GMP</span>
                    <span className="text-amber-400 font-bold">{ipo.gmp}</span>
                  </div>
                </div>

                {/* Dates & Subscription */}
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3 text-cyan-400" /> Issue Dates:</span>
                    <span className="font-mono text-slate-200">{ipo.openDate} – {ipo.closeDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Listing Date:</span>
                    <span className="font-mono text-slate-200">{ipo.listingDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Subscription:</span>
                    <span className="font-mono font-bold text-cyan-300">{ipo.subscription?.total || 'N/A'}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => setSelectedIpo(ipo)}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all text-center"
                >
                  View Details
                </button>

                {ipo.status === 'OPEN' ? (
                  <button
                    onClick={() => {
                      setApplyModalIpo(ipo);
                      setLots(1);
                      setApplySuccess(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black transition-all shadow-md shadow-amber-500/20 text-center"
                  >
                    Apply Now ⚡
                  </button>
                ) : ipo.status === 'LISTED' ? (
                  <button
                    onClick={() => {
                      setSelectedIpo(ipo);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all text-center"
                  >
                    Listing Gains
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedIpo(ipo)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                  >
                    Bidding Closed
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL: APPLY IPO INTERFACE */}
      {applyModalIpo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-white/20 p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => {
                setApplyModalIpo(null);
                setApplySuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-3xl">{applyModalIpo.logo || '🚀'}</div>
              <div>
                <h3 className="text-lg font-black text-white">{applyModalIpo.company}</h3>
                <p className="text-xs text-slate-400 font-mono">SEBI ASBA Bidding • Price: {applyModalIpo.issuePrice}</p>
              </div>
            </div>

            {applySuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Application Successfully Placed!</h4>
                <p className="text-xs text-emerald-300 font-mono">{applySuccess.message}</p>
                <div className="text-xs text-slate-300 font-mono bg-black/30 p-3 rounded-xl">
                  Application No: <span className="font-bold text-cyan-400">{applySuccess.application?.applicationNo}</span>
                </div>
                <button
                  onClick={() => {
                    setApplyModalIpo(null);
                    setApplySuccess(null);
                    setActiveTab('MY_APPLICATIONS');
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all"
                >
                  View in My Applications
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                
                {/* Investor Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Investor Category</label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                    {['RETAIL', 'HNI', 'EMPLOYEE'].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setInvestorCategory(cat)}
                        className={`py-2 rounded-xl border text-center transition-all ${
                          investorCategory === cat
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Lots */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-300">Number of Lots</label>
                    <span className="text-slate-400 font-mono">1 Lot = {applyModalIpo.lotSize} shares</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={investorCategory === 'RETAIL' ? "13" : "100"}
                      value={lots}
                      onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="text-right text-xs font-mono">
                      <span className="text-slate-400 block">Total Shares</span>
                      <span className="text-white font-bold">{lots * applyModalIpo.lotSize}</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Amount */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cut-Off Bid Price</span>
                    <span className="text-xs font-bold text-white">₹{applyModalIpo.maxPrice}.00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amount to Lien</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatINR(lots * applyModalIpo.lotSize * applyModalIpo.maxPrice)}
                    </span>
                  </div>
                </div>

                {/* UPI Mandate Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">UPI ID for ASBA Mandate Block</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@okaxis, user@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Simulated ASBA: Amount will be held in your demo trading wallet until allotment.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting ASBA Mandate...' : 'Confirm Simulated Application 🚀'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL: IPO DETAILS VIEW */}
      {selectedIpo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-3xl border border-white/20 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedIpo(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="text-4xl">{selectedIpo.logo || '🚀'}</div>
              <div>
                <h2 className="text-xl font-black text-white">{selectedIpo.company}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-cyan-400">{selectedIpo.symbol}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-300 font-mono">Rating: {selectedIpo.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedIpo.description}</p>

            {/* Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Issue Size</span>
                <span className="text-white font-bold">{selectedIpo.issueSize}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Fresh Issue</span>
                <span className="text-white font-bold">{selectedIpo.freshIssue}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Offer for Sale (OFS)</span>
                <span className="text-white font-bold">{selectedIpo.ofs}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Price Band</span>
                <span className="text-white font-bold">{selectedIpo.issuePrice}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Lot Size</span>
                <span className="text-white font-bold">{selectedIpo.lotSize} shares</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Min Investment</span>
                <span className="text-emerald-400 font-bold">{formatINR(selectedIpo.minInvestment)}</span>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Subscription Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">QIB Quota</span>
                  <span className="text-cyan-400 font-bold">{selectedIpo.subscription?.qib || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">NII / HNI</span>
                  <span className="text-cyan-400 font-bold">{selectedIpo.subscription?.nii || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Retail (RII)</span>
                  <span className="text-cyan-400 font-bold">{selectedIpo.subscription?.retail || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Total Issue</span>
                  <span className="text-emerald-400 font-bold">{selectedIpo.subscription?.total || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Gray Market Premium (GMP) Disclaimer Card */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-300 font-bold">Estimated GMP: {selectedIpo.gmp}</span>
                <span className="text-[10px] text-amber-200/70">Unverified Metric</span>
              </div>
              <p className="text-[11px] text-amber-100/70 leading-relaxed">
                {selectedIpo.gmpNote || "GMP is an unofficial market sentiment tracker reported by market watchers and not recognized by SEBI or stock exchanges."}
              </p>
            </div>

            {/* PAN Allotment Checker Tool inside Modal */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulated Allotment Status Checker</h4>
              <form onSubmit={handleAllotmentCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength="10"
                  placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                  value={allotmentPan}
                  onChange={(e) => setAllotmentPan(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={checkingAllotment}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {checkingAllotment ? 'Checking...' : 'Check Status'}
                </button>
              </form>

              {allotmentResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${
                  allotmentResult.status === 'ALLOTTED' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>STATUS: {allotmentResult.status}</span>
                    <span>Shares: {allotmentResult.sharesAllotted}</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-300 font-sans">{allotmentResult.message}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
