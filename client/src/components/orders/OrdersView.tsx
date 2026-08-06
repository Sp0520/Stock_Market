import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Clock, Download } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface OrdersViewProps {
  orders: any[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'EXECUTED' | 'OPEN' | 'REJECTED' | 'TRADEBOOK'>('EXECUTED');

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'TRADEBOOK') return true;
    return o.status === activeTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          {(['EXECUTED', 'OPEN', 'REJECTED', 'TRADEBOOK'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'gradient-btn text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'EXECUTED' && '✅ Executed Orders'}
              {tab === 'OPEN' && '⏳ Open Orders'}
              {tab === 'REJECTED' && '❌ Cancelled / Rejected'}
              {tab === 'TRADEBOOK' && '📜 Trade Book & Contract Notes'}
            </button>
          ))}
        </div>

        <button className="gradient-btn py-2 px-4 text-xs font-bold">
          <Download className="w-4 h-4" /> Download Contract Note (PDF)
        </button>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            {activeTab} ({filteredOrders.length})
          </h3>
          <span className="text-xs text-slate-400">NSE / BSE Trade Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/60 font-semibold">
                <th className="p-4">Time</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Instrument</th>
                <th className="p-4">Type</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Statutory Charges</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{o.time}</td>
                    <td className="p-4 font-mono font-bold text-cyan-300">{o.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {o.symbol} <span className="badge-exchange">{o.exchange}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{o.orderCategory}</td>
                    <td className="p-4 text-right font-mono font-bold text-white">{o.qty}</td>
                    <td className="p-4 text-right font-mono text-white">{formatINR(o.price)}</td>
                    <td className="p-4 text-right font-mono text-cyan-300">₹{o.charges ? o.charges.toFixed(2) : '25.00'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        o.status === 'EXECUTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {o.status === 'EXECUTED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs text-slate-400">
                    No orders found under {activeTab}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
