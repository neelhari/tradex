import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  FileText
} from 'lucide-react';

export const DesktopAttendanceLeaves: React.FC = () => {
  const { profile, attendanceLogs, leaveRequests, setIsFaceIdModalOpen, setIsLeaveModalOpen, triggerToast } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Attendance Records & Leave Management
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Biometric Face ID tracking, working hours logs, and leave approval pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFaceIdModalOpen(true)}
            className="flex items-center gap-2 bg-[#E6FAF6] border border-[#00C9A7]/30 text-[#00A88B] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#00C9A7]/20 transition-all shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Verify Face Recognition</span>
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Monthly Calendar (Left 5 Cols) + Leave Quotas & History Table (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Monthly Calendar Card */}
        <div className="lg:col-span-5 nexus-card p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-[#0A2540]">May 2025 Calendar</h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-100">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold">
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const isToday = day === 28;
              const isHoliday = day % 7 === 0 || day % 7 === 1;
              const isLeave = day === 22;

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-all ${
                    isToday ? 'bg-[#00C9A7] text-[#0A2540] shadow-md shadow-[#00C9A7]/30 font-extrabold' :
                    isLeave ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    isHoliday ? 'bg-slate-50 text-slate-400' :
                    day < 28 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'text-slate-600'
                  }`}
                >
                  <span>{day}</span>
                  {day < 28 && !isHoliday && !isLeave && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present (22 Days)</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Approved Leave (1)</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent (0 Days)</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Week Off (8 Days)</span>
          </div>
        </div>

        {/* Right: Leave Balances + Request History Table */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Leave Quota Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Casual Leave</span>
              <span className="font-mono-nums font-black text-2xl text-[#0A2540] my-1 block">7 / 8</span>
              <span className="text-[10px] text-emerald-600 font-bold block">1 Used</span>
            </div>

            <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sick Leave</span>
              <span className="font-mono-nums font-black text-2xl text-sky-600 my-1 block">4 / 4</span>
              <span className="text-[10px] text-sky-600 font-bold block">Full Quota</span>
            </div>

            <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paid Leaves</span>
              <span className="font-mono-nums font-black text-2xl text-[#00A88B] my-1 block">2 / 2</span>
              <span className="text-[10px] text-[#00A88B] font-bold block">Available</span>
            </div>
          </div>

          {/* Leave Requests History Table */}
          <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-[#0A2540]">Leave Applications History</h3>
              <span className="text-xs text-slate-400 font-medium">Supervisor: Ramesh Sharma</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-3 px-2">Leave Type</th>
                    <th className="pb-3 px-2">Date Range</th>
                    <th className="pb-3 px-2">Days</th>
                    <th className="pb-3 px-2">Reason</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2 font-bold text-[#0A2540]">{req.leaveType}</td>
                      <td className="py-3 px-2 font-mono text-slate-600">{req.fromDate} to {req.toDate}</td>
                      <td className="py-3 px-2 font-mono font-bold text-slate-800">{req.totalDays} Day(s)</td>
                      <td className="py-3 px-2 text-slate-600 max-w-xs truncate">{req.reason}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-500">
                        {req.approvedBy ? req.approvedBy : 'Pending TL Review'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
