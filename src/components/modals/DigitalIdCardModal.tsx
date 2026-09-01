import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Download, ShieldCheck, QrCode, TrendingUp } from 'lucide-react';

export const DigitalIdCardModal: React.FC = () => {
  const { isIdCardModalOpen, setIsIdCardModalOpen, profile, triggerToast } = useApp();

  if (!isIdCardModalOpen) return null;

  const handleDownload = () => {
    triggerToast('✓ Trade Nexus ID Card PDF downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-xs bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
          <h3 className="font-display font-bold text-sm text-[#0A2540]">Digital Employee ID Card</h3>
          <button
            onClick={() => setIsIdCardModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Realistic Physical ID Card Mockup */}
        <div className="bg-gradient-to-b from-[#0A2540] via-[#0F3258] to-[#0A2540] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden border border-[#00C9A7]/30">
          
          {/* Lanyard Hole Mockup */}
          <div className="w-10 h-2 bg-black/40 rounded-full mx-auto mb-3 border border-white/20" />

          {/* Top Brand */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#00C9A7] flex items-center justify-center text-[#0A2540]">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-xs tracking-wider text-white">TRADE NEXUS</span>
            </div>
            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00C9A7]/20 text-[#38E1B7] border border-[#00C9A7]/30">
              OFFICIAL ID
            </span>
          </div>

          {/* Photo & Identity */}
          <div className="flex flex-col items-center text-center my-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00C9A7] to-[#00B4D8] p-0.5 shadow-md shadow-[#00C9A7]/30 mb-1.5">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-[#0A2540] font-black text-xl">
                {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
            <h4 className="font-display font-extrabold text-sm text-white">{profile.name}</h4>
            <p className="text-[11px] font-semibold text-[#38E1B7]">{profile.roleTitle}</p>
            <span className="text-[9px] text-slate-300 font-mono mt-0.5">ID: {profile.empCode}</span>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-black/30 p-2.5 rounded-xl border border-white/10 my-2 font-mono">
            <div>
              <span className="text-slate-400 block">Department:</span>
              <span className="text-white font-bold truncate block">{profile.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Team:</span>
              <span className="text-white font-bold truncate block">{profile.teamName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Group:</span>
              <span className="text-white font-bold">{profile.bloodGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Joined Date:</span>
              <span className="text-white font-bold truncate block">{profile.joinDate}</span>
            </div>
          </div>

          {/* Bottom QR Code verification */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] text-slate-300">
            <div className="flex items-center gap-1 text-[#38E1B7] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>HR Verified Active</span>
            </div>
            <QrCode className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Download Button - Compact & Mobile Scaled */}
        <button
          onClick={handleDownload}
          className="w-full mt-3 py-2.5 rounded-xl bg-[#00C29F] hover:bg-[#00B4D8] text-white font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Print-Ready ID (PDF)</span>
        </button>
      </div>
    </div>
  );
};
