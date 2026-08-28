import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Download, 
  FileText, 
  QrCode, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone 
} from 'lucide-react';

export const DesktopProfile: React.FC = () => {
  const { profile, payslips, setIsIdCardModalOpen, triggerToast } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Employee Profile, Digital ID & Payslips Vault
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Official Trade Nexus credentials, salary statements, and compliance locker
          </p>
        </div>

        <button
          onClick={() => setIsIdCardModalOpen(true)}
          className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>View Full Digital ID Card</span>
        </button>
      </div>

      {/* Main 2-Column Split: ID Card & Profile Card (Left 4 Cols) + Payslips & Documents (Right 8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Profile Summary Card */}
        <div className="lg:col-span-4 space-y-5">
          {/* Executive ID Badge Preview */}
          <div className="nexus-card p-6 bg-gradient-to-b from-[#0A2540] to-[#0F3258] text-white shadow-lg space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00C9A7] to-[#38E1B7] p-0.5 shadow-md flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#0A2540] flex items-center justify-center font-display font-black text-2xl text-[#00C9A7]">
                  AK
                </div>
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">{profile.name}</h3>
                <span className="text-xs font-bold text-[#38E1B7] block mt-0.5">{profile.roleTitle}</span>
                <span className="text-[11px] font-mono text-slate-300 font-semibold">{profile.empCode}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-white">{profile.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reporting To:</span>
                <span className="font-semibold text-white">{profile.teamLeaderName} (TL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joining Date:</span>
                <span className="font-semibold text-white">{profile.joinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Timings:</span>
                <span className="font-semibold text-[#00C9A7]">09:00 AM - 06:30 PM</span>
              </div>
            </div>

            <button
              onClick={() => setIsIdCardModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <QrCode className="w-4 h-4 text-[#00C9A7]" />
              <span>Download Official Printable ID Card</span>
            </button>
          </div>
        </div>

        {/* Right: Payslips Breakdown & Document Vault */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Monthly Payslips Table */}
          <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base text-[#0A2540]">Monthly Salary Payslips (PDF)</h3>
                <p className="text-xs text-slate-500">Official digitally verified salary slips</p>
              </div>
              <FileText className="w-5 h-5 text-[#00C9A7]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-3 px-3">Pay Period</th>
                    <th className="pb-3 px-3">Basic + HRA</th>
                    <th className="pb-3 px-3">Sales Incentives</th>
                    <th className="pb-3 px-3">Deductions (PF/Tax)</th>
                    <th className="pb-3 px-3">Net Take-Home</th>
                    <th className="pb-3 px-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payslips.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-display font-bold text-sm text-[#0A2540]">
                        {pay.month} {pay.year}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        ₹{(pay.basicSalary + pay.hra).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                        +₹{pay.incentives.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-rose-500">
                        -₹{(pay.pfDeduction + pay.taxDeduction).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-sm text-[#0A2540]">
                        ₹{pay.netPay.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => triggerToast(`✓ Downloaded Payslip for ${pay.month} ${pay.year} (PDF)`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6FAF6] hover:bg-[#00C9A7] text-[#00A88B] hover:text-[#0A2540] font-bold text-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Document Vault */}
          <div className="nexus-card bg-white border border-slate-200 shadow-sm p-6 space-y-3">
            <h4 className="font-display font-black text-base text-[#0A2540]">Compliance & Onboarding Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#0A2540] block">Employment Offer & Contract</span>
                  <span className="text-[10px] text-slate-400 font-mono">Signed on 12 Jan 2024</span>
                </div>
                <button onClick={() => triggerToast('Opening Offer Letter')} className="text-xs font-bold text-[#00A88B] hover:underline">View PDF</button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#0A2540] block">Identity Proof (Aadhaar / PAN)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Verified by HR</span>
                </div>
                <button onClick={() => triggerToast('Opening KYC Documents')} className="text-xs font-bold text-[#00A88B] hover:underline">View</button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
