import React, { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT' | 'OTP'>('LOGIN');
  const [email, setEmail] = useState<string>('rahul.sharma@investor.in');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Rahul Sharma');
  const [pan, setPan] = useState<string>('ABCDE1234F');
  const [otp, setOtp] = useState<string>('849201');

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'LOGIN') {
      setMode('OTP');
    } else if (mode === 'OTP' || mode === 'SIGNUP') {
      onLoginSuccess({
        name,
        email,
        pan,
        kycStatus: "VERIFIED"
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="glass-card max-w-md w-full p-8 space-y-6 relative border border-cyan-500/30 shadow-2xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 mx-auto flex items-center justify-center text-black font-extrabold text-2xl shadow-lg shadow-cyan-500/20">
            📈
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'LOGIN' && 'Welcome Back to GrowwTrade'}
            {mode === 'SIGNUP' && 'Create Your Trading Account'}
            {mode === 'OTP' && 'Two-Factor OTP Verification'}
            {mode === 'FORGOT' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'LOGIN' && 'Access Indian Stock Market (NSE / BSE) Terminal'}
            {mode === 'SIGNUP' && 'Start trading Indian Equities with ₹0 Brokerage'}
            {mode === 'OTP' && 'Enter 6-digit OTP sent to registered mobile & email'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          
          {mode === 'SIGNUP' && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Full Legal Name (as per PAN)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">PAN Card Number</label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full glass-input font-mono uppercase text-white"
                />
              </div>
            </>
          )}

          {(mode === 'LOGIN' || mode === 'SIGNUP' || mode === 'FORGOT') && (
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 text-white"
                />
              </div>
            </div>
          )}

          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 text-white"
                />
              </div>
            </div>
          )}

          {mode === 'OTP' && (
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold text-center block">Enter 6-Digit 2FA Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full glass-input text-center text-xl font-mono tracking-widest text-emerald-400 font-bold"
              />
            </div>
          )}

          {mode === 'LOGIN' && (
            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Remember Me
              </label>
              <button 
                type="button" 
                onClick={() => setMode('FORGOT')}
                className="text-cyan-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full gradient-btn-green py-3 text-xs font-extrabold text-black uppercase tracking-wider mt-2"
          >
            {mode === 'LOGIN' && 'Proceed to 2FA Login'}
            {mode === 'SIGNUP' && 'Create Account & Verify KYC'}
            {mode === 'OTP' && 'Verify & Launch Terminal'}
            {mode === 'FORGOT' && 'Send Reset Link'}
          </button>
        </form>

        {/* Social Login UI */}
        {(mode === 'LOGIN' || mode === 'SIGNUP') && (
          <div className="space-y-3 pt-2 border-t border-white/10 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or Continue With</span>
            <button
              onClick={() => {
                onLoginSuccess({ name: "Rahul Sharma", email: "rahul@gmail.com", pan: "ABCDE1234F" });
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
            >
              <span>🌐 Google Social Login</span>
            </button>
          </div>
        )}

        {/* Switch mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'LOGIN' ? (
            <p>
              New to GrowwTrade?{' '}
              <button onClick={() => setMode('SIGNUP')} className="text-cyan-400 font-bold hover:underline">
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => setMode('LOGIN')} className="text-cyan-400 font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
