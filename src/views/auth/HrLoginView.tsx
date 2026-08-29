import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  ScanFace,
  Building2
} from 'lucide-react';

export const HrLoginView: React.FC = () => {
  const { setAuthStep, triggerToast } = useApp();
  
  const [activeLoginType, setActiveLoginType] = useState<'gmail' | 'mobile' | 'password'>('gmail');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Instant Google Login -> Step 2
  const handleGoogleLogin = () => {
    setIsLoading(true);
    triggerToast('✓ Authenticating Pooja Hegde (HR & Talent Operations)...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Mobile OTP Login -> Step 2
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpSent(true);
    triggerToast(`✓ 6-digit HR Security OTP sent to ${mobileNumber || '+91 98450 77889'}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerToast('✓ Security OTP Verified! Proceeding to Biometric Face ID...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Standard Email & Password Submit -> Step 2
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerToast('✓ HR Administrator credentials verified! Proceeding to Face Recognition...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans text-slate-800 selection:bg-indigo-500/20 pb-6">
      
      {/* 1. Executive Indigo & Emerald Top Header */}
      <div className="bg-gradient-to-b from-[#1E1B4B] via-[#2E287A] to-[#1E1B4B] text-white pt-10 pb-14 px-6 rounded-b-[36px] shadow-xl relative overflow-hidden">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* HR Badge Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-[#00C9A7] text-[#0A2540] p-2 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Building2 className="w-7 h-7 stroke-[2.2] text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-tight leading-tight">
                HR Operations Portal
              </h1>
              <p className="text-[11px] text-indigo-200 font-semibold tracking-wide">
                People &amp; Talent Administration Console
              </p>
            </div>
          </div>

          <div className="bg-indigo-500/20 border border-indigo-400/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-ping" />
            <span>HR LEVEL 3</span>
          </div>
        </div>
      </div>

      {/* 2. HR Login Card Body */}
      <div className="px-5 -mt-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="nexus-card p-6 bg-white border border-slate-200/80 shadow-2xl rounded-3xl space-y-4">
          
          <div className="text-center space-y-0.5">
            <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
              HR Officer Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to manage employee lifecycle &amp; payroll
            </p>
          </div>

          {/* 3 Quick Login Option Tabs */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Tab 1: Login with Gmail */}
            <button
              type="button"
              onClick={() => {
                setActiveLoginType('gmail');
                handleGoogleLogin();
              }}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                activeLoginType === 'gmail'
                  ? 'border-indigo-500 bg-indigo-50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <span className={`text-[10px] font-bold leading-tight ${
                activeLoginType === 'gmail' ? 'text-indigo-700' : 'text-slate-700'
              }`}>
                Google HR
              </span>
            </button>

            {/* Tab 2: Mobile Number Login */}
            <button
              type="button"
              onClick={() => {
                setActiveLoginType('mobile');
              }}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                activeLoginType === 'mobile'
                  ? 'border-indigo-500 bg-indigo-50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${
                activeLoginType === 'mobile' ? 'text-indigo-600' : 'text-slate-500'
              }`} />
              <span className={`text-[10px] font-bold leading-tight ${
                activeLoginType === 'mobile' ? 'text-indigo-700' : 'text-slate-700'
              }`}>
                Mobile OTP
              </span>
            </button>

            {/* Tab 3: Gmail & Password */}
            <button
              type="button"
              onClick={() => {
                setActiveLoginType('password');
              }}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                activeLoginType === 'password'
                  ? 'border-indigo-500 bg-indigo-50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <Mail className={`w-5 h-5 ${
                activeLoginType === 'password' ? 'text-indigo-600' : 'text-slate-500'
              }`} />
              <span className={`text-[10px] font-bold leading-tight ${
                activeLoginType === 'password' ? 'text-indigo-700' : 'text-slate-700'
              }`}>
                Password Login
              </span>
            </button>

          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* Continue with Google Button -> Step 2 Face Scan */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <span>{isLoading ? 'Signing In...' : 'Continue with Google (HR Officer)'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              {activeLoginType === 'mobile' ? 'Mobile Login' : 'Direct Credentials'}
            </span>
          </div>

          {/* Dynamic Form depending on selected Tab */}
          {activeLoginType === 'mobile' ? (
            /* Mobile Number Form */
            <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-3">
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter HR administrator mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              {isOtpSent && (
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 849201)"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono font-bold tracking-widest"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>{isOtpSent ? 'Verify OTP & Proceed to Biometric' : 'Get OTP & Proceed'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Gmail & Password Form -> Step 2 Face Scan */
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter HR email (e.g. pooja.hegde@tradenexus.io)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter HR access password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); triggerToast('HR security password recovery link dispatched'); }} className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Login as HR Officer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Restricted to certified HR &amp; Compliance Personnel. <a href="#" className="underline text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* 3. 3-Step HR Security Process Infographic */}
      <div className="px-5 mt-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#0A2540] uppercase tracking-wider block text-center mb-3">
            HR Access Verification Process
          </span>

          <div className="flex items-center justify-between text-center relative">
            {/* Step 1: Login */}
            <div 
              onClick={() => setAuthStep('LOGIN')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 relative mb-1.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-indigo-700 text-white font-black text-[9px] flex items-center justify-center absolute -top-1 -right-1">1</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">HR Login</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Portal token</span>
            </div>

            <div className="text-slate-300 font-bold px-1">➔</div>

            {/* Step 2: Face Scan */}
            <div 
              onClick={() => setAuthStep('FACE_SCAN')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 relative mb-1.5 shadow-2xs">
                <ScanFace className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-[#0A2540] text-white font-black text-[9px] flex items-center justify-center absolute -top-1 -right-1">2</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">Face ID</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Biometric kiosk</span>
            </div>

            <div className="text-slate-300 font-bold px-1">➔</div>

            {/* Step 3: Marked */}
            <div 
              onClick={() => setAuthStep('ATTENDANCE_SUCCESS')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 relative mb-1.5 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center absolute -top-1 -right-1">3</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">HR Active</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Console open</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
