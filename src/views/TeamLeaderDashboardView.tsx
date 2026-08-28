import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  PhoneCall, 
  TrendingUp, 
  CalendarCheck, 
  ShieldCheck, 
  ArrowUpRight,
  Clock
} from 'lucide-react';

export const TeamLeaderDashboardView: React.FC = () => {
  const { leaveRequests, triggerToast } = useApp();

  const teamMembers = [
    { name: 'Arjun Kumar', role: 'Senior Telecaller', dials: 68, connected: 44, sales: '₹1,45,000', status: 'ON DUTY (09:12 AM)' },
    { name: 'Neha Sharma', role: 'Telecaller', dials: 54, connected: 38, sales: '₹95,000', status: 'ON DUTY (09:05 AM)' },
    { name: 'Vikas Patel', role: 'Telecaller', dials: 61, connected: 41, sales: '₹1,20,000', status: 'ON DUTY (09:18 AM)' },
    { name: 'Rohit Joshi', role: 'Junior Telecaller', dials: 32, connected: 20, sales: '₹40,000', status: 'ON LEAVE' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 px-2 sm:px-4 w-full max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540]">Team Leader Hub</h2>
          <p className="text-xs text-slate-500 font-semibold">Alpha Growth Team • Ramesh Sharma</p>
        </div>
        <span className="text-xs font-bold text-[#00A88B] bg-[#E6FAF6] px-3 py-1.5 rounded-full border border-[#00C9A7]/30">
          10 / 12 Present Today
        </span>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="nexus-card p-4 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase">Team Members</span>
          <span className="font-mono-nums font-black text-2xl text-[#0A2540] my-1 block">12</span>
          <span className="text-xs text-emerald-600 font-bold block">10 Present (2 on leave)</span>
        </div>

        <div className="nexus-card p-4 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase">Team Calls Today</span>
          <span className="font-mono-nums font-black text-2xl text-sky-600 my-1 block">415</span>
          <span className="text-xs text-slate-500 font-bold block">Target: 600 Calls</span>
        </div>

        <div className="nexus-card p-4 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase">Team Sales Achieved</span>
          <span className="font-mono-nums font-black text-2xl text-[#00A88B] my-1 block">₹4.80 Lakhs</span>
          <span className="text-xs text-[#00A88B] font-bold block">78% of Monthly Target</span>
        </div>
      </div>

      {/* Desktop 2-Column Split: Pending Approvals (Left) + Calling Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Pending Leave Approvals */}
        <div className="nexus-card p-4.5 bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              <h4 className="font-display font-bold text-sm text-[#0A2540]">Pending Leave Approvals ({leaveRequests.filter(r => r.status === 'PENDING').length})</h4>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Action Needed</span>
          </div>

          <div className="space-y-2.5">
            {leaveRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0A2540]">Arjun Kumar • {req.leaveType}</span>
                  <span className="font-mono text-slate-500 font-semibold">{req.fromDate}</span>
                </div>
                <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">{req.reason}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => triggerToast(`✓ Leave Approved for Arjun Kumar`)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    Approve Leave
                  </button>
                  <button
                    onClick={() => triggerToast(`✗ Leave Rejected`)}
                    className="py-2 px-4 rounded-xl bg-white border border-slate-200 text-rose-600 font-bold text-xs hover:bg-rose-50 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Calling Leaderboard */}
        <div className="nexus-card p-4.5 bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-display font-bold text-sm text-[#0A2540]">Team Calling Leaderboard</h4>
            <span className="text-xs font-bold text-[#00A88B]">Live Ranking</span>
          </div>
          
          <div className="space-y-2.5">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#00C9A7] transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-extrabold text-xs text-[#0A2540] shadow-sm">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-display font-bold text-xs text-[#0A2540] block">{member.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{member.status}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono-nums font-bold text-xs text-sky-700 block">{member.dials} Dials ({member.connected} Connected)</span>
                  <span className="font-mono text-xs font-extrabold text-[#00A88B]">{member.sales}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
