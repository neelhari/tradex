import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, Trash2, Sparkles, CheckCircle2, Clock, Award } from 'lucide-react';
import { CompanyHoliday } from '../../types';

export const AdminCalendarConfig: React.FC = () => {
  const {
    weeklyOffDays,
    toggleWeeklyOffDay,
    companyHolidays,
    addCompanyHoliday,
    deleteCompanyHoliday,
    triggerToast,
  } = useApp();

  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState<CompanyHoliday['type']>('FESTIVAL');
  const [isAdding, setIsAdding] = useState(false);

  const dayNames = [
    { label: 'Sun', full: 'Sunday', index: 0 },
    { label: 'Mon', full: 'Monday', index: 1 },
    { label: 'Tue', full: 'Tuesday', index: 2 },
    { label: 'Wed', full: 'Wednesday', index: 3 },
    { label: 'Thu', full: 'Thursday', index: 4 },
    { label: 'Fri', full: 'Friday', index: 5 },
    { label: 'Sat', full: 'Saturday', index: 6 },
  ];

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim()) {
      triggerToast('Please provide a holiday name');
      return;
    }
    if (!holidayDate) {
      triggerToast('Please select a date for the holiday');
      return;
    }

    addCompanyHoliday({
      name: holidayName.trim(),
      date: holidayDate,
      type: holidayType,
    });

    setHolidayName('');
    setHolidayDate('');
    setIsAdding(false);
  };

  return (
    <div className="nexus-card bg-white border border-slate-200 shadow-sm rounded-3xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-[#0A2540] tracking-tight">
              Company Calendar &amp; Holidays
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Updates propagate instantly across all employee calendars in the hierarchy
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{isAdding ? 'Close Form' : '+ Add Holiday'}</span>
        </button>
      </div>

      {/* 1. Weekly Off Configuration */}
      <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#0A2540] block">Weekly Off Schedule</span>
            <span className="text-[11px] text-slate-500">
              Select which recurring days of the week are company-wide off days
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            {weeklyOffDays.length} Off Day{weeklyOffDays.length === 1 ? '' : 's'}/wk
          </span>
        </div>

        {/* Day Pills */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {dayNames.map((d) => {
            const isOff = weeklyOffDays.includes(d.index);
            return (
              <button
                key={d.index}
                type="button"
                onClick={() => toggleWeeklyOffDay(d.index)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                  isOff
                    ? 'bg-[#0A2540] text-white shadow-xs ring-2 ring-[#00C9A7]/40 font-black'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[11px] leading-tight block">{d.label}</span>
                <span
                  className={`text-[8px] font-mono uppercase mt-0.5 block ${
                    isOff ? 'text-[#00C9A7] font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {isOff ? 'OFF' : 'Work'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Add Holiday Inline Modal/Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateHoliday}
          className="p-4 bg-gradient-to-br from-indigo-50/50 via-white to-white border border-indigo-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Schedule New Company Holiday</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Holiday Date
              </label>
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Holiday Name
              </label>
              <input
                type="text"
                placeholder="e.g. Diwali Festival"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Holiday Category
              </label>
              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="FESTIVAL">Festival Holiday</option>
                <option value="NATIONAL">National Holiday</option>
                <option value="COMPANY">Company Holiday</option>
                <option value="OPTIONAL">Optional / Restricted</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Holiday
            </button>
          </div>
        </form>
      )}

      {/* 3. Official Company Holidays List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-black text-sm text-[#0A2540] flex items-center gap-1.5">
            <span>Official Holidays Calendar</span>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
              {companyHolidays.length} Listed
            </span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Highlighted with purple indicators on employee calendars
          </span>
        </div>

        {companyHolidays.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl">
            No official company holidays added yet. Click "+ Add Holiday" to add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {companyHolidays.map((hol) => (
              <div
                key={hol.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0A2540] truncate block">
                      {hol.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                        hol.type === 'NATIONAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : hol.type === 'FESTIVAL'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {hol.type || 'FESTIVAL'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold block mt-0.5">
                    📅 {new Date(`${hol.date}T00:00:00`).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteCompanyHoliday(hol.id)}
                  title="Remove Holiday"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
