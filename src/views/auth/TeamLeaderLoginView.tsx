import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ScanFace
} from 'lucide-react';

export const TeamLeaderLoginView: React.FC = () => {
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
    triggerToast('✓ Authenticating Ramesh Sharma (Team Leader)...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Mobile OTP Login -> Step 2
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpSent(true);
    triggerToast(`✓ 6-digit Supervisor OTP sent to ${mobileNumber || '+91 98450 00112'}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerToast('✓ OTP Verified! Proceeding to Supervisor Biometric Face ID...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  // Standard Email & Password Submit -> Step 2
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerToast('✓ Team Leader credentials verified! Proceeding to Face Recognition...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('FACE_SCAN');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans text-slate-800 selection:bg-[#00C9A7]/20 pb-6">
      
      {/* 1. Deep Navy & Mint Top Header (Dedicated to Team Leader Portal) */}
      <div className="bg-gradient-to-b from-[#07192C] via-[#0A2540] to-[#0D3155] text-white pt-10 pb-14 px-6 rounded-b-[36px] shadow-xl relative overflow-hidden">
        {/* Futuristic grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,201,167,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Executive Shield Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C9A7] to-[#00B4D8] text-[#0A2540] p-2 flex items-center justify-center shadow-lg shadow-[#00C9A7]/20 flex-shrink-0">
              <Shield className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-tight leading-tight">
                Team Leader Portal
              </h1>
              <p className="text-[11px] text-[#38E1B7] font-semibold tracking-wide">
                Supervisor &amp; Team Management Console
              </p>
            </div>
          </div>

          <div className="bg-[#00C9A7]/15 border border-[#00C9A7]/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 text-[#00C9A7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-ping" />
            <span>SUPERVISOR</span>
          </div>
        </div>
      </div>

      {/* 2. Team Leader Login Card Body */}
      <div className="px-5 -mt-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="nexus-card p-6 bg-white border border-slate-200/80 shadow-2xl rounded-3xl space-y-4">
          
          <div className="text-center space-y-0.5">
            <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
              Team Leader Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to manage your squad &amp; review production
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
            <span>{isLoading ? 'Signing In...' : 'Continue with Google (Supervisor)'}</span>
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
                  placeholder="Enter supervisor mobile number"
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
                className="w-full py-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#0F3258] text-[#00C9A7] font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#00C9A7]/40"
              >
                <span>{isOtpSent ? 'Verify OTP & Enter Supervisor Console' : 'Get OTP & Proceed'}</span>
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
                  placeholder="Enter supervisor email (e.g. ramesh.sharma@...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter supervisor password"
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
                <a href="#forgot" onClick={(e) => { e.preventDefault(); triggerToast('Supervisor password reset sent'); }} className="text-[11px] font-bold text-[#00A88B] hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#0F3258] text-[#00C9A7] font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#00C9A7]/40"
              >
                <span>Login as Team Leader</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Restricted to authorized supervisors and managers. <a href="#" className="underline text-slate-600">Security Policy</a>.
          </p>
        </div>
      </div>

      {/* 3. 3-Step Supervisor Access Flow Infographic */}
      <div className="px-5 mt-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-extrabold text-[#0A2540] uppercase tracking-wider block text-center mb-3">
            Supervisor Verification Process
          </span>

          <div className="flex items-center justify-between text-center relative">
            {/* Step 1: Login */}
            <div 
              onClick={() => setAuthStep('LOGIN')}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E6FAF6] border border-[#00C9A7]/40 flex items-center justify-center text-[#00A88B] relative mb-1.5 shadow-2xs">
                <Shield className="w-5 h-5" />
                <span className="w-4 h-4 rounded-full bg-[#00C9A7] text-[#0A2540] font-black text-[9px] flex items-center justify-center absolute -top-1 -right-1">1</span>
              </div>
              <span className="font-display font-bold text-xs text-[#0A2540] block">Leader Login</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Executive access</span>
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
              <span className="font-display font-bold text-xs text-[#0A2540] block">Console Active</span>
              <span className="text-[9px] text-slate-400 leading-tight block">Team dashboard</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
