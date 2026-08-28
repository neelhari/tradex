import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  DollarSign, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Download,
  TrendingUp,
  Sliders
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { triggerToast } = useApp();

  const pendingPayments = [
    { client: 'Apex Global Corp', amount: '₹45,000', rep: 'Arjun Kumar', date: 'Today, 09:50 AM', txId: 'TXN-984920' },
    { client: 'Zenith Logistics', amount: '₹80,000', rep: 'Arjun Kumar', date: 'Today, 09:35 AM', txId: 'TXN-112849' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 px-4 max-w-lg mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540]">Admin Console</h2>
          <p className="text-xs text-slate-500 font-semibold">Rajesh Singhal • Managing Director</p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Executive Access
        </span>
      </div>

      {/* Global Executive Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Sales</span>
          <span className="font-mono-nums font-black text-xl text-[#00A88B]">₹42.8L</span>
          <span className="text-[9px] text-[#00A88B] font-bold block">84% of TGT</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Collections</span>
          <span className="font-mono-nums font-black text-xl text-[#0A2540]">₹36.5L</span>
          <span className="text-[9px] text-slate-500 font-bold block">₹6.3L Pending</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Dials</span>
          <span className="font-mono-nums font-black text-xl text-sky-600">3,840</span>
          <span className="text-[9px] text-slate-500 font-bold block">This Week</span>
        </div>
      </div>

      {/* Payment Verification & Approval Queue */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h4 className="font-display font-bold text-sm text-[#0A2540]">Payment Verification Queue</h4>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">2 Pending</span>
        </div>

        {pendingPayments.map((pay, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0A2540]">{pay.client}</span>
              <span className="font-mono font-extrabold text-sm text-emerald-700">{pay.amount}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Rep: {pay.rep}</span>
              <span>{pay.txId}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => triggerToast(`✓ Payment of ${pay.amount} Approved and Credited!`)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Approve Payment
              </button>
              <button
                onClick={() => triggerToast(`✗ Payment Rejected with remark`)}
                className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-rose-600 font-bold text-xs hover:bg-rose-50 active:scale-95 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reports & Export Generator (Matching Screen 9 in Reference Image!) */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-[#0A2540]">Reports & Analytics Generator</h4>
          <FileSpreadsheet className="w-4 h-4 text-[#00C9A7]" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Report Type</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold">
              <option>Attendance Report</option>
              <option>Daily Calling Performance</option>
              <option>Sales & Targets (TGT)</option>
              <option>Payment Collections</option>
              <option>Payroll Summary</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Date Range</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold">
              <option>May 2025 (Monthly)</option>
              <option>Last 7 Days</option>
              <option>Current Quarter (Q2)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => triggerToast('✓ Executive Report Exported to Excel & PDF')}
          className="w-full py-2.5 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-bold text-xs shadow-md shadow-[#00C9A7]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Generate & Export Report (PDF / Excel)</span>
        </button>
      </div>

    </div>
  );
};
