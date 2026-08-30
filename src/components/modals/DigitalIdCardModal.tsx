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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-display font-bold text-base text-[#0A2540]">Digital Employee ID Card</h3>
          <button
            onClick={() => setIsIdCardModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Physical ID Card Mockup */}
        <div className="bg-gradient-to-b from-[#0A2540] via-[#0F3258] to-[#0A2540] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden border border-[#00C9A7]/30">
          
          {/* Lanyard Hole Mockup */}
          <div className="w-12 h-2.5 bg-black/40 rounded-full mx-auto mb-4 border border-white/20" />

          {/* Top Brand */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00C9A7] flex items-center justify-center text-[#0A2540]">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-sm tracking-wider text-white">TRADE NEXUS</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#00C9A7]/20 text-[#38E1B7] border border-[#00C9A7]/30">
              OFFICIAL ID
            </span>
          </div>

          {/* Photo & Identity */}
          <div className="flex flex-col items-center text-center my-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#00C9A7] to-[#00B4D8] p-1 shadow-lg shadow-[#00C9A7]/30 mb-2">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-[#0A2540] font-black text-2xl">{profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
            </div>
            <h4 className="font-display font-extrabold text-base text-white">{profile.name}</h4>
            <p className="text-xs font-semibold text-[#38E1B7]">{profile.roleTitle}</p>
            <span className="text-[10px] text-slate-300 font-mono mt-0.5">ID: {profile.empCode}</span>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/30 p-3 rounded-xl border border-white/10 my-3 font-mono">
            <div>
              <span className="text-slate-400 block">Department:</span>
              <span className="text-white font-bold">{profile.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Team:</span>
              <span className="text-white font-bold">{profile.teamName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Group:</span>
              <span className="text-white font-bold">{profile.bloodGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Joined Date:</span>
              <span className="text-white font-bold">{profile.joinDate}</span>
            </div>
          </div>

          {/* Bottom QR Code verification */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-300">
            <div className="flex items-center gap-1 text-[#38E1B7] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HR Verified Active</span>
            </div>
            <QrCode className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full mt-4 py-3 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-display font-bold text-xs uppercase tracking-wider shadow-md shadow-[#00C9A7]/25 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Print-Ready ID (PDF)</span>
        </button>
      </div>
    </div>
  );
};
