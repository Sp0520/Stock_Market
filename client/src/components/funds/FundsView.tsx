import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface FundsViewProps {
  availableBalance: number;
  buyingPower: number;
  marginUsed: number;
  onUpdateBalance: (newBal: number) => void;
}

export const FundsView: React.FC<FundsViewProps> = ({
  availableBalance,
  buyingPower,
  marginUsed,
  onUpdateBalance
}) => {
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<'UPI_GPAY' | 'UPI_PHONEPE' | 'NET_BANKING'>('UPI_GPAY');
  const [upiId, setUpiId] = useState<string>('rahul@okaxis');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleAddFunds = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateBalance(availableBalance + depositAmount);
      setIsProcessing(false);
      setShowDepositModal(false);
      alert(`₹${depositAmount.toLocaleString('en-IN')} added instantly to your Trading Account!`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Funds Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 space-y-3 border-l-4 border-cyan-400">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Cash Balance</span>
          <div className="text-3xl font-extrabold font-mono text-white">{formatINR(availableBalance)}</div>
          <p className="text-xs text-slate-400">Ready for Instant Stock Orders & IPO applications.</p>
          <button 
            onClick={() => setShowDepositModal(true)}
            className="gradient-btn-green w-full py-2.5 text-xs font-bold mt-2"
          >
            + Deposit Funds (UPI / NetBanking)
          </button>
        </div>

        <div className="glass-card p-6 space-y-3 border-l-4 border-blue-400">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trading Power</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">{formatINR(buyingPower)}</div>
          <p className="text-xs text-slate-400">Includes 2x Intraday Margin Leverage for Equity F&O.</p>
        </div>

        <div className="glass-card p-6 space-y-3 border-l-4 border-purple-400">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margin Utilized</span>
          <div className="text-3xl font-extrabold font-mono text-purple-300">{formatINR(marginUsed)}</div>
          <p className="text-xs text-slate-400">Margin locked against active Open Orders.</p>
        </div>

      </div>

      {/* UPI Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border border-cyan-500/30">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Funds to Trading Account</h3>
                <p className="text-xs text-slate-400">Instant UPI & Net Banking Deposit (0% Fee)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount to Deposit (INR ₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full glass-input font-mono font-bold text-white text-base"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI_GPAY')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'UPI_GPAY' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <span>📱 Google Pay</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI_PHONEPE')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'UPI_PHONEPE' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <span>💜 PhonePe</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'NET_BANKING' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <span>🏦 NetBanking</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">UPI Virtual ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full glass-input text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                disabled={isProcessing}
                className="flex-1 gradient-btn-green py-2.5 rounded-xl text-xs font-bold text-black"
              >
                {isProcessing ? 'Processing Payment...' : `Pay ${formatINR(depositAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
