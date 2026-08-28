import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CreditCard, 
  FileText, 
  Download, 
  ShieldCheck, 
  Briefcase, 
  Calendar, 
  QrCode, 
  LogOut, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  FileCheck,
  Phone,
  Clock
} from 'lucide-react';

export const ProfileSelfServiceView: React.FC = () => {
  const { profile, payslips, setIsIdCardModalOpen, triggerToast } = useApp();

  const handleDownloadPayslip = (month: string, year: number) => {
    triggerToast(`✓ Official Payslip for ${month} ${year} downloaded (PDF)`);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Executive Employee Profile Card */}
      <div className="nexus-card p-5 bg-gradient-to-br from-[#0A2540] via-[#0F3258] to-[#0A2540] text-white shadow-lg space-y-4 relative overflow-hidden border border-white/10">
        
        {/* Top Profile Summary */}
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00C9A7] to-[#38E1B7] p-0.5 shadow-md shadow-[#00C9A7]/30 flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#0A2540] flex items-center justify-center font-display font-black text-2xl text-[#00C9A7]">
              AK
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-white tracking-tight">
                {profile.name}
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#00C9A7]/20 text-[#38E1B7] px-2 py-0.5 rounded border border-[#00C9A7]/40">
                {profile.empCode}
              </span>
            </div>
            <p className="text-xs text-[#38E1B7] font-semibold mt-0.5">{profile.roleTitle}</p>
            <p className="text-[11px] text-slate-300 font-medium">{profile.department}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Briefcase className="w-3.5 h-3.5 text-[#00C9A7]" />
            <span className="truncate">TL: <strong>{profile.teamLeaderName}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-[#00C9A7]" />
            <span>Joined: {profile.joinDate}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#00C9A7]" />
            <span>Shift: 09:00 - 18:30</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>KYC Verified</span>
          </div>
        </div>
      </div>

      {/* 2. Digital ID Card Preview Tile */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-[#0A2540]">Digital Employee ID Card</h4>
            <p className="text-[11px] text-slate-500">Official company badge with QR verification</p>
          </div>
        </div>
        <button
          onClick={() => setIsIdCardModalOpen(true)}
          className="py-2 px-3 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>View Card</span>
        </button>
      </div>

      {/* 3. Monthly Payslips Vault */}
      <div className="nexus-card p-4.5 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div>
            <h4 className="font-display font-black text-sm text-[#0A2540]">Monthly Salary Payslips</h4>
            <p className="text-[11px] text-slate-500">Download official tax & salary statements</p>
          </div>
          <FileText className="w-5 h-5 text-[#00C9A7]" />
        </div>

        <div className="space-y-2.5">
          {payslips.map((pay) => (
            <div key={pay.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs text-[#0A2540]">{pay.month} {pay.year}</span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ✓ Paid
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                  Net Take-Home: <strong className="text-emerald-700 font-extrabold text-xs">₹{pay.netPay.toLocaleString()}</strong>
                </span>
              </div>

              <button
                onClick={() => handleDownloadPayslip(pay.month, pay.year)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00A88B] bg-white border border-slate-200 hover:border-[#00C9A7] px-3 py-1.5 rounded-lg shadow-2xs active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Employee Compliance & Document Locker */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-2.5">
        <h4 className="font-display font-bold text-sm text-[#0A2540]">Compliance Document Locker</h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-[#00C9A7]" />
              <div>
                <span className="font-bold text-[#0A2540] block">Employment Offer & Contract</span>
                <span className="text-[10px] text-slate-400 font-mono">PDF • Signed on 12 Jan 2024</span>
              </div>
            </div>
            <button onClick={() => triggerToast('Viewing Signed Offer Contract (PDF)')} className="text-[#00A88B] font-bold hover:underline">
              View
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-[#0A2540] block">National Identity Proof (Aadhaar/PAN)</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ Verified by HR Compliance</span>
              </div>
            </div>
            <button onClick={() => triggerToast('Viewing KYC ID proofs')} className="text-[#00A88B] font-bold hover:underline">
              View
            </button>
          </div>
        </div>
      </div>

      {/* 5. Account Settings & Logout */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => triggerToast('🔒 Change Password dialog')}
          className="w-full p-3 rounded-xl bg-white border border-slate-200 text-[#0A2540] font-bold text-xs flex items-center justify-between shadow-2xs hover:bg-slate-50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Change Security Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => triggerToast('Logged out successfully')}
          className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs hover:bg-rose-100 active:scale-[0.99] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>

    </div>
  );
};
