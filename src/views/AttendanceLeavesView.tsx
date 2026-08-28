import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  UserCheck, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const AttendanceLeavesView: React.FC = () => {
  const { attendanceLogs, leaveRequests, setIsFaceIdModalOpen, setIsLeaveModalOpen, profile } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves'>('attendance');

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Sub-Tab Switcher */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'attendance'
              ? 'bg-white text-[#0A2540] shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Calendar
        </button>

        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'leaves'
              ? 'bg-white text-[#0A2540] shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leave Management
        </button>
      </div>

      {activeSubTab === 'attendance' ? (
        <div className="space-y-4">
          {/* Biometric Card */}
          <div className="nexus-card p-3.5 bg-gradient-to-r from-[#E6FAF6]/90 via-white to-white border border-[#00C9A7]/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/15 text-[#00A88B] flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0A2540]">Face Recognition Status</h4>
                <p className="text-[11px] text-slate-500 font-mono">Today: {profile.checkInTime} (Present)</p>
              </div>
            </div>
            <button
              onClick={() => setIsFaceIdModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs shadow-xs active:scale-95 transition-all"
            >
              Verify
            </button>
          </div>

          {/* Monthly Calendar View Card */}
          <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="font-display font-black text-base text-[#0A2540]">May 2025</h4>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
                <button className="p-1 rounded-lg hover:bg-slate-100"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Days Grid with clean vertical separation */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono font-bold">
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 28;
                const isHoliday = day % 7 === 0 || day % 7 === 1;
                const isLeave = day === 22;
                
                return (
                  <div
                    key={day}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center relative ${
                      isToday ? 'bg-[#00C9A7] text-[#0A2540] shadow-md shadow-[#00C9A7]/30 font-extrabold' :
                      isLeave ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      isHoliday ? 'bg-slate-50 text-slate-400' :
                      day < 28 ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200' :
                      'text-slate-600'
                    }`}
                  >
                    <span className="text-xs leading-none">{day}</span>
                    {day < 28 && !isHoliday && !isLeave && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                    )}
                    {isLeave && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present (22 Days)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Leave (1 Day)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Absent (0 Days)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Weekly Off (8 Days)</span>
            </div>
          </div>

          {/* Attendance Log Stream */}
          <div className="space-y-2">
            <h4 className="font-display font-bold text-xs text-slate-500 px-1">Recent Daily Logs</h4>
            {attendanceLogs.map((log, idx) => (
              <div key={idx} className="nexus-card p-3 bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0A2540] block">{log.date === '2025-05-28' ? 'Today, 28 May 2025' : log.date === '2025-05-27' ? 'Yesterday, 27 May 2025' : log.date}</span>
                  <span className="text-slate-400 text-[10px] font-mono block mt-0.5">{log.method || 'Weekly Off'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">{log.workHours ? `${log.workHours} Worked` : 'Holiday'}</span>
                  {log.checkIn && <span className="text-[10px] font-mono text-slate-400 block">{log.checkIn} - {log.checkOut}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Leave Requests Tab */
        <div className="space-y-4">
          <div className="nexus-card p-4 bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="font-display font-bold text-sm text-[#0A2540]">Annual Leave Balance</h4>
              <p className="text-[11px] text-slate-500 font-medium">14 Days Available for 2025</p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#00C9A7]/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Apply Leave</span>
            </button>
          </div>

          {/* Requests History List */}
          <div className="space-y-2.5">
            <h4 className="font-display font-bold text-xs text-slate-500 px-1">Leave Requests History</h4>
            {leaveRequests.map((req) => (
              <div key={req.id} className="nexus-card p-3.5 bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#0A2540]">{req.leaveType}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-600">
                  <span>{req.fromDate} to {req.toDate}</span> • <strong>{req.totalDays} Day(s)</strong>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {req.reason}
                </p>

                {req.approvedBy && (
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approved by {req.approvedBy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
