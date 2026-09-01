import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, FileText, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PayslipItem } from '../../types';

interface PayslipDetailModalProps {
  payslip: PayslipItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipDetailModal: React.FC<PayslipDetailModalProps> = ({ payslip, isOpen, onClose }) => {
  const { profile, triggerToast } = useApp();

  if (!isOpen || !payslip) return null;

  const totalEarnings = payslip.basicSalary + payslip.hra + payslip.specialAllowance + payslip.incentives;
  const totalDeductions = payslip.pfDeduction + payslip.taxDeduction;

  const handlePrint = () => {
    window.print();
    triggerToast(`✓ Printing payslip for ${payslip.month} ${payslip.year}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0A2540] px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/20 text-[#00C9A7] border border-[#00C9A7]/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white tracking-tight flex items-center gap-2">
                Salary Statement
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider font-bold">
                  {payslip.status}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Period: {payslip.month} {payslip.year} • Issued by Trade Nexus HR
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold px-3"
              title="Print Payslip"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {/* Company & Employee Overview */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#00A88B] uppercase block mb-1">Trade Nexus Corporate</span>
              <h2 className="font-display font-black text-xl text-[#0A2540]">{profile.name}</h2>
              <p className="text-slate-500 font-medium">{profile.roleTitle} • {profile.department}</p>
            </div>

            <div className="text-left sm:text-right font-mono space-y-0.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <p className="text-slate-500">Employee Code: <strong className="text-[#0A2540]">{profile.empCode}</strong></p>
              <p className="text-slate-500">Joining Date: <span className="text-slate-700">{profile.joinDate}</span></p>
              <p className="text-slate-500">Disbursed Date: <span className="text-emerald-700 font-bold">{payslip.generatedDate}</span></p>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Earnings Column */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h4 className="font-display font-extrabold text-xs text-[#0A2540] uppercase tracking-wider border-b border-slate-200 pb-2">
                Earnings (Gross)
              </h4>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-bold text-slate-800">₹{payslip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-bold text-slate-800">₹{payslip.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">Special Allowance</span>
                <span className="font-bold text-slate-800">₹{payslip.specialAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">Performance Incentives</span>
                <span className="font-bold text-emerald-600">₹{payslip.incentives.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono pt-2 font-black text-slate-900 text-sm">
                <span>Total Earnings</span>
                <span>₹{totalEarnings.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h4 className="font-display font-extrabold text-xs text-rose-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                Deductions
              </h4>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">Provident Fund (PF)</span>
                <span className="font-bold text-slate-800">₹{payslip.pfDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-slate-100">
                <span className="text-slate-600">Income Tax / TDS</span>
                <span className="font-bold text-slate-800">₹{payslip.taxDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono pt-8 font-black text-rose-700 text-sm">
                <span>Total Deductions</span>
                <span>₹{totalDeductions.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Net Pay Callout */}
          <div className="nexus-card p-5 bg-gradient-to-r from-[#0A2540] to-[#0F3258] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block mb-0.5">
                Net Salary Transferred to Bank Account
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Direct NEFT / IMPS Credit to registered payroll account
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono-nums font-black text-2xl sm:text-3xl text-[#00C9A7]">
                ₹{payslip.netPay.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Compliance Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digitally signed and generated by Trade Nexus Corporate HR System</span>
            </div>
            <span>Confidential</span>
          </div>

        </div>

      </div>
    </div>
  );
};
