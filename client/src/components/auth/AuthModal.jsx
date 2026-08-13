import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Phone, MapPin, CreditCard, X, KeyRound, ShieldCheck } from 'lucide-react';
import { loginUser, signupUser, verifyOtp, resendOtp } from '../../services/api.js';
import { Card3D } from '../common/Card3D.jsx';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // OTP Verification States
  const [otpState, setOtpState] = useState(null); // { identifier, purpose, devOtp }
  const [otpInput, setOtpInput] = useState('');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form States
  const [signupData, setSignupData] = useState({
    firstname: '',
    lastname: '',
    address: '',
    email: '',
    enter_password: '',
    confirm_password: '',
    mobile_number: '',
    pan_number: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.requireOtp) {
        setOtpState({
          identifier: res.identifier,
          purpose: res.purpose,
          devOtp: res.devOtp
        });
      } else {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const { firstname, lastname, address, email, enter_password, confirm_password, mobile_number, pan_number } = signupData;

    if (enter_password !== confirm_password) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await signupUser({
        firstname,
        lastname,
        email,
        mobile_number,
        pan_number,
        address,
        password: enter_password,
        confirm_password
      });

      if (res.requireOtp) {
        setOtpState({
          identifier: res.identifier,
          purpose: res.purpose,
          devOtp: res.devOtp
        });
      } else {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(otpState.identifier, otpInput, otpState.purpose);
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage(null);
    try {
      const res = await resendOtp(otpState.identifier, otpState.purpose);
      setOtpState(prev => ({ ...prev, devOtp: res.devOtp }));
      alert(res.message || 'New OTP sent!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <Card3D className="max-w-lg w-full p-6 md:p-8 space-y-5 relative border border-white/10 shadow-2xl rounded-3xl bg-slate-900/60 backdrop-blur-3xl my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Lock className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isLoginView ? 'Welcome Back to FinNexa' : 'Create Trade Account'}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {isLoginView ? 'Secure Trading Access Portal' : 'Register in minutes to trade NSE/BSE stocks'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold p-3.5 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {otpState ? (
          /* OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" /> Verify OTP Code
              </h2>
              <p className="text-[11px] text-slate-400">
                Enter 6-digit verification code sent to <br/>
                <strong className="text-cyan-300 font-semibold">{otpState.identifier}</strong>
              </p>
            </div>

            {otpState.devOtp && (
              <div className="bg-cyan-500/10 border border-cyan-400/40 p-3 rounded-xl text-center space-y-1">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">🔑 Your OTP Code</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono font-black text-emerald-400 tracking-widest">{otpState.devOtp}</span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(otpState.devOtp)}
                    className="px-2 py-0.5 text-[10px] font-extrabold bg-cyan-400 text-slate-950 rounded hover:bg-cyan-300 transition-all cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center text-lg font-extrabold tracking-widest text-black bg-white glass-input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Access
                </>
              )}
            </button>

            <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1">
              <button
                type="button"
                onClick={() => { setOtpState(null); setErrorMessage(null); }}
                className="hover:text-white underline font-semibold cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            </div>
          </form>
        ) : isLoginView ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="name@company.com or 10-digit mobile"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full glass-input pl-10 text-black bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full glass-input pl-10 pr-10 text-black bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20 uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : 'Secure Login'}
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="firstname"
                    required
                    placeholder="Rahul"
                    value={signupData.firstname}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="lastname"
                    required
                    placeholder="Sharma"
                    value={signupData.lastname}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={signupData.email}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="mobile_number"
                    required
                    placeholder="9876543210"
                    value={signupData.mobile_number}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
            </div>

            {/* PAN Card */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">PAN Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  name="pan_number"
                  required
                  placeholder="ABCDE1234F"
                  value={signupData.pan_number}
                  onChange={handleInputChange}
                  className="w-full glass-input pl-9 text-black bg-white font-mono uppercase"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Residential Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="Enter full billing address..."
                  value={signupData.address}
                  onChange={handleInputChange}
                  className="w-full glass-input pl-9 text-black bg-white"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="enter_password"
                    required
                    placeholder="••••••••"
                    value={signupData.enter_password}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="••••••••"
                    value={signupData.confirm_password}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-9 text-black bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20 uppercase tracking-wider mt-3 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : 'Register & Log In'}
            </button>
          </form>
        )}

        {/* View Toggle */}
        <div className="text-xs text-slate-400 pt-3 border-t border-white/10 text-center">
          {isLoginView ? (
            <>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLoginView(false); setErrorMessage(null); }} 
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have a trade account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLoginView(true); setErrorMessage(null); }} 
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </Card3D>
    </div>
  );
};
