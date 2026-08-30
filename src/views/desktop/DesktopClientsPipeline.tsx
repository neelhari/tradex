import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useScreenData } from '../../hooks/useScreenData';
import { 
  Users, 
  Search, 
  Phone, 
  MessageCircle, 
  Plus, 
  Flame, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Filter 
} from 'lucide-react';
import { LeadTemperature } from '../../types';

export const DesktopClientsPipeline: React.FC = () => {
  const { myLeads: clients, triggerToast, setIsQuickCallModalOpen } = useApp();

  useScreenData('clientsPipeline');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCall = (client: any) => {
    triggerToast(`📞 Calling ${client.name} (${client.phone})`);
    setTimeout(() => {
      setIsQuickCallModalOpen(true);
    }, 1000);
  };

  const handleWhatsApp = (client: any) => {
    triggerToast(`💬 Opening WhatsApp for ${client.name}`);
  };

  const dueTodayLeads = clients.filter(c => c.status === 'Due Today');
  const hotLeads = clients.filter(c => c.temperature === 'HOT' && c.status !== 'Due Today');
  const pendingLeads = clients.filter(c => c.temperature === 'WARM' || c.temperature === 'COLD');
  const convertedLeads = clients.filter(c => c.status === 'Converted');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
            Client Pipeline & Deal Flow
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Follow-up scheduling, hot prospect alerts, and revenue conversions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerToast('➕ Add New Lead Modal opened')}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Lead</span>
          </button>
        </div>
      </div>

      {/* 4-Column Full-Width Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        
        {/* Column 1: Due Today (Urgent Alerts) */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-display font-extrabold text-xs text-amber-900 uppercase tracking-wider">Due Today (Alerts)</h3>
            </div>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-mono">
              {dueTodayLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {dueTodayLeads.map((client) => (
              <div key={client.id} className="nexus-card p-4 bg-white border border-amber-300 shadow-sm space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">{client.company}</h4>
                    <p className="text-xs font-medium text-slate-600">{client.name}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                    {client.dueTime}
                  </span>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {client.requirement}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                  <span>Deal: <strong className="text-[#0A2540]">₹{client.dealValue.toLocaleString()}</strong></span>
                  <span className="text-rose-600 font-bold">Hot Lead 🔥</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleCall(client)}
                    className="py-2 rounded-lg bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleWhatsApp(client)}
                    className="py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Hot Leads */}
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
              <h3 className="font-display font-extrabold text-xs text-rose-900 uppercase tracking-wider">Hot Prospects</h3>
            </div>
            <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-mono">
              {hotLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {hotLeads.map((client) => (
              <div key={client.id} className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">{client.company}</h4>
                    <p className="text-xs font-medium text-slate-600">{client.name}</p>
                  </div>
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200">
                    High Intent
                  </span>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {client.requirement}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                  <span>Deal: <strong className="text-[#0A2540]">₹{client.dealValue.toLocaleString()}</strong></span>
                  <span className="text-slate-400">{client.lastContacted}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleCall(client)}
                    className="py-2 rounded-lg bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleWhatsApp(client)}
                    className="py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Pending / Follow-up */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">Pending / Nurturing</h3>
            </div>
            <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-mono">
              {pendingLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingLeads.map((client) => (
              <div key={client.id} className="nexus-card p-4 bg-white border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">{client.company}</h4>
                    <p className="text-xs font-medium text-slate-600">{client.name}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {client.temperature}
                  </span>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {client.requirement}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                  <span>Deal: <strong className="text-[#0A2540]">₹{client.dealValue.toLocaleString()}</strong></span>
                  <span className="text-slate-400">{client.lastContacted}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleCall(client)}
                    className="py-2 rounded-lg bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleWhatsApp(client)}
                    className="py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Converted Deals */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display font-extrabold text-xs text-emerald-900 uppercase tracking-wider">Converted (Closed)</h3>
            </div>
            <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
              {convertedLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {convertedLeads.map((client) => (
              <div key={client.id} className="nexus-card p-4 bg-white border border-emerald-300 shadow-sm space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">{client.company}</h4>
                    <p className="text-xs font-medium text-slate-600">{client.name}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Won
                  </span>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {client.requirement}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-emerald-700 pt-1">
                  <span>Closed Value: <strong className="text-sm font-extrabold">₹{client.dealValue.toLocaleString()}</strong></span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-emerald-600 block">✓ Payment Verified & Credited</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
