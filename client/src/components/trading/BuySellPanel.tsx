import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calculator } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface BuySellPanelProps {
  symbol: string;
  exchange: string;
  currentPrice: number;
  availableBalance: number;
  onOrderExecuted: (orderData: any) => void;
}

export const BuySellPanel: React.FC<BuySellPanelProps> = ({
  symbol,
  exchange,
  currentPrice,
  onOrderExecuted
}) => {
  const [activeTab, setActiveTab] = useState<'TICKET' | 'DEPTH' | 'FUNDAMENTALS'>('TICKET');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderCategory, setOrderCategory] = useState<'MARKET' | 'LIMIT' | 'SL' | 'GTT' | 'COVER'>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);
  const [stopLoss, setStopLoss] = useState<number>(parseFloat((currentPrice * 0.95).toFixed(2)));
  const [targetPrice, setTargetPrice] = useState<number>(parseFloat((currentPrice * 1.1).toFixed(2)));
  
  const [charges, setCharges] = useState<any>({
    brokerage: 20,
    stt: 0,
    exchangeTurnover: 0,
    gst: 0,
    stampDuty: 0,
    totalCharges: 0,
    estimatedTotalAmount: 0
  });

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    setLimitPrice(currentPrice);
  }, [currentPrice]);

  useEffect(() => {
    const executionPrice = orderCategory === 'MARKET' ? currentPrice : limitPrice;
    const turnover = quantity * executionPrice;
    const brokerage = Math.min(20, parseFloat((turnover * 0.0003).toFixed(2)));
    const stt = parseFloat((turnover * 0.001).toFixed(2));
    const exchangeTurnover = parseFloat((turnover * 0.0000325).toFixed(2));
    const gst = parseFloat(((brokerage + exchangeTurnover) * 0.18).toFixed(2));
    const stampDuty = orderType === 'BUY' ? parseFloat((turnover * 0.00015).toFixed(2)) : 0;
    const totalCharges = parseFloat((brokerage + stt + exchangeTurnover + gst + stampDuty).toFixed(2));
    const estimatedTotalAmount = orderType === 'BUY' ? turnover + totalCharges : turnover - totalCharges;

    setCharges({
      turnover: parseFloat(turnover.toFixed(2)),
      brokerage,
      stt,
      exchangeTurnover,
      gst,
      stampDuty,
      totalCharges,
      estimatedTotalAmount: parseFloat(estimatedTotalAmount.toFixed(2))
    });
  }, [quantity, limitPrice, currentPrice, orderType, orderCategory]);

  const handleOrderSubmit = () => {
    setIsExecuting(true);
    setTimeout(() => {
      onOrderExecuted({
        symbol,
        exchange,
        type: orderType,
        orderCategory,
        qty: quantity,
        price: orderCategory === 'MARKET' ? currentPrice : limitPrice,
        charges: charges.totalCharges,
        estimatedTotalAmount: charges.estimatedTotalAmount
      });
      setIsExecuting(false);
      setShowConfirmModal(false);
    }, 600);
  };

  const orderBook = {
    bids: [
      { price: parseFloat((currentPrice * 0.999).toFixed(2)), qty: 1500 },
      { price: parseFloat((currentPrice * 0.998).toFixed(2)), qty: 3200 },
      { price: parseFloat((currentPrice * 0.997).toFixed(2)), qty: 8400 }
    ],
    asks: [
      { price: parseFloat((currentPrice * 1.001).toFixed(2)), qty: 2100 },
      { price: parseFloat((currentPrice * 1.002).toFixed(2)), qty: 4500 },
      { price: parseFloat((currentPrice * 1.003).toFixed(2)), qty: 9800 }
    ]
  };

  return (
    <div className="glass-card p-5 space-y-4 relative">
      
      {/* Panel View Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('TICKET')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${activeTab === 'TICKET' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400'}`}
        >
          🎟️ Order Ticket
        </button>
        <button
          onClick={() => setActiveTab('DEPTH')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${activeTab === 'DEPTH' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400'}`}
        >
          📊 Market Depth
        </button>
        <button
          onClick={() => setActiveTab('FUNDAMENTALS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${activeTab === 'FUNDAMENTALS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400'}`}
        >
          📋 Metrics
        </button>
      </div>

      {activeTab === 'TICKET' && (
        <div className="space-y-4">
          {/* Header Tabs (BUY vs SELL) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10">
            <button
              onClick={() => setOrderType('BUY')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                orderType === 'BUY'
                  ? 'btn-3d-green text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>BUY {symbol}</span>
            </button>
            <button
              onClick={() => setOrderType('SELL')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                orderType === 'SELL'
                  ? 'btn-3d-red text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>SELL {symbol}</span>
            </button>
          </div>

          {/* Order Category Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order Type</label>
            <div className="grid grid-cols-5 gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5 text-[11px]">
              {(['MARKET', 'LIMIT', 'SL', 'GTT', 'COVER'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setOrderCategory(cat)}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    orderCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Price Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Quantity (NSE Shares)</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full glass-input-3d font-mono font-bold text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Price (INR ₹)</label>
              <input
                type="number"
                step="0.05"
                disabled={orderCategory === 'MARKET'}
                value={orderCategory === 'MARKET' ? currentPrice : limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
                className="w-full glass-input-3d font-mono font-bold text-white text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Target & Stop Loss */}
          {(orderCategory === 'SL' || orderCategory === 'COVER' || orderCategory === 'GTT') && (
            <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-rose-400">Stop Loss Trigger (₹)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                  className="w-full glass-input-3d py-1.5 font-mono text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-emerald-400">Target Profit (₹)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                  className="w-full glass-input-3d py-1.5 font-mono text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Indian Statutory Charges Breakdown */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-white/5 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                Estimated Charges Breakdown
              </span>
              <span className="text-[10px] text-slate-500">NSE Statutory</span>
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Brokerage (Flat)</span>
                <span className="font-mono">₹{charges.brokerage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STT / CTT (0.1%)</span>
                <span className="font-mono">₹{charges.stt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exchange Fee</span>
                <span className="font-mono">₹{charges.exchangeTurnover.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GST (18%) + Stamp</span>
                <span className="font-mono">₹{(charges.gst + charges.stampDuty).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-sm text-white">
              <span>{orderType === 'BUY' ? 'Total Required Amount' : 'Net Receivable'}</span>
              <span className="font-mono text-cyan-300">{formatINR(charges.estimatedTotalAmount)}</span>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className={`w-full py-3.5 font-extrabold text-sm uppercase tracking-wider ${
              orderType === 'BUY' ? 'btn-3d-green' : 'btn-3d-red'
            }`}
          >
            {orderType} {quantity} SHARES @ {orderCategory === 'MARKET' ? 'MARKET' : `₹${limitPrice}`}
          </button>
        </div>
      )}

      {activeTab === 'DEPTH' && (
        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10 pb-1">
            <span>Bid Price (Buyers)</span>
            <span>Ask Price (Sellers)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            {/* Bids */}
            <div className="space-y-1.5">
              {orderBook.bids.map((b, i) => (
                <div key={i} className="flex justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span>₹{b.price}</span>
                  <span className="font-bold">{b.qty}</span>
                </div>
              ))}
            </div>
            {/* Asks */}
            <div className="space-y-1.5">
              {orderBook.asks.map((a, i) => (
                <div key={i} className="flex justify-between p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <span>₹{a.price}</span>
                  <span className="font-bold">{a.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FUNDAMENTALS' && (
        <div className="space-y-2 text-xs font-mono bg-slate-950/60 p-4 rounded-xl border border-white/5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">P/E Ratio:</span>
            <span className="font-bold text-white">28.45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">P/B Ratio:</span>
            <span className="font-bold text-white">2.65</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">52 Week High:</span>
            <span className="font-bold text-emerald-400">{formatINR(currentPrice * 1.15)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">52 Week Low:</span>
            <span className="font-bold text-rose-400">{formatINR(currentPrice * 0.75)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ROE %:</span>
            <span className="font-bold text-cyan-300">18.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Delivery %:</span>
            <span className="font-bold text-emerald-400">64.2%</span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border border-cyan-500/30">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className={`p-2.5 rounded-xl ${orderType === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm {orderType} Order</h3>
                <p className="text-xs text-slate-400">NSE Exchange Order Ticket</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-900/60 p-4 rounded-xl font-mono text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Symbol:</span>
                <span className="font-bold text-white">{symbol} (NSE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="text-white">{quantity} Shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Price:</span>
                <span className="text-white">{orderCategory === 'MARKET' ? `₹${currentPrice} (Market)` : `₹${limitPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Statutory Charges:</span>
                <span className="text-cyan-300">₹{charges.totalCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                <span className="text-white">Total Amount:</span>
                <span className="text-emerald-400">{formatINR(charges.estimatedTotalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderSubmit}
                disabled={isExecuting}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-black ${
                  orderType === 'BUY' ? 'btn-3d-green' : 'btn-3d-red text-white'
                }`}
              >
                {isExecuting ? 'Executing Order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
