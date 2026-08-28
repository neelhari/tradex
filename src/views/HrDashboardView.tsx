import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  UserPlus, 
  FileCheck, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const HrDashboardView: React.FC = () => {
  const { triggerToast } = useApp();

  const candidates = [
    { name: 'Siddharth Rao', role: 'Telecalling Specialist', stage: 'Interview Scheduled', time: 'Today, 03:30 PM' },
    { name: 'Megha Nair', role: 'SDR Team Lead', stage: 'Offer Extended', time: 'Joining 01 Jun' },
    { name: 'Anil Kapoor', role: 'Inside Sales Rep', stage: 'Onboarding Checklist', time: 'Documents Pending' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 px-4 max-w-lg mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540]">HR Operations Portal</h2>
          <p className="text-xs text-slate-500 font-semibold">Priya Verma • People & Compliance</p>
        </div>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
          96 Active Employees
        </span>
      </div>

      {/* HR KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Attendance</span>
          <span className="font-mono-nums font-black text-xl text-emerald-600">94.2%</span>
          <span className="text-[9px] text-slate-500 font-bold block">Biometric Verified</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Open Positions</span>
          <span className="font-mono-nums font-black text-xl text-[#00A88B]">6</span>
          <span className="text-[9px] text-slate-500 font-bold block">14 Interviews</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Onboarding</span>
          <span className="font-mono-nums font-black text-xl text-sky-600">3</span>
          <span className="text-[9px] text-slate-500 font-bold block">New Joiners</span>
        </div>
      </div>

      {/* Quick HR Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => triggerToast('✓ May 2025 Bulk Payslips Generated & Sent to 96 Employees')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] text-left shadow-sm active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs text-[#0A2540]">Generate Payslips</h4>
          <p className="text-[10px] text-slate-400">1-click bulk monthly salary</p>
        </button>

        <button
          onClick={() => triggerToast('✓ Batch ID Card generator opened')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] text-left shadow-sm active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center mb-2">
            <CreditCard className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs text-[#0A2540]">Issue ID Cards</h4>
          <p className="text-[10px] text-slate-400">Generate print-ready PDFs</p>
        </button>
      </div>

      {/* Recruitment & Candidates */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-[#0A2540]">Active Candidate Pipeline</h4>
          <span className="text-xs font-bold text-[#00A88B] cursor-pointer" onClick={() => triggerToast('Viewing complete recruitment board')}>View All</span>
        </div>

        <div className="space-y-2">
          {candidates.map((cand, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-display font-bold text-xs text-[#0A2540] block">{cand.name}</span>
                <span className="text-[10px] text-slate-500">{cand.role}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 block mb-0.5">
                  {cand.stage}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{cand.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
