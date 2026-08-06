import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface OrdersViewProps {
  orders: any[];
}

export const OrdersView: React.FC<OrdersViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');

  const transactions = [
    {
      date: "2026-05-15 10:30",
      txId: "T-98765432",
      description: "Deposit from Bank Account",
      type: "Deposit",
      status: "COMPLETED",
      debit: "",
      credit: "₹10,000.00"
    },
    {
      date: "2026-05-15 14:15",
      txId: "T-98765433",
      description: "Purchase 100 shares RELIANCE @ ₹2,455.70",
      type: "Buy",
      status: "EXECUTED",
      debit: "₹2,45,570.00",
      credit: ""
    },
    {
      date: "2026-05-16 09:45",
      txId: "T-98765434",
      description: "Sale 50 shares TCS @ ₹3,410.90",
      type: "Sell",
      status: "EXECUTED",
      debit: "",
      credit: "₹1,70,545.00"
    },
    {
      date: "2026-05-17 11:00",
      txId: "T-98765435",
      description: "Dividend Payment - INFY",
      type: "Dividend",
      status: "PAID",
      debit: "",
      credit: "₹1,250.00"
    },
    {
      date: "2026-05-18 16:30",
      txId: "T-98765436",
      description: "Purchase 20 shares HDFCBANK @ ₹1,642.15",
      type: "Buy",
      status: "EXECUTED",
      debit: "₹32,843.00",
      credit: ""
    },
    {
      date: "2026-05-19 08:00",
      txId: "T-98765437",
      description: "Bank Transfer",
      type: "Withdrawal",
      status: "PENDING",
      debit: "₹5,000.00",
      credit: ""
    }
  ];

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.txId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 py-2.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="glass-input py-2 text-xs text-white"
          >
            <option className="bg-slate-900">Last 30 Days</option>
            <option className="bg-slate-900">Last 90 Days</option>
            <option className="bg-slate-900">Year to Date (YTD)</option>
          </select>

          <select className="glass-input py-2 text-xs text-white">
            <option className="bg-slate-900">All Transaction Types</option>
            <option className="bg-slate-900">Buy Orders</option>
            <option className="bg-slate-900">Sell Orders</option>
            <option className="bg-slate-900">Dividends</option>
          </select>

          <button className="glass-input py-2 px-3 text-xs text-slate-300 flex items-center gap-1.5 hover:text-white">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/60 font-semibold">
                <th className="p-4">Date ↕</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Debit</th>
                <th className="p-4 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredTransactions.map((t) => (
                <tr key={t.txId} className="hover:bg-white/5 transition-colors font-mono">
                  <td className="p-4 text-slate-300">{t.date}</td>
                  <td className="p-4 font-bold text-cyan-300">{t.txId}</td>
                  <td className="p-4 font-sans font-medium text-white">{t.description}</td>
                  <td className="p-4 text-slate-300 font-sans">{t.type}</td>
                  <td className="p-4">
                    <span className={
                      t.status === 'PENDING' ? 'badge-status-pending' : 'badge-status-completed'
                    }>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-rose-400">{t.debit}</td>
                  <td className="p-4 text-right font-bold text-emerald-400">{t.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
