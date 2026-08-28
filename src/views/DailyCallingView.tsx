import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PhoneCall, 
  Plus, 
  Clock, 
  Search, 
  Filter, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  X
} from 'lucide-react';
import { CallOutcome } from '../types';

export const DailyCallingView: React.FC = () => {
  const { callLogs, stats, setIsQuickCallModalOpen, triggerToast } = useApp();
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = log.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          log.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          log.phoneNumber.includes(search);
    if (selectedOutcome === 'ALL') return matchesSearch;
    return matchesSearch && log.outcome === selectedOutcome;
  });

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. View Header with Quick Log Call Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">
            Daily Calling Activity
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Log dials, track conversations & production</p>
        </div>

        <button
          onClick={() => setIsQuickCallModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#00C9A7]/25 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Call</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Total Dials</span>
          <span className="font-mono-nums font-black text-xl text-[#0A2540] my-0.5 block">{stats.dialsMade}</span>
          <span className="text-[9px] text-slate-400 font-medium block">Target: 100</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Connected</span>
          <span className="font-mono-nums font-black text-xl text-sky-600 my-0.5 block">{stats.connected}</span>
          <span className="text-[9px] text-sky-600 font-bold block">65% Rate</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Avg Duration</span>
          <span className="font-mono-nums font-black text-xl text-emerald-600 my-0.5 block">3m 05s</span>
          <span className="text-[9px] text-emerald-600 font-bold block">Target &gt; 2m</span>
        </div>
      </div>

      {/* 3. Search Bar with Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client, company, or phone..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] shadow-xs font-medium"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-2.5 p-0.5 rounded-full bg-slate-200 text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 4. Outcome Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {['ALL', 'CONNECTED', 'INTERESTED', 'DEAL_CLOSED', 'CALLBACK', 'BUSY'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedOutcome(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedOutcome === tab
                ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs font-extrabold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Calls' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* 5. Chronological Calling Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-display font-bold text-xs text-slate-500">Today's Call History ({filteredLogs.length})</h4>
          <span className="text-[10px] text-slate-400 font-mono">Chronological</span>
        </div>

        {filteredLogs.map((log) => (
          <div key={log.id} className="nexus-card p-3.5 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0A2540]">{log.clientName}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{log.companyName}</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                log.outcome === 'DEAL_CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                log.outcome === 'INTERESTED' ? 'bg-sky-100 text-sky-800' :
                log.outcome === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                log.outcome === 'CONNECTED' ? 'bg-teal-100 text-teal-800' :
                'bg-slate-100 text-slate-600'
              }`}>
                {log.outcome.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#00C9A7]" />
                <span>{log.phoneNumber}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{Math.floor(log.durationSec / 60)}m {log.durationSec % 60}s</span>
                <span className="text-slate-300">•</span>
                <span>{log.timestamp}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
              {log.notes}
            </p>

            {log.followUpDate && (
              <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-600" />
                <span>Scheduled Callback: {log.followUpDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
