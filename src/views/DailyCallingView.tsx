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
  Award
} from 'lucide-react';
import { CallOutcome } from '../types';

export const DailyCallingView: React.FC = () => {
  const { 
    callLogs, 
    stats, 
    setIsQuickCallModalOpen, 
    setActiveCallingLead 
  } = useApp();

  useScreenData('dailyCalling');

  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = callLogs.filter((log) => {
    const q = search.toLowerCase();
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
      
      {/* 1. Header */}
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

      {/* 2. Top Summary Metric Chips */}
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

      {/* 3. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client, company, or phone..."
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

      {/* 4. Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'ALL', label: 'All Logs' },
          { id: 'CONNECTED', label: 'Spoke' },
          { id: 'INTERESTED', label: 'Interested' },
          { id: 'CALLBACK', label: 'Callbacks' },
          { id: 'DEAL_CLOSED', label: 'Won Deals' },
          { id: 'BUSY', label: 'No Answer' },
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

      {/* 5. Completed Calls List */}
      <div className="space-y-2.5">
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className="nexus-card p-3.5 bg-white border border-slate-200 shadow-xs space-y-2 hover:border-[#00C9A7] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0A2540]">{log.clientName}</h4>
                <p className="text-xs text-slate-600 font-medium">{log.companyName}</p>
              </div>
              {getOutcomeBadge(log.outcome)}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{log.phoneNumber}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatDuration(log.durationSec)}
                </span>
                <span className="text-[11px] text-slate-400">{log.timestamp}</span>
              </div>
            </div>

            {log.notes && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                "{log.notes}"
              </p>
            )}

            {log.followUpDate && (
              <div className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Follow-up: {log.followUpDate}
              </div>
            )}
          </div>
        ))}

        {!filteredLogs.length && (
          <div className="nexus-card p-8 bg-white border border-slate-200 text-center space-y-2">
            <PhoneCall className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-display font-bold text-sm text-[#0A2540]">No calls recorded yet</h4>
            <p className="text-xs text-slate-400">
              {search ? 'No call logs match that search.' : 'Calls you log from My Leads will show up here.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
