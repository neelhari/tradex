import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
import { 
  Award, 
  Calendar, 
  Search, 
  CheckCircle2, 
  X, 
  TrendingUp,
  Sparkles,
  Phone,
  Clock,
  Filter
} from 'lucide-react';
import { AssignedLead } from '../types';

export const ClientsPipelineView: React.FC = () => {
  const { 
    assignedLeads, 
    profile, 
    stats 
  } = useApp();

  useScreenData('clientsPipeline');

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_MONTH' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState<string>('');
  const [search, setSearch] = useState('');

  // Leads converted by this telecaller
  const myWonLeads = useMemo(() => {
    return assignedLeads.filter((l) => {
      const isMine =
        !l.assignedToEmployeeId ||
        l.assignedToEmployeeId === profile.id ||
        (l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === profile.name.toLowerCase()) ||
        l.assignedToEmployeeId === 'emp-101';
      return isMine && l.status === 'CONVERTED';
    });
  }, [assignedLeads, profile]);

  // Today's formatted YYYY-MM-DD string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter won leads by selected calendar date/period
  const filteredWonLeads = useMemo(() => {
    return myWonLeads.filter((lead) => {
      // Search filter by phone number
      const q = search.toLowerCase();
      if (q && !lead.phone.includes(q)) {
        return false;
      }

      // Date filtering
      const leadDateStr = lead.updatedAt ? lead.updatedAt.split('T')[0] : todayStr;

      if (dateFilter === 'TODAY') {
        return leadDateStr === todayStr;
      }
      if (dateFilter === 'YESTERDAY') {
        return leadDateStr === yesterdayStr;
      }
      if (dateFilter === 'THIS_MONTH') {
        const currentMonth = todayStr.slice(0, 7);
        return leadDateStr.startsWith(currentMonth);
      }
      if (dateFilter === 'CUSTOM' && customDate) {
        return leadDateStr === customDate;
      }
      return true; // 'ALL'
    });
  }, [myWonLeads, dateFilter, customDate, search, todayStr, yesterdayStr]);

  // Total Revenue of currently selected date filter
  const totalSelectedRevenue = useMemo(() => {
    return filteredWonLeads.reduce((sum, lead) => {
      return sum + (lead.dealValue || 25000);
    }, 0);
  }, [filteredWonLeads]);

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col gap-3.5 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between pt-0.5">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight flex items-center gap-1.5">
            <span>Won Deals</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Verified Closed Conversions &amp; Earnings
          </p>
        </div>
      </div>

      {/* 2. Total Revenue Hero Card (Ultra-Premium Light FinTech Luxury) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-5 rounded-3xl border border-emerald-200/90 shadow-sm">
        {/* Soft Ambient Radiance Orbs */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-emerald-300/25 via-teal-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-200/15 rounded-full blur-xl pointer-events-none" />

        {/* Top Label Row */}
        <div className="flex items-center justify-between relative z-10 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-black block">
                Total Revenue
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {dateFilter === 'ALL' && 'All-Time Verified Conversions'}
                {dateFilter === 'TODAY' && 'Earned Today'}
                {dateFilter === 'YESTERDAY' && 'Earned Yesterday'}
                {dateFilter === 'THIS_MONTH' && 'This Month Revenue'}
                {dateFilter === 'CUSTOM' && `Date: ${customDate}`}
              </span>
            </div>
          </div>
        </div>

        {/* Big Amount */}
        <div className="flex items-baseline gap-2.5 relative z-10 pt-1">
          <span className="font-display font-black text-4xl sm:text-5xl text-[#0A2540] tracking-tight">
            {inr(dateFilter === 'ALL' ? (totalSelectedRevenue || stats.monthlySalesAchieved) : totalSelectedRevenue)}
          </span>
        </div>
      </div>

      {/* 3. Calendar & Period Date Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-0.5">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter by Period</span>
          </span>
          {dateFilter !== 'ALL' && (
            <button
              onClick={() => { setDateFilter('ALL'); setCustomDate(''); }}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-extrabold"
            >
              Reset to All Time
            </button>
          )}
        </div>

        {/* Quick Date Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'TODAY', label: 'Today' },
            { id: 'YESTERDAY', label: 'Yesterday' },
            { id: 'THIS_MONTH', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setDateFilter(tab.id as any);
                setCustomDate('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 text-center active:scale-[0.98] ${
                dateFilter === tab.id
                  ? 'bg-[#0A2540] text-white shadow-xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar Specific Date Picker */}
        <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs">
          <Calendar className="w-4 h-4 text-emerald-600 ml-2 mr-2 pointer-events-none" />
          <span className="text-xs font-semibold text-slate-600 mr-2 flex-shrink-0">
            Pick Date:
          </span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if (e.target.value) {
                setDateFilter('CUSTOM');
              } else {
                setDateFilter('ALL');
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
          />
          {customDate && (
            <button
              onClick={() => { setCustomDate(''); setDateFilter('ALL'); }}
              className="ml-2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by phone number..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7] shadow-xs font-medium"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-2.5 p-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 5. Won Deals List (Dedicated - No Call Buttons) */}
      <div className="space-y-3">
        {filteredWonLeads.length > 0 ? (
          filteredWonLeads.map((lead) => (
            <div 
              key={lead.id} 
              className="nexus-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
            >
              {/* Top Row: Phone Number + Deal Amount Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-base text-[#0A2540] tracking-tight block">
                    {lead.phone}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Closed: {lead.updatedAt ? lead.updatedAt.split('T')[0] : 'Today'}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+{inr(lead.dealValue || 25000)}</span>
                  </span>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Deal Closed &amp; Verified
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Dials: {lead.callCount || 1}
                </span>
              </div>

              {/* Notes: Only legitimate notes, hide test suite text */}
              {lead.notes && 
               !lead.notes.toLowerCase().includes('test suite') && 
               !lead.notes.toLowerCase().includes('automated_test') && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{lead.notes}"
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="nexus-card p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
            <Award className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-display font-bold text-sm text-[#0A2540]">
              No won deals found for this date
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {search ? 'No deals match your search.' : 'Deals closed on this date will appear here.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
