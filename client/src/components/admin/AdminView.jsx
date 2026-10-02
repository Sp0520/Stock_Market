import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Rocket, PieChart, Layers, History, 
  Megaphone, DollarSign, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, X 
} from 'lucide-react';
import { 
  fetchAdminStats, fetchAdminUsers, updateUserBalance, 
  fetchAdminOrders, fetchAnnouncements, createAnnouncement, 
  fetchIpos, createAdminIpo, updateAdminIpo 
} from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

export const AdminView = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('STATS'); // STATS, USERS, IPOS, ORDERS, ANNOUNCEMENTS

  // Adjust User Balance Modal
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  // Add/Edit IPO Modal
  const [showIpoModal, setShowIpoModal] = useState(false);
  const [editingIpo, setEditingIpo] = useState(null);
  const [ipoForm, setIpoForm] = useState({
    company: '',
    symbol: '',
    issuePrice: '',
    minPrice: 100,
    maxPrice: 120,
    lotSize: 50,
    minInvestment: 6000,
    gmp: '+₹15.00',
    status: 'UPCOMING',
    openDate: '',
    closeDate: '',
    listingDate: '',
    issueSize: '₹1,500 Cr',
    freshIssue: '₹1,000 Cr',
    ofs: '₹500 Cr',
    description: ''
  });

  // Announcement Form Modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');
  const [annCat, setAnnCat] = useState('MARKET_ALERT');
  const [annSev, setAnnSev] = useState('INFO');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sData, uData, oData, aData, iData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAdminUsers().catch(() => []),
        fetchAdminOrders().catch(() => []),
        fetchAnnouncements().catch(() => []),
        fetchIpos('ALL').catch(() => [])
      ]);
      setStats(sData);
      setUsers(uData || []);
      setOrders(oData || []);
      setAnnouncements(aData || []);
      setIpos(iData || []);
    } catch (err) {
      console.error("Admin data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    try {
      await updateUserBalance(balanceModalUser.id, parseFloat(newBalance));
      alert(`Wallet updated for ${balanceModalUser.name}`);
      setBalanceModalUser(null);
      await loadAdminData();
    } catch (err) {
      alert("Failed updating balance: " + err.message);
    }
  };

  const handleIpoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIpo) {
        await updateAdminIpo(editingIpo.id, ipoForm);
        alert("IPO record updated successfully");
      } else {
        await createAdminIpo(ipoForm);
        alert("New IPO created successfully");
      }
      setShowIpoModal(false);
      setEditingIpo(null);
      await loadAdminData();
    } catch (err) {
      alert("Failed saving IPO: " + err.message);
    }
  };

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: annTitle,
        message: annMsg,
        category: annCat,
        severity: annSev
      });
      alert("Announcement published!");
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnMsg('');
      await loadAdminData();
    } catch (err) {
      alert("Failed publishing announcement: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900/90 via-red-950/20 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> PLATFORM GOVERNANCE & ADMIN TERMINAL
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Audit Trail Protected
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Platform Administration (<span className="text-rose-400">Control Panel</span>)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Supervise platform activities, manage Indian IPO records, monitor user account limits, inspect simulated order books, and broadcast system notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {stats?.systemHealth || "ONLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'STATS', label: '📊 System Stats', icon: Layers },
          { id: 'USERS', label: `👥 User Management (${users.length})`, icon: Users },
          { id: 'IPOS', label: `🚀 Manage IPOs (${ipos.length})`, icon: Rocket },
          { id: 'ORDERS', label: `📋 Order Audit (${orders.length})`, icon: History },
          { id: 'ANNOUNCEMENTS', label: `📢 Announcements (${announcements.length})`, icon: Megaphone }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYSTEM STATS */}
      {activeTab === 'STATS' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 font-mono block">Registered Users</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">{stats.totalUsers}</span>
              <span className="text-[11px] text-cyan-400 mt-1 block">Active platform investors</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 font-mono block">Executed Orders</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">{stats.totalOrders}</span>
              <span className="text-[11px] text-emerald-400 mt-1 block">Simulated equity trades</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 font-mono block">Active SIPs Scheduled</span>
              <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">{stats.totalSIPs}</span>
              <span className="text-[11px] text-purple-300 mt-1 block">Recurring installment plans</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 font-mono block">IPO Applications Filed</span>
              <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">{stats.totalIPOs}</span>
              <span className="text-[11px] text-amber-300 mt-1 block">ASBA mandate liens</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Platform Capital Flow</h3>
              <div className="text-3xl font-black font-mono text-emerald-400">{formatINR(stats.totalTurnover)}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Total aggregate transaction volume traded across all simulated user accounts in equities, mutual funds, and IPO bids.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Market Coverage</h3>
              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">Open IPOs:</span>
                  <span className="text-base font-bold text-emerald-400">{stats.activeIposCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Listed IPOs:</span>
                  <span className="text-base font-bold text-purple-400">{stats.listedIposCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mutual Funds:</span>
                  <span className="text-base font-bold text-cyan-400">{stats.totalMutualFundsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px] border-b border-white/10">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">PAN Number</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Activity (Orders/SIP)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-sans font-bold text-white">{u.name}</td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4 text-cyan-400 font-bold">{u.pan}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">{formatINR(u.availableBalance)}</td>
                    <td className="p-4 text-slate-400">{u.ordersCount} orders • {u.sipCount} SIPs</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setBalanceModalUser(u);
                          setNewBalance(u.availableBalance);
                        }}
                        className="py-1 px-3 rounded-lg border border-white/10 hover:bg-white/10 text-cyan-400 text-xs font-sans font-semibold transition-colors"
                      >
                        Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE IPOS */}
      {activeTab === 'IPOS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Indian IPO Catalog Management</h3>
            <button
              onClick={() => {
                setEditingIpo(null);
                setIpoForm({
                  company: '', symbol: '', issuePrice: '₹200 - ₹210', minPrice: 200, maxPrice: 210,
                  lotSize: 70, minInvestment: 14700, gmp: '+₹20.00', status: 'UPCOMING',
                  openDate: '10 Nov 2026', closeDate: '13 Nov 2026', listingDate: '18 Nov 2026',
                  issueSize: '₹1,200 Cr', freshIssue: '₹800 Cr', ofs: '₹400 Cr', description: 'Tech expansion'
                });
                setShowIpoModal(true);
              }}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New IPO
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ipos.map((ipo) => (
              <div key={ipo.id} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{ipo.company}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    ipo.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300' :
                    ipo.status === 'LISTED' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {ipo.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Price: {ipo.issuePrice} • Lot: {ipo.lotSize} • Issue: {ipo.issueSize}
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingIpo(ipo);
                      setIpoForm(ipo);
                      setShowIpoModal(true);
                    }}
                    className="py-1 px-3 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-200"
                  >
                    Edit Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS AUDIT */}
      {activeTab === 'ORDERS' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px] border-b border-white/10">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Trader Name</th>
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {orders.map((o, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-cyan-400">#ORD_{o.id || idx + 101}</td>
                    <td className="p-4 font-sans text-white">{o.userName || 'Investor'}</td>
                    <td className="p-4 font-bold text-slate-200">{o.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{o.order_category}</td>
                    <td className="p-4 text-slate-200">{o.qty}</td>
                    <td className="p-4 text-emerald-400 font-bold">{formatINR(o.price)}</td>
                    <td className="p-4 text-cyan-300 font-bold">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Broadcast Platform Market Notices</h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Broadcast Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl glass-card border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{a.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{a.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BALANCE ADJUSTMENT */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full rounded-3xl border border-white/20 p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setBalanceModalUser(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white">Adjust Virtual Cash Balance</h3>
            <p className="text-xs text-slate-400">User: {balanceModalUser.name}</p>

            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">New Balance (₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl"
              >
                Update Wallet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ANNOUNCEMENT */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl border border-white/20 p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAnnModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white">Create Platform Announcement</h3>

            <form onSubmit={handleAnnounceSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Headline</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Special Muhurat Trading Session Scheduled"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Notice Content</label>
                <textarea
                  value={annMsg}
                  onChange={(e) => setAnnMsg(e.target.value)}
                  placeholder="Details for investor notice..."
                  rows="3"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
              >
                Publish Notice Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
