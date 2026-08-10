import React, { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCw, FileText, Receipt, X } from 'lucide-react';
import { fetchTransactions, fetchPortfolio } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';
import { Card3D } from '../common/Card3D.jsx';

export const OrdersView = () => {
  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); // TRANSACTIONS or ORDERS
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Order for Receipt Modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Fallback Mock Data for sandbox mode when not logged in
  const getMockTransactions = () => [
    { id: 1, payment_date: new Date(Date.now() - 86400000 * 2).toISOString(), payment_id: "TXN_782192", description: "Deposit via UPI / Netbanking", status: "COMPLETED", debit: 0, credit: 50000 },
    { id: 2, payment_date: new Date(Date.now() - 86400000 * 1.5).toISOString(), payment_id: "TXN_829103", description: "Bought 10 shares of RELIANCE", status: "COMPLETED", debit: 28500, credit: 0 },
    { id: 3, payment_date: new Date(Date.now() - 3600000 * 4).toISOString(), payment_id: "TXN_901234", description: "Withdrawal request processed", status: "PENDING", debit: 5000, credit: 0 },
    { id: 4, payment_date: new Date(Date.now() - 3600000 * 2).toISOString(), payment_id: "TXN_128930", description: "Sold 5 shares of TCS", status: "COMPLETED", debit: 0, credit: 21425 }
  ];

  const getMockOrders = () => [
    { id: "ORD_91823", time: new Date(Date.now() - 86400000 * 1.5).toISOString(), symbol: "RELIANCE", type: "BUY", qty: 10, price: 2850.00, charges: 15.20, status: "EXECUTED", orderCategory: "MARKET" },
    { id: "ORD_72891", time: new Date(Date.now() - 3600000 * 2).toISOString(), symbol: "TCS", type: "SELL", qty: 5, price: 4285.00, charges: 22.40, status: "EXECUTED", orderCategory: "MARKET" }
  ];

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (token) {
        const txs = await fetchTransactions();
        setTransactions(txs);

        const port = await fetchPortfolio();
        setOrders(port.orders || []);
      } else {
        const storedGuest = localStorage.getItem('guestPortfolio');
        if (storedGuest) {
          const guestData = JSON.parse(storedGuest);
          setOrders(guestData.orders || []);
          
          const simulatedTxs = [
            { id: "TXN_INIT", payment_date: new Date(Date.now() - 86400000 * 10).toISOString(), payment_id: "DEP_10001", description: "Welcome Wallet Fund Bonus", status: "COMPLETED", debit: 0, credit: 100000 }
          ];
          
          (guestData.orders || []).forEach((ord, index) => {
            const isBuy = ord.type === 'BUY';
            const amount = ord.qty * ord.price;
            simulatedTxs.push({
              id: `TXN_${index}`,
              payment_date: ord.time,
              payment_id: `TXN_${ord.id.substring(4)}`,
              description: `${isBuy ? 'Bought' : 'Sold'} ${ord.qty} shares of ${ord.symbol}`,
              status: ord.status === 'COMPLETED' ? 'COMPLETED' : 'COMPLETED', // default to completed
              debit: isBuy ? amount + ord.charges : 0,
              credit: isBuy ? 0 : amount - ord.charges
            });
          });
          setTransactions(simulatedTxs);
        } else {
          setTransactions(getMockTransactions());
          setOrders(getMockOrders());
        }
      }
    } catch (err) {
      console.warn("Error loading transaction logs, falling back to mock logs:", err.message);
      setTransactions(getMockTransactions());
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getStatusBadge = (status) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'EXECUTED' || s === 'PAID') {
      return (
        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          Completed
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[0_0_12px_rgba(251,191,36,0.15)]">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[0_0_12px_rgba(244,63,94,0.15)]">
        {status}
      </span>
    );
  };

  // Indian statutory charges calculator matching marketEngine.js
  const calculateChargesBreakdown = (type, qty, price) => {
    const turnover = qty * price;
    const brokerage = Math.min(20, parseFloat((turnover * 0.0003).toFixed(2))); // ₹20 flat or 0.03%
    const stt = parseFloat((turnover * 0.001).toFixed(2)); // STT 0.1%
    const exchangeTurnover = parseFloat((turnover * 0.0000325).toFixed(2));
    const gst = parseFloat(((brokerage + exchangeTurnover) * 0.18).toFixed(2));
    const sebiCharges = parseFloat((turnover * 0.000001).toFixed(2));
    const stampDuty = type === "BUY" ? parseFloat((turnover * 0.00015).toFixed(2)) : 0;
    const totalCharges = parseFloat((brokerage + stt + exchangeTurnover + gst + sebiCharges + stampDuty).toFixed(2));
    
    return {
      turnover,
      brokerage,
      stt,
      exchangeTurnover,
      gst,
      sebiCharges,
      stampDuty,
      totalCharges,
      totalAmount: type === "BUY" ? (turnover + totalCharges) : (turnover - totalCharges)
    };
  };

  // Filter Transaction records
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.payment_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedType === 'BUY') matchesType = t.debit > 0 && t.description.toLowerCase().includes('bought');
    else if (selectedType === 'SELL') matchesType = t.credit > 0 && (t.description.toLowerCase().includes('sold') || t.description.toLowerCase().includes('sell'));
    else if (selectedType === 'DEPOSIT') matchesType = t.credit > 0 && t.description.toLowerCase().includes('deposit');
    else if (selectedType === 'WITHDRAW') matchesType = t.debit > 0 && t.description.toLowerCase().includes('withdraw');

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(t.payment_date) >= new Date(startDate + 'T00:00:00');
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(t.payment_date) <= new Date(endDate + 'T23:59:59');
    }

    return matchesSearch && matchesType && matchesDate;
  });

  // Filter Order records
  const filteredOrders = orders.map((o, idx) => {
    const isBuy = o.type === 'BUY';
    const amount = o.qty * o.price;
    return {
      id: o.id,
      payment_date: o.time,
      payment_id: o.id,
      description: `${isBuy ? 'Bought' : 'Sold'} ${o.qty} shares of ${o.symbol}`,
      type: o.type,
      symbol: o.symbol,
      qty: o.qty,
      price: o.price,
      status: o.status,
      debit: isBuy ? amount + o.charges : 0,
      credit: isBuy ? 0 : amount - o.charges
    };
  }).filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.payment_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedType === 'BUY') matchesType = t.type === 'BUY';
    else if (selectedType === 'SELL') matchesType = t.type === 'SELL';

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(t.payment_date) >= new Date(startDate + 'T00:00:00');
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(t.payment_date) <= new Date(endDate + 'T23:59:59');
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const activeRecords = activeTab === 'TRANSACTIONS' ? filteredTxs : filteredOrders;

  const handleRowClick = (record) => {
    // Check if it is a buy/sell trade to draw itemized receipt
    const desc = record.description.toLowerCase();
    const isTrade = desc.includes('bought') || desc.includes('sold') || desc.includes('shares');
    if (!isTrade) return;

    // Parse values from description or record
    let symbol = record.symbol || "";
    let qty = record.qty || 1;
    let price = record.price || 0;
    let type = record.type || (desc.includes('bought') ? 'BUY' : 'SELL');

    if (!symbol) {
      // Parse description, e.g., "Bought 10 shares of RELIANCE"
      const match = record.description.match(/(Bought|Sold)\s+(\d+)\s+shares\s+of\s+(\w+)/i);
      if (match) {
        qty = parseInt(match[2]);
        symbol = match[3];
        type = match[1].toUpperCase();
        // estimate price
        const grossAmt = record.debit > 0 ? record.debit : record.credit;
        price = grossAmt / qty;
      }
    }

    const breakdown = calculateChargesBreakdown(type, qty, price);
    setSelectedReceiptOrder({
      id: record.payment_id,
      date: record.payment_date,
      symbol,
      qty,
      price,
      type,
      ...breakdown
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Transaction History
          </h2>
          <p className="text-xs text-slate-400">Searchable and date-filtered ledgers of all trading account events</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => { setActiveTab('TRANSACTIONS'); setSelectedType('ALL'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TRANSACTIONS' ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            💰 Wallet Ledger
          </button>
          <button
            onClick={() => { setActiveTab('ORDERS'); setSelectedType('ALL'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ORDERS' ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Executed Orders
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Reference ID, symbol, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 py-2.5 text-xs text-white"
          />
        </div>

        {/* Type Select */}
        <div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full glass-input py-2.5 text-xs text-white"
          >
            <option value="ALL" className="bg-slate-950">All Types</option>
            <option value="BUY" className="bg-slate-950">Buy Orders</option>
            <option value="SELL" className="bg-slate-950">Sell Orders</option>
            {activeTab === 'TRANSACTIONS' && (
              <>
                <option value="DEPOSIT" className="bg-slate-950">Deposits</option>
                <option value="WITHDRAW" className="bg-slate-950">Withdrawals</option>
              </>
            )}
          </select>
        </div>

        {/* Date Ranges */}
        <div className="md:col-span-2 flex items-center gap-3">
          <div className="relative flex-1">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full glass-input pl-10 py-2 text-xs text-white uppercase"
              title="Start Date"
            />
          </div>
          <span className="text-slate-500 text-xs">to</span>
          <div className="relative flex-1">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full glass-input pl-10 py-2 text-xs text-white uppercase"
              title="End Date"
            />
          </div>
          
          <button 
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
              setSelectedType('ALL');
              loadLogs();
            }}
            className="p-2.5 rounded-xl border border-white/5 bg-slate-950/60 hover:bg-white/5 text-slate-300 transition-colors shrink-0"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Unified Table Content */}
      <div className="glass-card overflow-hidden bg-slate-950/10 border border-white/10 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-widest bg-slate-950/80 font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4 font-sans">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Debit (Out)</th>
                <th className="p-4 text-right">Credit (In)</th>
                <th className="p-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {activeRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-sans font-medium">
                    No transactions or orders found matching these filter conditions.
                  </td>
                </tr>
              ) : (
                activeRecords.map((t, idx) => {
                  const isDebit = t.debit > 0;
                  const isCredit = t.credit > 0;
                  
                  // Compute Type text
                  let typeLabel = "TRANSFER";
                  let typeColor = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                  const descLower = t.description.toLowerCase();
                  const isTrade = descLower.includes('bought') || descLower.includes('sold') || descLower.includes('sell');

                  if (descLower.includes('bought')) {
                    typeLabel = "BUY";
                    typeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  } else if (descLower.includes('sold') || descLower.includes('sell')) {
                    typeLabel = "SELL";
                    typeColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                  } else if (descLower.includes('deposit')) {
                    typeLabel = "DEPOSIT";
                    typeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  } else if (descLower.includes('withdraw')) {
                    typeLabel = "WITHDRAW";
                    typeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  }

                  return (
                    <tr 
                      key={t.id || idx} 
                      onClick={() => isTrade && handleRowClick(t)}
                      className={`hover:bg-white/5 transition-colors ${isTrade ? 'cursor-pointer' : ''}`}
                    >
                      <td className="p-4 text-slate-400">{new Date(t.payment_date).toLocaleString('en-IN')}</td>
                      <td className="p-4 font-bold text-cyan-300">{t.payment_id}</td>
                      <td className="p-4 font-sans font-bold text-white">
                        {t.description}
                        {isTrade && (
                          <span className="block md:hidden text-[9px] text-cyan-400 mt-1 font-sans">Tap to view contract note</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="p-4 text-right font-bold text-rose-400">
                        {isDebit ? formatINR(t.debit) : '—'}
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-400">
                        {isCredit ? formatINR(t.credit) : '—'}
                      </td>
                      <td className="p-4 text-center">
                        {isTrade ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRowClick(t); }}
                            className="p-1.5 rounded-lg border border-white/5 bg-slate-950/60 text-cyan-400 hover:bg-cyan-500/10 hover:text-white transition-all"
                            title="View contract note invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Note / Itemized Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <Card3D className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Receipt className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-white text-sm">FinNexa Digital Contract Note</h3>
                  <p className="text-[9px] text-slate-500 font-mono">Invoice Ref: {selectedReceiptOrder.id}</p>
                </div>
              </div>

              {/* Itemized list */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-sans border-b border-white/5 pb-2">
                  <span className="text-slate-400">Security / Asset</span>
                  <span className="text-white font-black">{selectedReceiptOrder.symbol} Equity</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-slate-400">Transaction Type</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                    selectedReceiptOrder.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>{selectedReceiptOrder.type}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Quantity (Shares)</span>
                  <span className="text-white font-bold">{selectedReceiptOrder.qty}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Execution Rate</span>
                  <span className="text-white font-bold">{formatINR(selectedReceiptOrder.price)}</span>
                </div>

                <div className="flex justify-between font-mono border-t border-dashed border-white/10 pt-2 text-slate-200">
                  <span>Gross Turnover</span>
                  <span className="font-extrabold">{formatINR(selectedReceiptOrder.turnover)}</span>
                </div>

                {/* Taxes details */}
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-[10px] font-mono text-slate-500">
                  <div className="flex justify-between">
                    <span>Flat Brokerage (NSE/BSE)</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.brokerage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Securities Transaction Tax (STT 0.1%)</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.stt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Transaction Charge</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.exchangeTurnover)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEBI Turnover Fees</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.sebiCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% of Brokerage & Exchange)</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.gst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamp Duty (Central Gov)</span>
                    <span className="text-slate-300">+{formatINR(selectedReceiptOrder.stampDuty)}</span>
                  </div>
                </div>

                {/* Total levies */}
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Total Levies & Taxes</span>
                  <span>{formatINR(selectedReceiptOrder.totalCharges)}</span>
                </div>

                {/* Grand total amount */}
                <div className="flex justify-between font-mono border-t border-white/10 pt-3 text-sm font-black items-baseline">
                  <span className="text-white">Net Account {selectedReceiptOrder.type === 'BUY' ? 'Debit' : 'Credit'}</span>
                  <span className={selectedReceiptOrder.type === 'BUY' ? 'text-rose-400 text-base' : 'text-emerald-400 text-base'}>
                    {formatINR(selectedReceiptOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[8px] text-slate-600 font-mono italic leading-relaxed">
                  This is a simulated contract note generated by the FinNexa trading core in compliance with Indian exchange levy modeling.
                </p>
              </div>
            </div>
          </Card3D>
        </div>
      )}

    </div>
  );
};
export default OrdersView;
