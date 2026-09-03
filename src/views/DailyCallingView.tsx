import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
import { 
  PhoneCall, 
  Plus, 
  Clock, 
  Search, 
  Phone, 
  CheckCircle2, 
  X, 
  PhoneForwarded, 
  PhoneOff, 
  ThumbsDown, 
  Award,
  Sparkles,
  History,
  ArrowUpRight,
  AlertCircle,
  Zap
} from 'lucide-react';
import { CallOutcome, AssignedLead } from '../types';

export const DailyCallingView: React.FC = () => {
  const { 
    callLogs, 
    stats, 
    assignedLeads,
    profile,
    openCallModalForLead,
    setIsQuickCallModalOpen, 
    setActiveCallingLead,
    recordCallLog,
    triggerToast
  } = useApp();

  useScreenData('dailyCalling');

  const [activeSection, setActiveSection] = useState<'FRESH_CALLS' | 'CALL_LOGS'>('FRESH_CALLS');
  const [activeQueueFilter, setActiveQueueFilter] = useState<'ALL_ASSIGNED' | 'CALLBACKS' | 'INTERESTED'>('ALL_ASSIGNED');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Leads allocated to this telecaller
  const myAssignedLeads = assignedLeads.filter((l) => {
    return (
      !l.assignedToEmployeeId ||
      l.assignedToEmployeeId === profile.id ||
      (l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === profile.name.toLowerCase()) ||
      l.assignedToEmployeeId === 'emp-101'
    );
  });

  const uncalledLeads = myAssignedLeads.filter((l) => l.status === 'PENDING');
  const callbackLeads = myAssignedLeads.filter((l) => l.status === 'CALLBACK');
  const interestedLeads = myAssignedLeads.filter((l) => l.status === 'INTERESTED');
  const freshLeads = uncalledLeads;

  const totalAssigned = myAssignedLeads.length;
  const dialsDone = myAssignedLeads.filter((l) => l.status !== 'PENDING').length;

  // Yesterday / Overdue Callbacks detector
  const todayIso = new Date().toISOString().split('T')[0];
  const yesterdayCallbacksCount = callbackLeads.filter((l) => {
    const d = (l.followUpDate || '').toLowerCase();
    return d.includes('yesterday') || (l.followUpDate && l.followUpDate.split(' ')[0] < todayIso);
  }).length;

  // Filtered queue based on active cube + search
  // When activeQueueFilter is 'ALL_ASSIGNED', ONLY uncalled leads (PENDING) are shown,
  // so whenever a lead is called, it immediately leaves the fresh queue (12345 -> 2345)!
  const currentQueueLeads = myAssignedLeads.filter((l) => {
    if (activeQueueFilter === 'CALLBACKS') {
      if (l.status !== 'CALLBACK') return false;
    } else if (activeQueueFilter === 'INTERESTED') {
      if (l.status !== 'INTERESTED') return false;
    } else {
      // Fresh queue: ONLY PENDING leads
      if (l.status !== 'PENDING') return false;
    }

    const q = search.trim().toLowerCase();
    if (!q) return true;
    return l.phone.includes(q);
  });

  const filteredLogs = callLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.phoneNumber.includes(q) ||
      (log.clientName && log.clientName.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (selectedOutcome === 'ALL') return true;
    return log.outcome === selectedOutcome;
  });

  const handleCallLead = (lead: AssignedLead) => {
    openCallModalForLead(lead);
    window.location.href = `tel:${lead.phone}`;
    triggerToast(`📞 Dialing ${lead.phone}...`);
  };

  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'INTERESTED':
        return (
          <span className="bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Interested
          </span>
        );
      case 'DEAL_CLOSED':
        return (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" />
            Won Deal
          </span>
        );
      case 'CALLBACK':
        return (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
            <PhoneForwarded className="w-3 h-3 text-amber-600" />
            Call Back
          </span>
        );
      case 'BUSY':
        return (
          <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
            <PhoneOff className="w-3 h-3 text-slate-500" />
            No Answer
          </span>
        );
      case 'NOT_INTERESTED':
        return (
          <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
            <ThumbsDown className="w-3 h-3 text-rose-500" />
            Not Interested
          </span>
        );
      case 'CONNECTED':
      default:
        return (
          <span className="bg-teal-50 text-[#00876f] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#00A88B]" />
            Spoke
          </span>
        );
    }
  };

  const formatDuration = (sec: number) => {
    if (!sec) return '00s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}m ` : ''}${s > 0 ? `${s}s` : ''}`;
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Primary Calling Mode Segment Switch */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
        <button
          onClick={() => { setActiveSection('FRESH_CALLS'); setSearch(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            activeSection === 'FRESH_CALLS'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-[#00C9A7]" />
          <span>Fresh Calls</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-1 ${
            activeSection === 'FRESH_CALLS'
              ? 'bg-white/20 text-[#00C9A7]'
              : 'bg-slate-300 text-slate-700'
          }`}>
            {freshLeads.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveSection('CALL_LOGS'); setSearch(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            activeSection === 'CALL_LOGS'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-sky-400" />
          <span>Call Logs</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-1 ${
            activeSection === 'CALL_LOGS'
              ? 'bg-white/20 text-sky-300'
              : 'bg-slate-300 text-slate-700'
          }`}>
            {callLogs.length}
          </span>
        </button>
      </div>

      {/* 2. SECTION A: FRESH CALLS / TODAY'S CALLING QUEUE */}
      {activeSection === 'FRESH_CALLS' && (
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between pt-0.5">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540] tracking-tight">
                Today's Calling Queue
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Live target &amp; follow-up pipeline
              </p>
            </div>
            <span className="text-xs font-mono font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-200/80">
              {uncalledLeads.length} To Call
            </span>
          </div>

          {/* 3 Interactive Action Cubes (Unified 100/100 Glassmorphic Styling) */}
          {/* 3 Cohesive Interactive Action Cubes */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Cube 1: Fresh Uncalled Leads Queue */}
            <button
              type="button"
              onClick={() => setActiveQueueFilter('ALL_ASSIGNED')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between min-h-[96px] cursor-pointer ${
                activeQueueFilter === 'ALL_ASSIGNED'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fresh Queue
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-xl text-[#0A2540] leading-none">
                    {uncalledLeads.length}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    To Call
                  </span>
                </div>
                <span className="text-[10px] font-semibold font-mono text-slate-400 block mt-1">
                  {dialsDone} / {totalAssigned} done
                </span>
              </div>
            </button>

            {/* Cube 2: Callbacks Due Today & Overdue from Yesterday */}
            <button
              type="button"
              onClick={() => setActiveQueueFilter('CALLBACKS')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between min-h-[96px] cursor-pointer ${
                activeQueueFilter === 'CALLBACKS'
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Callbacks
                </span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-xl text-[#0A2540] leading-none">
                    {callbackLeads.length}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Due
                  </span>
                </div>
                {yesterdayCallbacksCount > 0 ? (
                  <span className="text-[9px] font-black font-mono text-rose-600 block mt-1">
                    ⚠️ {yesterdayCallbacksCount} Overdue
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-500 block mt-1">
                    Scheduled today
                  </span>
                )}
              </div>
            </button>

            {/* Cube 3: Interested Leads Ready to Close */}
            <button
              type="button"
              onClick={() => setActiveQueueFilter('INTERESTED')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between min-h-[96px] cursor-pointer ${
                activeQueueFilter === 'INTERESTED'
                  ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-sky-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Interested
                </span>
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-xl text-[#0A2540] leading-none">
                    {interestedLeads.length}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                    Hot
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 block mt-1">
                  Ready to close
                </span>
              </div>
            </button>
          </div>

          {/* Search by Phone Number */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone number..."
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-8 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-[#00C9A7] shadow-2xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-3.5 p-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Calling Queue Cards: FULL Phone Number Displayed, NO developer import junk */}
          {currentQueueLeads.length > 0 ? (
            <div className="space-y-2">
              {currentQueueLeads.map((lead) => {
                const isYesterdayCallback =
                  lead.status === 'CALLBACK' &&
                  ((lead.followUpDate || '').toLowerCase().includes('yesterday') ||
                   (lead.followUpDate && lead.followUpDate.split(' ')[0] < todayIso));

                return (
                  <div
                    key={lead.id}
                    className={`nexus-card p-3.5 bg-white border rounded-2xl shadow-xs transition-all flex items-center justify-between gap-3 ${
                      isYesterdayCallback
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200/90 hover:border-[#00C9A7]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isYesterdayCallback
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : lead.status === 'CALLBACK' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/80' 
                          : lead.status === 'INTERESTED'
                          ? 'bg-sky-50 text-sky-600 border border-sky-200/80'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {lead.status === 'CALLBACK' ? (
                          isYesterdayCallback ? <AlertCircle className="w-4 h-4 stroke-[2.4]" /> : <Clock className="w-4 h-4 stroke-[2.2]" />
                        ) : (
                          <Phone className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {/* Full phone number, never truncated */}
                        <span className="font-mono font-black text-[15px] text-[#0A2540] tracking-tight block whitespace-nowrap">
                          {lead.phone}
                        </span>
                        {lead.status === 'CALLBACK' ? (
                          isYesterdayCallback ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-md mt-0.5 bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                              <span>⚠️ Yesterday's Callback (Call First!)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <span>⏰ Callback: {lead.followUpDate || 'Today, 04:00 PM'}</span>
                            </span>
                          )
                        ) : lead.status === 'INTERESTED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-sky-100 text-sky-800 border border-sky-200">
                            <CheckCircle2 className="w-3 h-3 text-sky-600 flex-shrink-0" />
                            <span>🟢 Interested Hot Lead</span>
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-slate-100 text-slate-600">
                            Fresh Lead · Ready to Call
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleCallLead(lead)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] hover:opacity-95 text-[#0A2540] font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => {
                          openCallModalForLead(lead);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Result</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="nexus-card p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-display font-bold text-sm text-[#0A2540]">
                {activeQueueFilter === 'ALL_ASSIGNED' ? 'All Fresh Calls Completed!' : 'Queue Empty'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {activeQueueFilter === 'ALL_ASSIGNED'
                  ? '0 uncalled leads remaining. Great job! Check Callbacks or Interested to follow up.'
                  : 'No leads match this category right now.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. SECTION B: CALL LOGS (Today's History) */}
      {activeSection === 'CALL_LOGS' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">
                Call Logs
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Today's Completed Calls Register
              </p>
            </div>
            <button
              onClick={() => {
                setActiveCallingLead(null);
                setIsQuickCallModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#0A2540] hover:bg-[#12385f] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-all flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#00C9A7] stroke-[3]" />
              <span>Log Call</span>
            </button>
          </div>

          {/* Top Summary Metric Chips */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calls Made</span>
              <span className="font-mono-nums font-black text-lg text-[#0A2540] mt-0.5 block">
                {stats.dialsMade} <span className="text-xs font-normal text-slate-400">/ {stats.todayGoalCalls}</span>
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">Connected</span>
              <span className="font-mono-nums font-black text-lg text-sky-600 mt-0.5 block">
                {stats.connected}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Interested</span>
              <span className="font-mono-nums font-black text-lg text-emerald-600 mt-0.5 block">
                {stats.interested}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone number..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] shadow-xs font-medium"
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

          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'ALL', label: 'All Logs' },
              { id: 'INTERESTED', label: 'Interested' },
              { id: 'CALLBACK', label: 'Callbacks' },
              { id: 'DEAL_CLOSED', label: 'Won Deals' },
              { id: 'BUSY', label: 'No Answer' },
              { id: 'NOT_INTERESTED', label: 'Not Interested' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOutcome(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedOutcome === tab.id
                    ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs font-extrabold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Call Logs Feed */}
          {filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="nexus-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#00C9A7]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-[#0A2540] block">
                        {log.phoneNumber}
                      </span>
                      {log.clientName && log.clientName !== 'Direct Caller' && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{log.clientName}</p>
                      )}
                    </div>
                    {getOutcomeBadge(log.outcome)}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDuration(log.durationSec)}
                    </span>
                    <span>{log.timestamp}</span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{log.notes}"
                    </p>
                  )}

                  {log.followUpDate && (
                    <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Follow-up: <strong>{log.followUpDate}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="nexus-card p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
              <PhoneCall className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-display font-bold text-sm text-[#0A2540]">No calls logged yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {search ? 'No call logs match that search.' : 'Calls you complete will show up here.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
