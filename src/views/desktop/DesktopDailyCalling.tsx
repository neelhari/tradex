import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  MessageSquare 
} from 'lucide-react';
import { CallOutcome } from '../../types';

export const DesktopDailyCalling: React.FC = () => {
  const { callLogs, stats, setIsQuickCallModalOpen, triggerToast } = useApp();
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = log.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.phoneNumber.includes(searchQuery);
    if (selectedOutcome === 'ALL') return matchesSearch;
    return matchesSearch && log.outcome === selectedOutcome;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Daily Calling Activity & Call Logs
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time dial registry, conversation records, and conversion metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerToast('📊 Exporting calling activity to CSV / Excel')}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#00C9A7] text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsQuickCallModalOpen(true)}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log New Call</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Dials Made</span>
            <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{stats.dialsMade}</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Target: 100 Dials</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Connected Calls</span>
            <span className="font-mono-nums font-black text-2xl text-sky-600">{stats.connected}</span>
            <span className="text-xs text-sky-600 block mt-1 font-extrabold">65% Connection Rate</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Duration</span>
            <span className="font-mono-nums font-black text-2xl text-[#0A2540]">3m 05s</span>
            <span className="text-xs text-emerald-600 block mt-1 font-bold">+25s vs Team Avg</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Interested / Closed</span>
            <span className="font-mono-nums font-black text-2xl text-[#00A88B]">{stats.interested}</span>
            <span className="text-xs text-[#00A88B] block mt-1 font-extrabold">₹1.45L Value</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or phone number..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CONNECTED', 'INTERESTED', 'DEAL_CLOSED', 'CALLBACK', 'BUSY', 'NOT_INTERESTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedOutcome(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedOutcome === filter
                  ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter === 'ALL' ? 'All Calls' : filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Width Calling Logs Table */}
      <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Client Name & Company</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Talk Duration</th>
                <th className="py-3.5 px-4">Call Outcome</th>
                <th className="py-3.5 px-4">Detailed Notes & Discussion</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono text-slate-400 font-semibold whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-display font-bold text-sm text-[#0A2540] block">{log.clientName}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{log.companyName}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {log.phoneNumber}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700 whitespace-nowrap font-bold">
                    {Math.floor(log.durationSec / 60)}m {log.durationSec % 60}s
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      log.outcome === 'DEAL_CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                      log.outcome === 'INTERESTED' ? 'bg-sky-100 text-sky-800' :
                      log.outcome === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                      log.outcome === 'CONNECTED' ? 'bg-teal-100 text-teal-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.outcome.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-md">
                    <p className="line-clamp-2">{log.notes}</p>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => triggerToast(`📞 Dialing ${log.clientName} (${log.phoneNumber})`)}
                      className="px-3 py-1.5 rounded-lg bg-[#E6FAF6] hover:bg-[#00C9A7] text-[#00A88B] hover:text-[#0A2540] font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Redial</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
