import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useScreenData } from '../../hooks/useScreenData';
import { 
  PhoneCall, 
  Plus, 
  Search, 
  Download, 
  Phone, 
  Clock, 
  CheckCircle2, 
  PhoneForwarded, 
  PhoneOff, 
  ThumbsDown, 
  Award, 
  X,
  History,
  Zap,
  Check,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { CallOutcome, AssignedLead } from '../../types';

export const DesktopDailyCalling: React.FC = () => {
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

  const [activeSection, setActiveSection] = useState<'QUEUE' | 'LOGS'>('QUEUE');
  const [activeQueueFilter, setActiveQueueFilter] = useState<'ALL_ASSIGNED' | 'CALLBACKS' | 'INTERESTED'>('ALL_ASSIGNED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');

  // Leads allocated to this telecaller
  const myAssignedLeads = useMemo(() => {
    return assignedLeads.filter((l) => {
      return (
        !l.assignedToEmployeeId ||
        l.assignedToEmployeeId === profile.id ||
        (l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === profile.name.toLowerCase()) ||
        l.assignedToEmployeeId === 'emp-101'
      );
    });
  }, [assignedLeads, profile]);

  const uncalledLeads = useMemo(() => myAssignedLeads.filter((l) => l.status === 'PENDING'), [myAssignedLeads]);
  const callbackLeads = useMemo(() => myAssignedLeads.filter((l) => l.status === 'CALLBACK'), [myAssignedLeads]);
  const interestedLeads = useMemo(() => myAssignedLeads.filter((l) => l.status === 'INTERESTED'), [myAssignedLeads]);

  const totalAssigned = myAssignedLeads.length;
  const dialsDone = myAssignedLeads.filter((l) => l.status !== 'PENDING').length;

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayCallbacksCount = useMemo(() => {
    return callbackLeads.filter((l) => {
      const d = (l.followUpDate || '').toLowerCase();
      return d.includes('yesterday') || (l.followUpDate && l.followUpDate.split(' ')[0] < todayIso);
    }).length;
  }, [callbackLeads, todayIso]);

  // Filtered queue based on active cube + search
  // When activeQueueFilter is 'ALL_ASSIGNED', ONLY uncalled leads (PENDING) are shown,
  // so whenever a lead is called, it immediately leaves the fresh queue (12345 -> 2345)!
  const currentQueueLeads = useMemo(() => {
    let list = myAssignedLeads;
    if (activeQueueFilter === 'CALLBACKS') {
      list = callbackLeads;
    } else if (activeQueueFilter === 'INTERESTED') {
      list = interestedLeads;
    } else {
      // Fresh Queue: ONLY PENDING leads
      list = myAssignedLeads.filter((l) => l.status === 'PENDING');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((l) => l.phone.includes(q));
  }, [myAssignedLeads, activeQueueFilter, callbackLeads, interestedLeads, searchQuery]);

  const handleDialActive = (lead: AssignedLead) => {
    window.location.href = `tel:${lead.phone}`;
    triggerToast(`📞 Dialing ${lead.phone}...`);
  };

  // Filtered history logs
  const filteredLogs = useMemo(() => {
    return callLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matches = !q || log.phoneNumber.includes(q) || (log.clientName && log.clientName.toLowerCase().includes(q));
      if (!matches) return false;
      if (selectedOutcome === 'ALL') return true;
      return log.outcome === selectedOutcome;
    });
  }, [callLogs, searchQuery, selectedOutcome]);

  const handleExportLogsCsv = () => {
    const header = 'Time,Phone,Client Name,Duration,Outcome,Notes,Follow Up';
    const rows = filteredLogs.map((l) =>
      `"${l.timestamp}","${l.phoneNumber}","${l.clientName || ''}",${l.durationSec},"${l.outcome}","${(l.notes || '').replace(/"/g, '""')}","${l.followUpDate || ''}"`
    );
    const csv = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Call_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Call logs exported to CSV');
  };

  const formatDuration = (sec: number) => {
    if (!sec) return '00s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}m ` : ''}${s > 0 ? `${s}s` : ''}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Desktop Top Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Daily Calling Station
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Desktop Power Dialer · Master queue, scheduled callbacks, and live result logger
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => { setActiveSection('QUEUE'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'QUEUE'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#00C9A7]" />
              <span>Calling Queue</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSection === 'QUEUE' ? 'bg-white/20 text-[#00C9A7]' : 'bg-slate-200 text-slate-700'
              }`}>
                {currentQueueLeads.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveSection('LOGS'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'LOGS'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Call Logs</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSection === 'LOGS' ? 'bg-white/20 text-sky-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {callLogs.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setActiveCallingLead(null);
              setIsQuickCallModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION A: LIVE CALLING QUEUE WORKSTATION */}
      {activeSection === 'QUEUE' && (
        <div className="space-y-6">
          
          {/* 3 Desktop KPI Cubes (Widescreen Strip) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cube 1: Fresh Queue Progress */}
            <button
              onClick={() => setActiveQueueFilter('ALL_ASSIGNED')}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeQueueFilter === 'ALL_ASSIGNED'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fresh Queue
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-3xl text-[#0A2540]">
                    {uncalledLeads.length}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    To Call
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${totalAssigned > 0 ? (dialsDone / totalAssigned) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold font-mono text-slate-400 block mt-2">
                  {dialsDone} / {totalAssigned} dials completed
                </span>
              </div>
            </button>

            {/* Cube 2: Callbacks Due Today & Overdue from Yesterday */}
            <button
              onClick={() => setActiveQueueFilter('CALLBACKS')}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeQueueFilter === 'CALLBACKS'
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scheduled Callbacks
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-3xl text-[#0A2540]">
                    {callbackLeads.length}
                  </span>
                  <span className="text-xs font-bold font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                    Due
                  </span>
                </div>
                {yesterdayCallbacksCount > 0 ? (
                  <span className="text-xs font-black font-mono text-rose-600 block mt-3">
                    ⚠️ {yesterdayCallbacksCount} Overdue from Yesterday
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 block mt-3">
                    {callbackLeads.length > 0 ? 'Follow-ups scheduled today' : 'No pending callbacks today'}
                  </span>
                )}
              </div>
            </button>

            {/* Cube 3: Interested Hot Leads */}
            <button
              onClick={() => setActiveQueueFilter('INTERESTED')}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeQueueFilter === 'INTERESTED'
                  ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-sky-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interested Leads
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-3xl text-[#0A2540]">
                    {interestedLeads.length}
                  </span>
                  <span className="text-xs font-bold font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">
                    Hot Prospects
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 block mt-3">
                  Ready to advance into Won Deals
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Queue Workspace */}
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by phone number..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">
                {currentQueueLeads.length} Leads in Queue
              </span>
            </div>

            {/* Lead Cards Grid (2-column desktop grid for comfortable reading) */}
            {currentQueueLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQueueLeads.map((lead) => {
                  const isYesterdayCallback =
                    lead.status === 'CALLBACK' &&
                    ((lead.followUpDate || '').toLowerCase().includes('yesterday') ||
                     (lead.followUpDate && lead.followUpDate.split(' ')[0] < todayIso));

                  return (
                    <div
                      key={lead.id}
                      className={`nexus-card p-4 bg-white border rounded-2xl shadow-xs transition-all flex items-center justify-between gap-4 ${
                        isYesterdayCallback
                          ? 'border-rose-300 ring-1 ring-rose-200'
                          : 'border-slate-200/90 hover:border-[#00C9A7]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isYesterdayCallback
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : lead.status === 'CALLBACK' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                            : lead.status === 'INTERESTED'
                            ? 'bg-sky-50 text-sky-600 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {lead.status === 'CALLBACK' ? (
                            isYesterdayCallback ? <AlertCircle className="w-5 h-5 stroke-[2.4]" /> : <Clock className="w-5 h-5 stroke-[2.2]" />
                          ) : (
                            <Phone className="w-5 h-5 stroke-[2.2]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="font-mono font-black text-base text-[#0A2540] tracking-tight block whitespace-nowrap">
                            {lead.phone}
                          </span>
                          {lead.status === 'CALLBACK' ? (
                            isYesterdayCallback ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-md mt-0.5 bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>⚠️ Yesterday's Callback (Call First!)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>⏰ Callback: {lead.followUpDate || 'Today, 04:00 PM'}</span>
                              </span>
                            )
                          ) : lead.status === 'INTERESTED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-sky-100 text-sky-800 border border-sky-200">
                              <CheckCircle2 className="w-3 h-3 text-sky-600" />
                              <span>🟢 Interested Prospect</span>
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-0.5 bg-slate-100 text-slate-600">
                              Fresh Lead · Ready to Dial
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDialActive(lead)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] hover:opacity-95 text-[#0A2540] font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => openCallModalForLead(lead)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
              <div className="nexus-card p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#00C9A7] mx-auto" />
                <h4 className="font-display font-bold text-base text-[#0A2540]">
                  {activeQueueFilter === 'ALL_ASSIGNED' ? 'All Fresh Calls Completed!' : 'Queue Completed!'}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeQueueFilter === 'ALL_ASSIGNED'
                    ? '0 uncalled leads remaining. Great job! Check Callbacks or Interested to follow up.'
                    : 'No leads match this category right now.'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. SECTION B: CALL LOGS REGISTER */}
      {activeSection === 'LOGS' && (
        <div className="space-y-4">
          
          {/* Filter & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex gap-2">
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedOutcome === tab.id
                      ? 'bg-[#0A2540] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <button
                onClick={handleExportLogsCsv}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Call Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6">Outcome</th>
                    <th className="py-3.5 px-6">Duration</th>
                    <th className="py-3.5 px-6">Follow-Up</th>
                    <th className="py-3.5 px-6">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-slate-500">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-6 font-mono font-black text-sm text-[#0A2540]">
                          {log.phoneNumber}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-lg border ${
                            log.outcome === 'DEAL_CLOSED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.outcome === 'INTERESTED'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : log.outcome === 'CALLBACK'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {log.outcome}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">
                          {formatDuration(log.durationSec)}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-amber-700 font-bold">
                          {log.followUpDate || '—'}
                        </td>
                        <td className="py-3.5 px-6 text-slate-600 italic max-w-xs truncate">
                          {log.notes ? `"${log.notes}"` : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No call logs match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
