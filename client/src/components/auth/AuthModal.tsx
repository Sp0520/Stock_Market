import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('name@company.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: "Rahul Sharma",
      email: email,
      pan: "ABCDE1234F",
      kycStatus: "VERIFIED"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      
      {/* Dark Grid Overlay & Skyline Background Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="w-full h-full bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Frosted Glass Login Card matching Image 4 */}
      <div className="glass-card max-w-md w-full p-8 space-y-6 relative border border-white/10 shadow-2xl rounded-3xl bg-slate-900/60 backdrop-blur-3xl text-center">
        
        {/* Glowing Gold/Cyan Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
          <Lock className="w-8 h-8 text-cyan-300" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Secure Login</h2>
          <p className="text-xs text-slate-400">Production Stock Trading Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full glass-input pl-10 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-cyan-400"
              />
              Remember Me
            </label>
            <button 
              type="button" 
              onClick={() => alert("Password reset link sent.")}
              className="text-cyan-400 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Bright Blue Primary Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 uppercase tracking-wider mt-2"
          >
            Secure Login
          </button>
        </form>

        <div className="text-xs text-slate-400 pt-2 border-t border-white/10">
          Don't have an account?{' '}
          <button onClick={onClose} className="text-cyan-400 font-bold hover:underline">
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
};
