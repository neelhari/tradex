import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
import { 
  Users, 
  Search, 
  Phone, 
  PhoneCall,
  Clock, 
  CheckCircle2, 
  Award,
  X,
  PhoneForwarded,
  PhoneOff,
  ThumbsDown,
  Layers
} from 'lucide-react';
import { AssignedLead } from '../types';

export const ClientsPipelineView: React.FC = () => {
  const { 
    assignedLeads, 
    profile, 
    openCallModalForLead, 
    triggerToast 
  } = useApp();

  useScreenData('clientsPipeline');
  const [activeTab, setActiveTab] = useState<'TO_CALL' | 'CALLBACK' | 'INTERESTED' | 'WON' | 'BUSY' | 'NOT_INTERESTED' | 'ALL'>('TO_CALL');
  const [search, setSearch] = useState('');

  // Leads assigned to the active telecaller
  const myLeads = assignedLeads.filter((l) => {
    const isMine =
      l.assignedToEmployeeId === profile.id ||
      (l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === profile.name.toLowerCase()) ||
      l.assignedToEmployeeId === 'emp-101'; // Demo telecaller fallback
    return isMine;
  });

  const toCallCount = myLeads.filter((l) => l.status === 'PENDING').length;
  const followUpCount = myLeads.filter((l) => l.status === 'CALLBACK').length;
  const interestedCount = myLeads.filter((l) => l.status === 'INTERESTED').length;
  const wonCount = myLeads.filter((l) => l.status === 'CONVERTED').length;
  const busyCount = myLeads.filter((l) => l.status === 'BUSY').length;
  const notInterestedCount = myLeads.filter((l) => l.status === 'NOT_INTERESTED').length;

  const filteredLeads = myLeads.filter((lead) => {
    const q = search.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.phone.includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'TO_CALL') return lead.status === 'PENDING';
    if (activeTab === 'CALLBACK') return lead.status === 'CALLBACK';
    if (activeTab === 'INTERESTED') return lead.status === 'INTERESTED';
    if (activeTab === 'WON') return lead.status === 'CONVERTED';
    if (activeTab === 'BUSY') return lead.status === 'BUSY';
    if (activeTab === 'NOT_INTERESTED') return lead.status === 'NOT_INTERESTED';
    return true; // ALL
  });

  const getStatusBadge = (status: AssignedLead['status'], callCount: number) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
            {callCount === 0 ? 'Fresh' : 'Pending'}
          </span>
        );
      case 'INTERESTED':
        return (
          <span className="bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Interested
          </span>
        );
      case 'CALLBACK':
        return (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
            <PhoneForwarded className="w-3 h-3 text-amber-600" />
            Follow-Up
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" />
            Won Deal
          </span>
        );
      case 'BUSY':
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
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

  const handleCallLead = (lead: AssignedLead) => {
    openCallModalForLead(lead);
    window.location.href = `tel:${lead.phone}`;
    triggerToast(`📞 Dialing ${lead.name}...`);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">My Leads</h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Assigned by Admin · Tap to call and record result
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-teal-50 text-[#00A88B] px-2.5 py-1 rounded-lg border border-[#00C9A7]/20">
          {myLeads.length} Total
        </span>
      </div>

      {/* 2. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, or phone..."
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

      {/* 3. Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'TO_CALL', label: 'To Call', count: toCallCount },
          { id: 'CALLBACK', label: 'Follow-Ups', count: followUpCount },
          { id: 'INTERESTED', label: 'Interested', count: interestedCount },
          { id: 'WON', label: 'Won Deals', count: wonCount },
          { id: 'BUSY', label: 'No Answer', count: busyCount },
          { id: 'NOT_INTERESTED', label: 'Not Interested', count: notInterestedCount },
          { id: 'ALL', label: 'All', count: myLeads.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Lead Cards List */}
      <div className="space-y-3">
        {filteredLeads.map((lead) => (
          <div 
            key={lead.id} 
            className="nexus-card p-4 bg-white border border-slate-200 shadow-sm hover:border-[#00C9A7] transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0A2540]">{lead.name}</h4>
                <p className="text-xs font-semibold text-slate-600">{lead.company} {lead.city ? `· ${lead.city}` : ''}</p>
              </div>
              {getStatusBadge(lead.status, lead.callCount)}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800">{lead.phone}</span>
              <span className="text-[11px] text-slate-400">
                {lead.callCount === 0 ? 'Never called' : `Dials: ${lead.callCount}`}
              </span>
            </div>

            {lead.followUpDate && (
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Follow-up: {lead.followUpDate}</span>
              </div>
            )}

            {lead.notes && (
              <p className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                "{lead.notes}"
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleCallLead(lead)}
                className="py-2.5 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => openCallModalForLead(lead)}
                className="py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Record Result</span>
              </button>
            </div>
          </div>
        ))}

        {!filteredLeads.length && (
          <div className="nexus-card p-8 bg-white border border-slate-200 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-display font-bold text-sm text-[#0A2540]">No leads in this category</h4>
            <p className="text-xs text-slate-400">
              {search ? 'Try clearing your search query.' : 'Leads with this status will appear here.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
