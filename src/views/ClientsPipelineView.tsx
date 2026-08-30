import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
import { 
  Users, 
  Search, 
  Phone, 
  MessageCircle, 
  Plus, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { LeadTemperature } from '../types';

export const ClientsPipelineView: React.FC = () => {
  const { myLeads: clients, triggerToast, setIsQuickCallModalOpen } = useApp();

  useScreenData('clientsPipeline');
  const [activeTab, setActiveTab] = useState<'ALL' | 'Due Today' | 'HOT' | 'Converted'>('ALL');
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.company.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'Due Today') return matchesSearch && c.status === 'Due Today';
    if (activeTab === 'HOT') return matchesSearch && c.temperature === 'HOT';
    if (activeTab === 'Converted') return matchesSearch && c.status === 'Converted';
    return matchesSearch;
  });

  const getTempBadge = (temp: LeadTemperature) => {
    switch (temp) {
      case 'HOT':
        return <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1"><Flame className="w-3 h-3 text-rose-500 fill-rose-500" /> Hot Lead</span>;
      case 'WARM':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200">Warm Lead</span>;
      case 'COLD':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Cold Lead</span>;
      case 'CONVERTED':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Won</span>;
    }
  };

  const handleCall = (client: any) => {
    triggerToast(`📞 Calling ${client.name} (${client.phone})`);
    setTimeout(() => {
      setIsQuickCallModalOpen(true);
    }, 1000);
  };

  const handleWhatsApp = (client: any) => {
    triggerToast(`💬 Opening WhatsApp for ${client.name}`);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">Client Pipeline</h2>
          <p className="text-[11px] text-slate-500 font-medium">Follow-ups, client alerts & deal conversion</p>
        </div>
        <button
          onClick={() => triggerToast('➕ Add New Client Lead modal')}
          className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#00C9A7]/25 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Client</span>
        </button>
      </div>

      {/* 2. Search Bar with Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client by name or company..."
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

      {/* 3. Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(['ALL', 'Due Today', 'HOT', 'Converted'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs font-extrabold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Leads' : tab}
          </button>
        ))}
      </div>

      {/* 4. Client List Cards */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <div key={client.id} className="nexus-card p-4 bg-white border border-slate-200 shadow-sm hover:border-[#00C9A7] transition-all space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0A2540]">{client.company}</h4>
                <p className="text-xs font-semibold text-slate-700">{client.name}</p>
              </div>
              {getTempBadge(client.temperature)}
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              {client.requirement}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Potential Deal: <strong className="text-[#0A2540]">₹{client.dealValue.toLocaleString()}</strong></span>
              {client.dueTime && (
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {client.dueTime}
                </span>
              )}
            </div>

            {/* 1-Tap Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleCall(client)}
                className="py-2.5 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </button>

              <button
                onClick={() => handleWhatsApp(client)}
                className="py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
