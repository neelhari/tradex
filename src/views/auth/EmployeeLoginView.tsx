import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, setAuthToken } from '../../services/api';
import { 
  Mail, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  ScanFace, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export const EmployeeLoginView: React.FC = () => {
  const { setAuthStep, triggerToast, loginEmployee, currentRole, setCurrentRole } = useApp();
  
  const [activeLoginType, setActiveLoginType] = useState<'gmail' | 'mobile' | 'password'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick 1-Click Login for Demo -> Step 2
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const loginResult = loginEmployee('arjun@tradenexus.com', 'telecaller123');
    if (!loginResult.success) {
      setIsLoading(false);
      triggerToast(`❌ ${loginResult.error}`);
      return;
    }
    triggerToast(`✓ Authenticated ${loginResult.member?.name} (Senior Telecaller)`);
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Mobile OTP Login -> Step 2
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      triggerToast('Please enter your registered mobile number');
      return;
    }
    setIsOtpSent(true);
    triggerToast(`✓ 6-digit OTP sent to ${mobileNumber}`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loginResult = loginEmployee(mobileNumber.trim() || 'arjun@tradenexus.com', 'telecaller123');
    if (!loginResult.success) {
      setIsLoading(false);
      triggerToast(`❌ ${loginResult.error}`);
      return;
    }
    triggerToast('✓ OTP Verified! Proceeding to Biometric Face ID...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Standard Email & Password Submit -> Restricted to Onboarded Employees -> Step 2
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerToast('Please enter your email/employee code and password');
      return;
    }
    setIsLoading(true);
    
    // Strict authentication against registered onboarded employees list
    const loginResult = loginEmployee(email.trim(), password.trim());
    if (!loginResult.success) {
      setIsLoading(false);
      triggerToast(`❌ ${loginResult.error}`);
      return;
    }

    triggerToast(`✓ Welcome, ${loginResult.member?.name}! Credentials verified.`);
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans text-slate-800 selection:bg-[#00C9A7]/20 pb-6">
      
      {/* 1. Official Trade Nexus Brand Top Header */}
      <div className="bg-gradient-to-b from-[#07192C] via-[#0A2540] to-[#0D3155] text-white pt-10 pb-14 px-6 rounded-b-[36px] shadow-xl relative overflow-hidden">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,201,167,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Official Trade Nexus Emblem */}
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#0A2540] border-2 border-[#00C9A7]/50 shadow-lg shadow-[#00C9A7]/20 flex items-center justify-center flex-shrink-0 p-0.5">
              <img 
                src="/logo-icon.png" 
                alt="Trade Nexus" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-wider leading-tight">
                TRADE NEXUS
              </h1>
              <p className="text-xs text-[#00C9A7] font-bold tracking-wide">
                Telecaller
              </p>
            </div>
          </div>

          <div className="bg-[#00C9A7]/15 border border-[#00C9A7]/40 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold flex items-center gap-1.5 text-[#38E1B7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
            <span>TELECALLER</span>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex items-center justify-between bg-black/40 p-1 rounded-2xl border border-white/10 mt-4 text-[11px] font-bold relative z-10">
          <button
            onClick={() => setCurrentRole('telecaller')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${currentRole === 'telecaller' ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-300 hover:text-white'}`}
          >
            Caller
          </button>
          <button
            onClick={() => setCurrentRole('team_leader')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${currentRole === 'team_leader' ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-300 hover:text-white'}`}
          >
            TL
          </button>
          <button
            onClick={() => setCurrentRole('hr')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${currentRole === 'hr' ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-300 hover:text-white'}`}
          >
            HR
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${currentRole === 'admin' ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-300 hover:text-white'}`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* 2. Telecaller Employee Login Card Body */}
      <div className="px-5 -mt-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="nexus-card p-6 bg-white border border-slate-200/80 shadow-2xl rounded-3xl space-y-4">
          
          <div className="text-center space-y-0.5">
            <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
              Telecaller Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Login to your account to continue
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
                  ? 'border-[#00C9A7] bg-[#E6FAF6] shadow-xs'
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
                activeLoginType === 'gmail' ? 'text-[#00A88B]' : 'text-slate-700'
              }`}>
                Google Account
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
                  ? 'border-[#00C9A7] bg-[#E6FAF6] shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${
                activeLoginType === 'mobile' ? 'text-[#00A88B]' : 'text-slate-500'
              }`} />
              <span className={`text-[10px] font-bold leading-tight ${
                activeLoginType === 'mobile' ? 'text-[#00A88B]' : 'text-slate-700'
              }`}>
                Mobile Number
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
                  ? 'border-[#00C9A7] bg-[#E6FAF6] shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
              }`}
            >
              <Mail className={`w-5 h-5 ${
                activeLoginType === 'password' ? 'text-[#00A88B]' : 'text-slate-500'
              }`} />
              <span className={`text-[10px] font-bold leading-tight ${
                activeLoginType === 'password' ? 'text-[#00A88B]' : 'text-slate-700'
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
            <span>{isLoading ? 'Signing In...' : 'Continue with Google (Telecaller)'}</span>
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
                  placeholder="Enter telecaller mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
                />
              </div>

              {isOtpSent && (
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 584920)"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-mono font-bold tracking-widest"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs shadow-lg shadow-[#00C9A7]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>{isOtpSent ? 'Verify OTP & Proceed to Face ID' : 'Get OTP & Proceed'}</span>
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
                  placeholder="Enter telecaller email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
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
                <a href="#forgot" onClick={(e) => { e.preventDefault(); triggerToast('Password reset link sent to registered email'); }} className="text-[11px] font-bold text-[#00A88B] hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs shadow-lg shadow-[#00C9A7]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Login as Telecaller</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            By logging in, you agree to our <a href="#" className="underline text-slate-600">Terms &amp; Conditions</a> and <a href="#" className="underline text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* 3. 3-Step "How Face Recognition Works" Infographic Footer */}
      <div className="px-5 mt-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#0A2540] uppercase tracking-wider block text-center mb-3">
            How Face Recognition Works
          </span>

          <div className="flex items-center justify-between text-center relative">
            {/* Step 1: Login */}
            <div 
              onClick={() => setAuthStep('LOGIN')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E6FAF6] border border-[#00C9A7]/40 flex items-center justify-center text-[#00A88B] relative mb-1.5 shadow-2xs">
                <UserCheck className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-[#00C9A7] text-[#0A2540] text-[9px] font-black absolute -top-1 -right-1 flex items-center justify-center">1</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">Login</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Portal credentials</span>
            </div>

            <div className="text-slate-300 font-bold px-1">➔</div>

            {/* Step 2: Face Scan */}
            <div 
              onClick={() => setAuthStep('FACE_SCAN')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 relative mb-1.5 shadow-2xs">
                <ScanFace className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-[#0A2540] text-white font-black text-[9px] flex items-center justify-center">2</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">Face Scan</span>
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
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">3</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">Marked</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Shift active</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
