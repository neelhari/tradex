import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useScreenData } from '../../hooks/useScreenData';
import { 
  Users, 
  Search, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Download,
  PhoneForwarded,
  Award,
  ThumbsDown,
  Layers
} from 'lucide-react';
import { AssignedLead } from '../../types';

export const DesktopClientsPipeline: React.FC = () => {
  const { 
    assignedLeads, 
    profile, 
    openCallModalForLead, 
    triggerToast 
  } = useApp();

  useScreenData('clientsPipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TO_CALL' | 'CALLBACK' | 'INTERESTED' | 'WON' | 'BUSY' | 'NOT_INTERESTED'>('ALL');

  // Leads assigned to the active telecaller
  const myLeads = assignedLeads.filter((l) => {
    const isMine =
      l.assignedToEmployeeId === profile.id ||
      (l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === profile.name.toLowerCase()) ||
      l.assignedToEmployeeId === 'emp-101';
    return isMine;
  });

  const filteredLeads = myLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.phone.includes(q);

    if (!matchesSearch) return false;
    if (activeFilter === 'TO_CALL') return lead.status === 'PENDING';
    if (activeFilter === 'CALLBACK') return lead.status === 'CALLBACK';
    if (activeFilter === 'INTERESTED') return lead.status === 'INTERESTED';
    if (activeFilter === 'WON') return lead.status === 'CONVERTED';
    if (activeFilter === 'BUSY') return lead.status === 'BUSY';
    if (activeFilter === 'NOT_INTERESTED') return lead.status === 'NOT_INTERESTED';
    return true;
  });

  const getStatusBadge = (status: AssignedLead['status'], callCount: number) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
            {callCount === 0 ? 'Fresh Lead' : 'Pending'}
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
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
            Called
          </span>
        );
    }
  };

  const handleCallLead = (lead: AssignedLead) => {
    openCallModalForLead(lead);
    window.location.href = `tel:${lead.phone}`;
    triggerToast(`📞 Dialing ${lead.name}...`);
  };

  const handleExportCsv = () => {
    const header = 'Lead Name,Company,City,Phone,Status,Calls Made,Notes,Follow Up';
    const rows = filteredLeads.map((l) =>
      `"${l.name}","${l.company}","${l.city || ''}","${l.phone}","${l.status}",${l.callCount},"${(l.notes || '').replace(/"/g, '""')}","${l.followUpDate || ''}"`
    );
    const csv = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `My_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Leads exported to CSV');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            My Leads & Pipeline
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Admin assigned client leads · Call, record outcomes, and track conversions
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
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-2">
          {[
            { id: 'ALL', label: 'All Leads', count: myLeads.length },
            { id: 'TO_CALL', label: 'To Call Today', count: myLeads.filter((l) => l.status === 'PENDING').length },
            { id: 'CALLBACK', label: 'Follow-Ups', count: myLeads.filter((l) => l.status === 'CALLBACK').length },
            { id: 'INTERESTED', label: 'Interested', count: myLeads.filter((l) => l.status === 'INTERESTED').length },
            { id: 'WON', label: 'Won Deals', count: myLeads.filter((l) => l.status === 'CONVERTED').length },
            { id: 'BUSY', label: 'No Answer', count: myLeads.filter((l) => l.status === 'BUSY').length },
            { id: 'NOT_INTERESTED', label: 'Not Interested', count: myLeads.filter((l) => l.status === 'NOT_INTERESTED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeFilter === tab.id
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, phone..."
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

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="nexus-card p-5 bg-white border border-slate-200 shadow-sm hover:border-[#00C9A7] transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display font-black text-base text-[#0A2540]">{lead.name}</h4>
                  <p className="text-xs font-semibold text-slate-600">
                    {lead.company} {lead.city ? `· ${lead.city}` : ''}
                  </p>
                </div>
                {getStatusBadge(lead.status, lead.callCount)}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold">{lead.phone}</span>
                <span className="text-[11px] text-slate-500">
                  {lead.callCount === 0 ? 'Fresh' : `Dials: ${lead.callCount}`}
                </span>
              </div>

              {lead.followUpDate && (
                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Scheduled Callback: {lead.followUpDate}</span>
                </div>
              )}

              {lead.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  "{lead.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleCallLead(lead)}
                className="py-2.5 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Lead</span>
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
      </div>

      {!filteredLeads.length && (
        <div className="nexus-card p-12 bg-white border border-slate-200 text-center space-y-2">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-display font-bold text-base text-[#0A2540]">No leads found</h4>
          <p className="text-xs text-slate-400">
            {searchQuery ? 'No leads matched your search query.' : 'Leads assigned by Admin will appear here.'}
          </p>
        </div>
      )}

    </div>
  );
};
