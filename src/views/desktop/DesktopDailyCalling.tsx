import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useScreenData } from '../../hooks/useScreenData';
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
  MessageSquare,
  FileSpreadsheet,
  X,
  Sparkles
} from 'lucide-react';
import { CallOutcome, AssignedLead } from '../../types';

export const DesktopDailyCalling: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Disposition Modal
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<AssignedLead | null>(null);
  const [callDisposition, setCallDisposition] = useState<AssignedLead['status']>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [dealAmount, setDealAmount] = useState<number>(0);
  const [callbackTime, setCallbackTime] = useState('');

  // Filter assigned leads for the active employee
  const myAssignedLeads = assignedLeads.filter(lead => {
    const isMine = lead.assignedToEmployeeId === profile.id || 
                   (lead.assignedToEmployeeName ?? '').toLowerCase() === profile.name.toLowerCase() ||
                   lead.assignedToEmployeeId === 'emp-101';
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.phone.includes(searchQuery);
    return isMine && matchesSearch;
  });

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = log.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.phoneNumber.includes(searchQuery);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Daily Calling Activity & Assigned Leads
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Admin Allocated Excel Leads • Live Telecaller CRM • Real-Time Stats Sync
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
            <span className="text-xs text-slate-400 block mt-1 font-semibold">Target: {stats.todayGoalCalls} Dials</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Connected Calls</span>
            <span className="font-mono-nums font-black text-2xl text-sky-600">{stats.connected}</span>
            <span className="text-xs text-sky-600 block mt-1 font-extrabold">
              {Math.round((stats.connected / Math.max(1, stats.dialsMade)) * 100)}% Connection Rate
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Leads</span>
            <span className="font-mono-nums font-black text-2xl text-teal-700">{myAssignedLeads.length}</span>
            <span className="text-xs text-teal-600 block mt-1 font-bold">Admin Allocated Queue</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sales Achieved</span>
            <span className="font-mono-nums font-black text-2xl text-[#00A88B]">₹{(stats.monthlySalesAchieved / 1000).toFixed(0)}k</span>
            <span className="text-xs text-[#00A88B] block mt-1 font-extrabold">{stats.interested} Converted/Hot</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tab Bar: Assigned Leads from Admin vs Historical Call Logs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'assigned'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-[#00C9A7]" />
          <span>Assigned Leads from Admin ({myAssignedLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Completed Call Logs ({filteredLogs.length})</span>
        </button>
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
            placeholder={activeTab === 'assigned' ? "Search assigned leads..." : "Search client name, company, or phone number..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7] font-medium"
          />
        </div>

        {/* Filter Tabs for History */}
        {activeTab === 'history' && (
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
        )}
      </div>

      {/* VIEW A: Assigned Leads Queue Table */}
      {activeTab === 'assigned' && (
        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Lead Contact & Company</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">City / Region</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Notes / Requirement</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myAssignedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-display font-bold text-sm text-[#0A2540] block">{lead.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{lead.company}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700 whitespace-nowrap font-bold">
                      {lead.phone}
                    </td>
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                      {lead.city || 'Pan-India'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                        lead.status === 'INTERESTED' ? 'bg-sky-100 text-sky-800' :
                        lead.status === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                        lead.status === 'CONNECTED' ? 'bg-teal-100 text-teal-800' :
                        lead.status === 'NOT_INTERESTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-md">
                      <p className="line-clamp-2">{lead.notes || 'Allocated lead batch'}</p>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenCallModal(lead)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call & Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: Full-Width Calling Logs Table */}
      {activeTab === 'history' && (
        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
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
      )}

      {/* Desktop Call Disposition Modal */}
      {selectedLeadForCall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Telecaller Live Disposition</span>
                <h3 className="font-display font-black text-xl text-[#0A2540]">{selectedLeadForCall.name}</h3>
                <p className="text-xs text-slate-500">{selectedLeadForCall.company} • {selectedLeadForCall.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedLeadForCall(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisposition} className="space-y-4 text-xs">
              
              {/* Disposition Outcome */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Call Outcome / Disposition *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CONNECTED', label: 'Connected', color: 'bg-teal-50 text-teal-800 border-teal-300' },
                    { id: 'INTERESTED', label: 'Interested', color: 'bg-sky-50 text-sky-800 border-sky-300' },
                    { id: 'CALLBACK', label: 'Callback', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'CONVERTED', label: 'Deal Closed 🎉', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { id: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-rose-50 text-rose-800 border-rose-300' },
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setCallDisposition(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
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
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="font-bold text-emerald-900 block text-[11px]">
                    Deal Value Closed (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(Number(e.target.value) || 0)}
                    placeholder="e.g. 50000"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="font-bold text-slate-700 block mb-1">Conversation Notes & Details</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Key discussion points, product interest, client budget, objections..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-teal-500/20"
                >
                  Save Disposition & Sync Dashboards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeadForCall(null)}
                  className="py-3 px-5 rounded-xl bg-slate-100 text-slate-600 font-bold"
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

