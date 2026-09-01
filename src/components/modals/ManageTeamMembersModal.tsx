import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, UserPlus, UserMinus, Check, Shield, Layers, ArrowRight } from 'lucide-react';
import { TeamGroup, TeamMember } from '../../types';

interface ManageTeamMembersModalProps {
  team: TeamGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManageTeamMembersModal: React.FC<ManageTeamMembersModalProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  const { teamMembers, updateEmployee, triggerToast } = useApp();
  const [selectedToAddId, setSelectedToAddId] = useState('');

  if (!isOpen || !team) return null;

  // Members currently assigned to this squad
  const currentMembers = teamMembers.filter((m) => m.group === team.name);

  // Other telecallers in the company who can be transferred into this squad
  const availableMembers = teamMembers.filter(
    (m) => m.group !== team.name && m.active !== 0
  );

  const handleAddMember = async (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    await updateEmployee(member.id, { group: team.name });
    triggerToast(`✓ Added ${member.name} to ${team.name}`);
    setSelectedToAddId('');
  };

  const handleRemoveMember = async (member: TeamMember) => {
    await updateEmployee(member.id, { group: 'Unassigned' });
    triggerToast(`✓ Removed ${member.name} from ${team.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0A192F] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: team.color || '#00C9A7' }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{team.name}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-teal-300">
                  {currentMembers.length} Members
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Led by {team.leaderName || 'No Leader Assigned'} · Target ₹{(team.monthlyTarget / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Quick Add Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <UserPlus className="w-4 h-4 text-[#00A88B]" />
              <span>Add Member to this Squad</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select an employee to transfer them into <strong>{team.name}</strong> immediately:
            </p>

            <div className="flex gap-2">
              <select
                value={selectedToAddId}
                onChange={(e) => setSelectedToAddId(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              >
                <option value="">— Select telecaller to add —</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.empCode}) — Current Squad: {m.group || 'None'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedToAddId}
                onClick={() => handleAddMember(selectedToAddId)}
                className="bg-[#00C9A7] hover:bg-[#00B4D8] disabled:bg-slate-200 disabled:text-slate-400 text-[#0A2540] font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
              >
                Add to Squad
              </button>
            </div>
          </div>

          {/* Current Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Current Squad Roster ({currentMembers.length})
              </span>
              <span className="text-[10px] text-slate-400">Click remove to unassign</span>
            </div>

            {currentMembers.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl space-y-1">
                <Users className="w-6 h-6 text-slate-400 mx-auto stroke-1" />
                <p className="font-bold text-slate-600 text-xs">No members in this squad yet</p>
                <p className="text-[11px] text-slate-400">Use the selector above to assign telecallers.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {currentMembers.map((m) => {
                  const isLeader = team.leaderName && team.leaderName.toLowerCase() === m.name.toLowerCase();
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{m.name}</span>
                            {isLeader && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                                Squad Leader
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.empCode} · {m.role} · {m.dialsToday || 0} dials today
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(m)}
                        title="Remove from squad"
                        className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-all"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0A2540] hover:bg-[#0F3258] text-white font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
