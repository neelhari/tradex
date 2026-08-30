import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
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
  X,
  FileSpreadsheet,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { CallOutcome, AssignedLead } from '../types';

export const DailyCallingView: React.FC = () => {
  const { 
    callLogs, 
    stats, 
    assignedLeads, 
    profile, 
    updateAssignedLeadStatus, 
    setIsQuickCallModalOpen, 
    triggerToast 
  } = useApp();

  useScreenData('dailyCalling');

  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'history'>('assigned');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Active Lead Disposition Modal State
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<AssignedLead | null>(null);
  const [callDisposition, setCallDisposition] = useState<AssignedLead['status']>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [dealAmount, setDealAmount] = useState<number>(0);
  const [callbackTime, setCallbackTime] = useState('');

  // Filter assigned leads for the active employee (or fallback to all if matching)
  const myAssignedLeads = assignedLeads.filter(lead => {
    const isMine = lead.assignedToEmployeeId === profile.id || 
                   (lead.assignedToEmployeeName ?? '').toLowerCase() === profile.name.toLowerCase() ||
                   lead.assignedToEmployeeId === 'emp-101'; // Default demo telecaller
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                          lead.company.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone.includes(search);
    return isMine && matchesSearch;
  });

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = log.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          log.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          log.phoneNumber.includes(search);
    if (selectedOutcome === 'ALL') return matchesSearch;
    return matchesSearch && log.outcome === selectedOutcome;
  });

  const handleOpenCallModal = (lead: AssignedLead) => {
    setSelectedLeadForCall(lead);
    setCallDisposition(lead.status === 'PENDING' ? 'CONNECTED' : lead.status);
    setCallNotes(lead.notes || '');
    setDealAmount(lead.dealValue || 0);
    setCallbackTime(lead.followUpDate || 'Today, 03:00 PM');
  };

  const handleSaveDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForCall) return;

    updateAssignedLeadStatus(
      selectedLeadForCall.id,
      callDisposition,
      callNotes,
      callDisposition === 'CONVERTED' ? dealAmount : undefined,
      callDisposition === 'CALLBACK' ? callbackTime : undefined
    );

    setSelectedLeadForCall(null);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. View Header with Quick Log Call Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">
            Daily Calling Activity
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Assigned Leads from Admin • Live Dispositions
          </p>
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
          <span className="text-[9px] text-slate-400 font-medium block">Target: {stats.todayGoalCalls}</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Connected</span>
          <span className="font-mono-nums font-black text-xl text-sky-600 my-0.5 block">{stats.connected}</span>
          <span className="text-[9px] text-sky-600 font-bold block">{Math.round((stats.connected / Math.max(1, stats.dialsMade)) * 100)}% Rate</span>
        </div>

        <div className="nexus-card p-3 text-center bg-white border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Interested</span>
          <span className="font-mono-nums font-black text-xl text-emerald-600 my-0.5 block">{stats.interested}</span>
          <span className="text-[9px] text-emerald-600 font-bold block">Hot Leads</span>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher: Assigned Queue vs Call History */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('assigned')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'assigned'
              ? 'bg-white text-[#0A2540] shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
          <span>Assigned Leads Queue ({myAssignedLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'history'
              ? 'bg-white text-[#0A2540] shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Call History ({callLogs.length})</span>
        </button>
      </div>

      {/* 4. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeSubTab === 'assigned' ? "Search assigned leads..." : "Search call history..."}
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

      {/* TAB A: Assigned Leads Queue from Admin Excel */}
      {activeSubTab === 'assigned' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-display font-bold text-xs text-slate-500">
              Admin Allocated Leads ({myAssignedLeads.length})
            </h4>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Confidential Batch
            </span>
          </div>

          {myAssignedLeads.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No assigned leads found</p>
              <p className="text-[11px] text-slate-400">Admin will allocate new lead batches from the Excel import tool.</p>
            </div>
          ) : (
            myAssignedLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="nexus-card p-3.5 bg-white border border-slate-200 shadow-sm space-y-2.5 hover:border-teal-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">{lead.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{lead.company} • {lead.city || 'Pan-India'}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                    lead.status === 'INTERESTED' ? 'bg-sky-100 text-sky-800' :
                    lead.status === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                    lead.status === 'CONNECTED' ? 'bg-teal-100 text-teal-800' :
                    lead.status === 'NOT_INTERESTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Phone className="w-3 h-3 text-[#00C9A7]" />
                    <span>{lead.phone}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Dials: {lead.callCount}
                  </span>
                </div>

                {lead.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                    {lead.notes}
                  </p>
                )}

                {lead.followUpDate && (
                  <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>Follow-up: {lead.followUpDate}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenCallModal(lead)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call & Update Disposition</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB B: Call History */}
      {activeSubTab === 'history' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          
          {/* Outcome Filter Tabs */}
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
      )}

      {/* Call Disposition & Notes Modal */}
      {selectedLeadForCall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Live Call Disposition</span>
                <h3 className="font-display font-black text-lg text-[#0A2540]">{selectedLeadForCall.name}</h3>
                <p className="text-xs text-slate-500">{selectedLeadForCall.company} • {selectedLeadForCall.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedLeadForCall(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisposition} className="space-y-3.5 text-xs">
              
              {/* Disposition Outcome */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Call Outcome / Status *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CONNECTED', label: 'Connected', color: 'bg-teal-50 text-teal-800 border-teal-300' },
                    { id: 'INTERESTED', label: 'Interested', color: 'bg-sky-50 text-sky-800 border-sky-300' },
                    { id: 'CALLBACK', label: 'Callback', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'CONVERTED', label: 'Deal Converted 🎉', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { id: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-rose-50 text-rose-800 border-rose-300' },
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setCallDisposition(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        callDisposition === opt.id
                          ? `${opt.color} border-2 ring-2 ring-teal-500/20`
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deal Value if Converted */}
              {callDisposition === 'CONVERTED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="font-bold text-emerald-900 block text-[11px]">
                    Deal Value Closed (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(Number(e.target.value) || 0)}
                    placeholder="e.g. 50000"
                    className="w-full p-2 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-emerald-700">
                    Will trigger payment verification record for HR audit and update revenue dashboard.
                  </span>
                </div>
              )}

              {/* Callback Time if Callback */}
              {callDisposition === 'CALLBACK' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Callback Time</label>
                  <input
                    type="text"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    placeholder="e.g. Today, 04:30 PM"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Conversation Notes & Requirements</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Key discussion points, product interest, client budget, objections..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs shadow-md shadow-teal-500/20"
                >
                  Save Disposition & Sync Dashboards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeadForCall(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
