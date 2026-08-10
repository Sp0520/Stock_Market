import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, FileText } from 'lucide-react';
import { fetchTransactions, fetchPortfolio } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

export const OrdersView = () => {
  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); // TRANSACTIONS or ORDERS
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const txs = await fetchTransactions();
      setTransactions(txs);

      const port = await fetchPortfolio();
      setOrders(port.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Please log in to view transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Retrieving trade history logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto my-10 space-y-4">
        <h3 className="text-lg font-bold text-rose-400">🔒 Login Required</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must be logged in to view your secure orders and transaction history.
        </p>
      </div>
    );
  }

  // Filter Transaction records
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.payment_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedType === 'BUY') matchesType = t.debit > 0 && t.description.toLowerCase().includes('bought');
    else if (selectedType === 'SELL') matchesType = t.credit > 0 && t.description.toLowerCase().includes('sold');
    else if (selectedType === 'DEPOSIT') matchesType = t.credit > 0 && t.description.toLowerCase().includes('deposit');
    else if (selectedType === 'WITHDRAW') matchesType = t.debit > 0 && t.description.toLowerCase().includes('withdrawal');

    return matchesSearch && matchesType;
  });

  // Filter Order records
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedType === 'BUY') matchesType = o.type === 'BUY';
    else if (selectedType === 'SELL') matchesType = o.type === 'SELL';

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Trade Book & Ledgers
          </h2>
          <p className="text-xs text-slate-400">Full logs of cash transactions and executed exchange orders</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TRANSACTIONS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            💰 Wallet Transactions
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ORDERS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            📋 Executed Orders
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'TRANSACTIONS' ? "Search by description, transaction ID..." : "Search by symbol, order ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 py-2.5 text-xs text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="glass-input py-2 text-xs text-white"
          >
            <option value="ALL" className="bg-slate-900">All Transaction Types</option>
            <option value="BUY" className="bg-slate-900">Buy Trades</option>
            <option value="SELL" className="bg-slate-900">Sell Trades</option>
            {activeTab === 'TRANSACTIONS' && (
              <>
                <option value="DEPOSIT" className="bg-slate-900">Cash Deposits</option>
                <option value="WITHDRAW" className="bg-slate-900">Cash Withdrawals</option>
              </>
            )}
          </select>

          <button 
            onClick={loadLogs}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
            title="Refresh history logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tables content */}
      <div className="glass-card overflow-hidden">
        {activeTab === 'TRANSACTIONS' ? (
          /* WALLET TRANSACTIONS LEDGER */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-900/60 font-semibold">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4 font-sans">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Debit (Out)</th>
                  <th className="p-4 text-right">Credit (In)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-sans font-medium">No transactions matched your filters</td>
                  </tr>
                ) : (
                  filteredTxs.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-slate-400">{new Date(t.payment_date).toLocaleString('en-IN')}</td>
                      <td className="p-4 font-bold text-cyan-300">{t.payment_id}</td>
                      <td className="p-4 font-sans font-bold text-white">{t.description}</td>
                      <td className="p-4">
                        <span className={t.status === 'FAILED' ? 'badge-status-pending text-rose-400 bg-rose-500/10 border-rose-500/20' : 'badge-status-completed'}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-rose-400">
                        {t.debit > 0 ? `₹${parseFloat(t.debit).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-400">
                        {t.credit > 0 ? `₹${parseFloat(t.credit).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* EXECUTED ORDERS LOG */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider bg-slate-900/60 font-semibold">
                  <th className="p-4">Execution Time</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Asset Symbol</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Shares</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Charges</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500 font-sans font-medium">No executed orders matched your filters</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const isBuy = o.type === 'BUY';
                    return (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-slate-400">{new Date(o.time).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-bold text-cyan-300">{o.id}</td>
                        <td className="p-4 font-sans font-extrabold text-white">{o.symbol}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {o.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{o.orderCategory}</td>
                        <td className="p-4 text-right text-slate-200 font-bold">{o.qty}</td>
                        <td className="p-4 text-right text-slate-200 font-bold">₹{o.price.toFixed(2)}</td>
                        <td className="p-4 text-right text-slate-400">₹{o.charges.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className="badge-status-completed">{o.status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
export default OrdersView;
