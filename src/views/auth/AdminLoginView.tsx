import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ArrowRight,
  Shield,
  Key,
  Crown
} from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { setAuthStep, triggerToast } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Direct Admin Login (NO Face Recognition step needed as requested!)
  const handleAdminGoogleLogin = () => {
    setIsLoading(true);
    triggerToast('✓ Super Admin authenticated! Entering Management Console...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('AUTHENTICATED');
    }, 300);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerToast('✓ Master Admin credentials verified! Entering Console...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('AUTHENTICATED');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans text-slate-800 selection:bg-amber-400/20 pb-6">
      
      {/* 1. Executive Master Admin Top Header */}
      <div className="bg-gradient-to-b from-[#0A192F] via-[#0F2847] to-[#0A192F] text-white pt-10 pb-14 px-6 rounded-b-[36px] shadow-xl relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Crown Emblem */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#0A192F] p-2 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Crown className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-tight leading-tight">
                Admin Panel
              </h1>
              <p className="text-[11px] text-amber-300 font-semibold tracking-wide">
                Master Management &amp; System Oversight
              </p>
            </div>
          </div>

          <div className="bg-amber-400/15 border border-amber-400/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>LEVEL 4 ADMIN</span>
          </div>
        </div>
      </div>

      {/* 2. Admin Login Card */}
      <div className="px-5 -mt-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="nexus-card p-6 bg-white border border-slate-200/80 shadow-2xl rounded-3xl space-y-4">
          
          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-amber-500 font-display font-black text-2xl tracking-tight">
              <span>Hello, Admin</span>
              <span>👑</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to manage system users, teams &amp; global controls
            </p>
          </div>

          {/* Quick SSO Google Login */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAdminGoogleLogin}
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
            <span>{isLoading ? 'Authenticating...' : 'Continue with Google Workspace (Super Admin)'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              OR MASTER CREDENTIALS
            </span>
          </div>

          {/* Direct Credentials Form */}
          <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter master admin email (e.g. admin@tradenexus.io)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="2FA Master Security Key (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Direct Login Button -> Instantly enters Dashboard */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#0A192F] hover:bg-[#0F2847] text-amber-400 font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-400/40"
            >
              <span>Enter Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Authorized administrator access only. All sessions are cryptographically logged.
          </p>
        </div>
      </div>

      {/* 3. Direct Fast-Access Infographic */}
      <div className="px-5 mt-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm text-center space-y-1">
          <span className="text-[11px] font-extrabold text-[#0A2540] uppercase tracking-wider block">
            Super Admin Direct Access
          </span>
          <p className="text-xs text-slate-500">
            Super Administrator bypasses biometric kiosk for immediate system oversight.
          </p>
        </div>
      </div>

    </div>
  );
};
