import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="glass-card p-6 border-l-4 border-emerald-400 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-cyan-500/20">
          RS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Rahul Sharma</h2>
            <span className="badge-gain text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> KYC VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">rahul.sharma@investor.in • +91 98765 43210</p>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">SEBI UCC Client ID: IN-894210</p>
        </div>
      </div>

      {/* KYC & Identity Section */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          KYC & Government Verification Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 block text-[10px]">PAN Card Number</span>
            <span className="text-white font-bold text-sm">ABCDE1234F</span>
            <span className="text-emerald-400 text-[10px] block font-sans">✓ Verified with NSDL database</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 block text-[10px]">Aadhaar Identification</span>
            <span className="text-white font-bold text-sm">XXXX-XXXX-8921</span>
            <span className="text-emerald-400 text-[10px] block font-sans">✓ Verified via UIDAI e-KYC</span>
          </div>
        </div>
      </div>

      {/* Linked Bank Accounts */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          Linked Indian Bank Accounts (UPI / Payouts)
        </h3>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
              HDFC
            </div>
            <div>
              <div className="font-bold text-white text-sm">HDFC Bank Ltd</div>
              <p className="text-xs text-slate-400 font-mono">Account: XXXXXX9842 • IFSC: HDFC0000128</p>
            </div>
          </div>

          <span className="badge-gain text-xs">PRIMARY PAYOUT BANK</span>
        </div>
      </div>

      {/* Security & 2FA */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Lock className="w-5 h-5 text-purple-400" />
          Security & Two-Factor Authentication (2FA)
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div>
            <div className="text-sm font-bold text-white">Enable 2FA (TOTP / SMS OTP)</div>
            <p className="text-xs text-slate-400">Required by SEBI guidelines for order placements.</p>
          </div>
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            className="w-5 h-5 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};
