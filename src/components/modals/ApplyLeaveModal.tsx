import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CalendarCheck, FileText } from 'lucide-react';

export const ApplyLeaveModal: React.FC = () => {
  const { isLeaveModalOpen, setIsLeaveModalOpen, submitLeaveRequest, profile } = useApp();

  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned / Paid Leave'>('Casual Leave');
  const [fromDate, setFromDate] = useState('02 Jun 2025');
  const [toDate, setToDate] = useState('03 Jun 2025');
  const [reason, setReason] = useState('');

  if (!isLeaveModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      leaveType,
      fromDate,
      toDate,
      totalDays: 2,
      reason: reason || 'Personal reasons',
    });
    setIsLeaveModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] flex items-center justify-center text-[#00C9A7]">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0A2540]">Apply for Leave</h3>
              <p className="text-xs text-slate-500">Balance: {profile.totalLeaveBalance} Days Available</p>
            </div>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            >
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Earned / Paid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for leave..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] text-[#0A2540] font-display font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[#00C9A7]/25 hover:brightness-105 active:scale-95 transition-all"
          >
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
};
