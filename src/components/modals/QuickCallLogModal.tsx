import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PhoneCall, Check, Clock, Calendar, Sparkles } from 'lucide-react';
import { CallOutcome } from '../../types';

export const QuickCallLogModal: React.FC = () => {
  const { isQuickCallModalOpen, setIsQuickCallModalOpen, logNewCall, clients } = useApp();

  const [clientName, setClientName] = useState('Apex Global Corp - Vikram Mehta');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [outcome, setOutcome] = useState<CallOutcome>('INTERESTED');
  const [durationMin, setDurationMin] = useState('3');
  const [notes, setNotes] = useState('Requested enterprise pricing & WhatsApp brochure.');
  const [followUpDate, setFollowUpDate] = useState('Tomorrow, 11:00 AM');

  if (!isQuickCallModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logNewCall({
      clientName: clientName.split(' - ')[1] || clientName,
      companyName: clientName.split(' - ')[0] || 'Direct Client',
      phoneNumber: phone,
      outcome,
      durationSec: parseInt(durationMin || '2') * 60,
      notes,
      followUpDate: outcome === 'CALLBACK' || outcome === 'INTERESTED' ? followUpDate : undefined,
    });
    setIsQuickCallModalOpen(false);
  };

  const outcomeOptions: { id: CallOutcome; label: string; color: string; bg: string }[] = [
    { id: 'CONNECTED', label: 'Connected', color: '#00A88B', bg: '#E6FAF6' },
    { id: 'INTERESTED', label: 'Interested', color: '#0284C7', bg: '#E0F2FE' },
    { id: 'DEAL_CLOSED', label: 'Deal Closed', color: '#16A34A', bg: '#DCFCE7' },
    { id: 'CALLBACK', label: 'Callback', color: '#D97706', bg: '#FEF3C7' },
    { id: 'BUSY', label: 'Busy / Unreachable', color: '#64748B', bg: '#F1F5F9' },
    { id: 'NOT_INTERESTED', label: 'Not Interested', color: '#DC2626', bg: '#FEE2E2' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] flex items-center justify-center text-[#00C9A7]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0A2540]">Log Call Outcome</h3>
              <p className="text-xs text-slate-500">Record calling activity & production updates</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickCallModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client / Lead</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              placeholder="Client Name or Company"
              required
            />
          </div>

          {/* Outcome Buttons Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Call Outcome</label>
            <div className="grid grid-cols-3 gap-1.5">
              {outcomeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setOutcome(opt.id)}
                  style={{
                    backgroundColor: outcome === opt.id ? opt.color : opt.bg,
                    color: outcome === opt.id ? '#FFFFFF' : opt.color,
                    borderColor: opt.color,
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    outcome === opt.id ? 'shadow-md scale-[1.02]' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Call Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="number"
                  min="0"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Next Follow-Up</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                  placeholder="Tomorrow, 10 AM"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call Notes / Client Feedback</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              placeholder="Enter details of conversation..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] text-[#0A2540] font-display font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[#00C9A7]/25 hover:brightness-105 active:scale-95 transition-all"
          >
            Save Call Log & Update Target
          </button>
        </form>
      </div>
    </div>
  );
};
