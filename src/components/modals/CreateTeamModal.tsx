import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const COLOURS = ['#00C9A7', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#16A34A'];

/**
 * Creates a squad. Shared by the desktop and mobile Admin panels so both stay
 * in step — it renders as a centred dialog on desktop and a bottom sheet on
 * a phone.
 */
export const CreateTeamModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { teamMembers, createTeamGroup } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('200000');
  const [colour, setColour] = useState(COLOURS[0]);

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setDescription('');
    setLeaderName('');
    setMonthlyTarget('200000');
    setColour(COLOURS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTeamGroup({
      name: name.trim(),
      description: description.trim(),
      leaderName,
      monthlyTarget: Number(monthlyTarget) || 0,
      color: colour,
    });
    reset();
    onClose();
  };

  // A team leader should normally lead the team, so they are offered first
  const leaderCandidates = [...teamMembers].sort((a, b) => {
    const aLead = a.portal === 'team_leader' ? 0 : 1;
    const bLead = b.portal === 'team_leader' ? 0 : 1;
    return aLead - bLead;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto">

        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between sm:rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-[#00C9A7] border border-teal-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create team</h3>
              <p className="text-xs text-slate-400">A squad employees can be assigned to</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">TEAM NAME *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Desk"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">WHAT THEY DO</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Large accounts and renewals"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">TEAM LEADER</label>
            <select
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Assign later —</option>
              {leaderCandidates.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                  {m.portal === 'team_leader' ? ' (Team Leader)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">MONTHLY TARGET (₹)</label>
            <input
              type="number"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">COLOUR</label>
            <div className="flex gap-2">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  style={{ backgroundColor: c }}
                  aria-label={`Colour ${c}`}
                  className={`w-8 h-8 rounded-xl transition-all ${
                    colour === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Create team</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
