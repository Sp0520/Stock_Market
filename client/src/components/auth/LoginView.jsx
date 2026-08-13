import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Phone, MapPin, CreditCard, ShieldCheck, KeyRound } from 'lucide-react';
import { loginUser, signupUser, verifyOtp, resendOtp } from '../../services/api.js';

export const LoginView = ({ onLoginSuccess, onContinueAsGuest }) => {
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
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email/mobile or password');
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
      }
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please check inputs.');
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-tr from-[#0a0e1a] via-[#0b1021] to-[#0a0d14]">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 right-1/4 w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[35rem] h-[35rem] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md my-8 relative z-10">
        
        {/* Brand/Logo Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-cyan-500/30 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20 mb-3 animate-pulse">
            <Lock className="w-7 h-7 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            TRADE<span className="text-cyan-400">FLOW</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Secure Wealth & Stock Trading Access
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card p-6 md:p-8 space-y-6 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl">
          
          {!otpState && (
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">
                {isLoginView ? 'Secure Login' : 'Create Trade Account'}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isLoginView ? 'Enter credentials to access terminal' : 'Open a free virtual trading account'}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold p-3 rounded-xl text-center">
              ⚠️ {errorMessage}
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
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter email or 10-digit mobile"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full glass-input pl-10 text-black bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold">Password</label>
                  <button 
                    type="button" 
                    onClick={() => alert("Simulated password reset: Please register a new account.")}
                    className="text-[10px] text-cyan-400 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Secure Login
                  </>
                )}
              </button>

            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="firstname"
                      required
                      placeholder="e.g. Rahul"
                      value={signupData.firstname}
                      onChange={handleInputChange}
                      className="w-full glass-input pl-8.5 text-black bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="lastname"
                      required
                      placeholder="e.g. Sharma"
                      value={signupData.lastname}
                      onChange={handleInputChange}
                      className="w-full glass-input pl-8.5 text-black bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rahul@domain.com"
                      value={signupData.email}
                      onChange={handleInputChange}
                      className="w-full glass-input pl-8.5 text-black bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="mobile_number"
                      required
                      placeholder="10-digit number"
                      value={signupData.mobile_number}
                      onChange={handleInputChange}
                      className="w-full glass-input pl-8.5 text-black bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">PAN Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="pan_number"
                    required
                    placeholder="10-digit PAN (e.g. ABCDE1234F)"
                    value={signupData.pan_number}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-8.5 text-black bg-white font-mono uppercase"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <textarea
                    name="address"
                    required
                    rows={2}
                    placeholder="Enter full address details..."
                    value={signupData.address}
                    onChange={handleInputChange}
                    className="w-full glass-input pl-8.5 text-black bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Password</label>
                  <input
                    type="password"
                    name="enter_password"
                    required
                    placeholder="Min 6 chars"
                    value={signupData.enter_password}
                    onChange={handleInputChange}
                    className="w-full glass-input text-black bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="Retype password"
                    value={signupData.confirm_password}
                    onChange={handleInputChange}
                    className="w-full glass-input text-black bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : 'Register & Verify'}
              </button>

            </form>
          )}

          {/* Toggle View */}
          <div className="text-center pt-3 border-t border-white/10 text-xs text-slate-400">
            {isLoginView ? (
              <>
                New to TRADEFLOW?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginView(false); setErrorMessage(null); }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Create an account
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
                  Sign in
                </button>
              </>
            )}
          </div>

        </div>

        {/* Guest Session Access */}
        <div className="text-center mt-6">
          <button
            onClick={onContinueAsGuest}
            className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-200"
          >
            🔓 Enter Sandbox (Guest Investor Mode)
          </button>
        </div>

      </div>
    </div>
  );
};
