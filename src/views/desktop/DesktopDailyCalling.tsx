import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { CallOutcome } from '../../types';

export const DesktopDailyCalling: React.FC = () => {
  const { 
    callLogs, 
    stats, 
    setIsQuickCallModalOpen, 
    setActiveCallingLead,
    triggerToast 
  } = useApp();

  useScreenData('dailyCalling');

  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = callLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.clientName.toLowerCase().includes(q) ||
      log.companyName.toLowerCase().includes(q) ||
      log.phoneNumber.includes(q);

    if (!matchesSearch) return false;
    if (selectedOutcome === 'ALL') return true;
    return log.outcome === selectedOutcome;
  });

  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'INTERESTED':
        return (
          <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            Interested
          </span>
        );
      case 'DEAL_CLOSED':
        return (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 w-fit">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Won Deal
          </span>
        );
      case 'CALLBACK':
        return (
          <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 w-fit">
            <PhoneForwarded className="w-3.5 h-3.5 text-amber-600" />
            Call Back
          </span>
        );
      case 'BUSY':
        return (
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 w-fit">
            <PhoneOff className="w-3.5 h-3.5 text-slate-500" />
            No Answer
          </span>
        );
      case 'NOT_INTERESTED':
        return (
          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5 w-fit">
            <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
            Not Interested
          </span>
        );
      case 'CONNECTED':
      default:
        return (
          <span className="bg-teal-50 text-[#00876f] text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1.5 w-fit">
            <Phone className="w-3.5 h-3.5 text-[#00A88B]" />
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

  const handleExportCsv = () => {
    const header = 'Time,Client Name,Company,Phone,Duration (sec),Outcome,Notes,Follow Up';
    const rows = filteredLogs.map((l) =>
      `"${l.timestamp}","${l.clientName}","${l.companyName}","${l.phoneNumber}",${l.durationSec},"${l.outcome}","${(l.notes || '').replace(/"/g, '""')}","${l.followUpDate || ''}"`
    );
    const csv = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Call_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Call logs downloaded to CSV');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Call Logs & Register
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Complete record of today's completed calls, durations, and client responses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#00C9A7] text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setActiveCallingLead(null);
              setIsQuickCallModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log Call</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today's Dials</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{stats.dialsMade}</span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ {stats.todayGoalCalls} Target</span>
          </div>
        </div>

        <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-sky-500 uppercase tracking-wider block">Connected Calls</span>
          <span className="font-mono-nums font-black text-2xl text-sky-600">{stats.connected}</span>
        </div>

        <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Interested Prospects</span>
          <span className="font-mono-nums font-black text-2xl text-emerald-600">{stats.interested}</span>
        </div>

        <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Duration</span>
          <span className="font-mono-nums font-black text-2xl text-[#0A2540]">
            {formatDuration(stats.averageCallDurationSec || 120)}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Calls' },
            { id: 'CONNECTED', label: 'Spoke' },
            { id: 'INTERESTED', label: 'Interested' },
            { id: 'CALLBACK', label: 'Callbacks' },
            { id: 'DEAL_CLOSED', label: 'Won Deals' },
            { id: 'BUSY', label: 'No Answer' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedOutcome(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedOutcome === tab.id
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, company or phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Call History Table */}
      <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[50rem]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/70">
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Client / Contact</th>
                <th className="py-3.5 px-5">Company</th>
                <th className="py-3.5 px-5">Phone Number</th>
                <th className="py-3.5 px-5">Duration</th>
                <th className="py-3.5 px-5">Outcome</th>
                <th className="py-3.5 px-5">Notes & Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-500 font-semibold">{log.timestamp}</td>
                  <td className="py-3.5 px-5 font-bold text-[#0A2540]">{log.clientName}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">{log.companyName}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-700">{log.phoneNumber}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-600">{formatDuration(log.durationSec)}</td>
                  <td className="py-3.5 px-5">{getOutcomeBadge(log.outcome)}</td>
                  <td className="py-3.5 px-5 max-w-xs">
                    <p className="truncate text-slate-600 text-xs">{log.notes || '—'}</p>
                    {log.followUpDate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                        <Clock className="w-3 h-3" />
                        {log.followUpDate}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredLogs.length && (
          <div className="p-10 text-center space-y-2">
            <PhoneCall className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-display font-bold text-sm text-[#0A2540]">No calls recorded</h4>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'No calls matched your search query.' : 'Calls you log will appear in this register.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
