import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  X, 
  RotateCcw, 
  Shield, 
  Smartphone, 
  Monitor, 
  ScanFace, 
  UserCheck, 
  PhoneIncoming, 
  FileText, 
  UserPlus, 
  Check, 
  Sliders,
  Sparkles,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { UserRole, AuthStep } from '../../types';

export const DevSettingsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    currentRole, 
    setCurrentRole, 
    authStep, 
    setAuthStep, 
    triggerToast,
    logNewCall,
    submitLeaveRequest,
    logout
  } = useApp();

  const handleSimulateCall = () => {
    logNewCall({
      clientName: 'Rajesh Singhania',
      companyName: 'Singhania Logistics Ltd',
      phoneNumber: '+91 98200 45678',
      outcome: 'INTERESTED',
      durationSec: 240,
      notes: 'Interested in enterprise fleet tracking plan. Scheduled callback for tomorrow 3 PM.',
      followUpDate: 'Tomorrow, 03:00 PM',
    });
    triggerToast('⚡ Dev Tool: Simulated Incoming Deal Call (Interested)');
  };

  const handleSimulateLeave = () => {
    submitLeaveRequest({
      leaveType: 'Casual Leave',
      fromDate: '30 May 2025',
      toDate: '31 May 2025',
      totalDays: 2,
      reason: 'Family wedding ceremony in Pune',
    });
    triggerToast('⚡ Dev Tool: Simulated New Leave Request for Team Leader Approval');
  };

  return (
    <>
      {/* Floating Circular Dev Button - Positioned on Bottom Left (Opposite the Role Switcher on Bottom Right) */}
      <div className="fixed bottom-20 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Open Developer Settings & Sandbox"
          className="w-12 h-12 rounded-full bg-[#0A2540] text-amber-400 flex items-center justify-center shadow-xl shadow-black/35 border-2 border-amber-400 active:scale-95 transition-all hover:scale-105 relative"
        >
          <Zap className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-[#0A2540] font-black text-[8px] flex items-center justify-center">
            DEV
          </span>
        </button>
      </div>

      {/* Dev Settings Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A2540] text-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 border border-white/10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white flex items-center gap-2">
                    <span>Developer &amp; Demo Settings</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-400 text-[#0A2540] px-1.5 py-0.2 rounded">
                      SANDBOX
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Fast-travel between roles, auth steps &amp; simulate live events</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Role Fast-Switcher (Starts at Login page) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Switch Role (Starts from Login Page)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'telecaller', label: '1. Telecaller / SDR', user: 'Arjun Kumar' },
                  { id: 'team_leader', label: '2. Team Leader', user: 'Ramesh Sharma' },
                  { id: 'hr', label: '3. HR Portal', user: 'Pooja Hegde' },
                  { id: 'admin', label: '4. Super Admin', user: 'Vikram Malhotra' },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setCurrentRole(role.id as UserRole);
                      setAuthStep('LOGIN');
                      setIsOpen(false);
                      triggerToast(`Switched to ${role.label} - Opened Login Page`);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      currentRole === role.id
                        ? 'bg-[#00C9A7] text-[#0A2540] font-black border-[#00C9A7] shadow-md shadow-[#00C9A7]/25'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs">{role.label}</span>
                    <span className={`text-[10px] ${currentRole === role.id ? 'text-[#0A2540]/80' : 'text-slate-500'}`}>
                      User: {role.user}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Auth Flow Fast-Travel */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Screen Fast-Travel (Biometric Flow)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'LOGIN', label: '1. Login Page', icon: UserCheck },
                  { id: 'FACE_SCAN', label: '2. Face Scan', icon: ScanFace },
                  { id: 'ATTENDANCE_SUCCESS', label: '3. Success', icon: Check },
                  { id: 'AUTHENTICATED', label: '4. Dashboard', icon: Monitor },
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setAuthStep(step.id as AuthStep);
                      setIsOpen(false);
                      triggerToast(`Navigated to: ${step.label}`);
                    }}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      authStep === step.id
                        ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-md'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Live Event Simulators */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Data Simulators
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleSimulateCall}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00C9A7] text-left flex items-center gap-2.5 transition-all text-slate-300 hover:text-white"
                >
                  <PhoneIncoming className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-xs text-white">Log Fake Call</strong>
                    <span className="text-[10px] text-slate-500">Interested lead (+1 dial)</span>
                  </div>
                </button>

                <button
                  onClick={handleSimulateLeave}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00C9A7] text-left flex items-center gap-2.5 transition-all text-slate-300 hover:text-white"
                >
                  <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-xs text-white">New Leave Request</strong>
                    <span className="text-[10px] text-slate-500">Adds pending approval</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Section 4: Quick Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Full Logout</span>
              </button>

              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hard Reload App</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
