import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Plus, 
  FileText, 
  AlertTriangle, 
  PhoneCall, 
  Clock, 
  Target,
  UserCheck
} from 'lucide-react';

export const TelecallerHomeView: React.FC = () => {
  const { 
    profile, 
    stats, 
    clients, 
    setIsFaceIdModalOpen, 
    setIsQuickCallModalOpen, 
    triggerToast,
    setActiveTab 
  } = useApp();

  const urgentLead = clients.find(c => c.status === 'Due Today') || clients[0];
  const goalPercentage = Math.round((stats.dialsMade / stats.todayGoalCalls) * 100);
  const tgtPercentage = Math.round((stats.monthlySalesAchieved / stats.monthlySalesTarget) * 100);

  const handleInstantCall = () => {
    triggerToast(`📞 Dialing ${urgentLead.name} (${urgentLead.phone})...`);
    setTimeout(() => {
      setIsQuickCallModalOpen(true);
    }, 1000);
  };

  const handleWhatsApp = () => {
    triggerToast(`💬 Opening WhatsApp with product demo template for ${urgentLead.name}`);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
      
      {/* 1. Personalized Greeting with Online Status */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-black text-xl text-[#0A2540] tracking-tight">
              Hello, <span className="text-[#00A88B]">{profile.name.split(' ')[0]}</span>
            </h2>
            <span className="text-lg">👋</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 font-semibold">{profile.roleTitle}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* User Mini Avatar Badge */}
        <div className="w-9 h-9 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-xs shadow-sm">
          {profile.name.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* 2. Biometric Face ID Attendance Card */}
      <div 
        onClick={() => setIsFaceIdModalOpen(true)}
        className="nexus-card p-3.5 bg-gradient-to-r from-[#E6FAF6]/90 via-white to-white border border-[#00C9A7]/30 flex items-center justify-between cursor-pointer hover:border-[#00C9A7] transition-all active:scale-[0.99] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/15 text-[#00A88B] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-[#0A2540]">Face ID Verified</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono font-medium">
              Check-in: <strong className="text-[#00A88B]">{profile.checkInTime}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>ON DUTY</span>
        </div>
      </div>

      {/* 3. Today's Calling Goal Hero Card */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-extrabold text-sm text-[#0A2540] tracking-tight">Today's Calling Goal</h3>
            <p className="text-[11px] text-slate-400 font-medium">Keep up the great momentum!</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-1 rounded-lg">
            <Target className="w-3.5 h-3.5" />
            <span>Goal: {stats.todayGoalCalls} Calls</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Circular Progress Gauge */}
          <div className="relative w-22 h-22 flex-shrink-0 flex items-center justify-center">
            <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-slate-100"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#00C9A7"
                strokeWidth="7"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * goalPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display font-black text-xl text-[#0A2540] leading-none">
                {goalPercentage}%
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                COMPLETED
              </span>
            </div>
          </div>

          {/* 4 Metric Chips */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                <Phone className="w-3 h-3 text-[#00C9A7]" />
                <span className="text-[10px] font-bold">Dials</span>
              </div>
              <span className="font-mono-nums font-black text-base text-[#0A2540]">{stats.dialsMade}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                <PhoneCall className="w-3 h-3 text-sky-500" />
                <span className="text-[10px] font-bold">Connected</span>
              </div>
              <span className="font-mono-nums font-black text-base text-sky-600">{stats.connected}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold">Interested</span>
              </div>
              <span className="font-mono-nums font-black text-base text-emerald-600">{stats.interested}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] font-bold">Rejected</span>
              </div>
              <span className="font-mono-nums font-black text-base text-rose-500">{stats.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Monthly Sales Target (TGT) Progress Bar */}
      <div className="nexus-card p-4 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-display font-bold text-sm text-[#0A2540]">Sales Target (TGT)</h4>
              <p className="text-[11px] text-slate-400 font-medium">Monthly Target Quota</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono-nums font-extrabold text-[#00A88B]">
                {tgtPercentage}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">Achieved</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between font-mono-nums text-xs mb-3">
            <span className="font-extrabold text-base text-[#0A2540]">
              ₹1,45,000
            </span>
            <span className="text-slate-400 font-semibold text-xs">
              / ₹2,00,000
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
            <div 
              className="h-full bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] rounded-full transition-all duration-700"
              style={{ width: `${tgtPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex justify-between font-medium">
          <span>Remaining to hit incentive:</span>
          <span className="font-bold font-mono text-[#00A88B]">₹55,000</span>
        </div>
      </div>

      {/* 5. Urgent Client Follow-up Alert Card */}
      <div className="nexus-card p-4 bg-gradient-to-br from-[#FFFBEB] via-white to-white border border-amber-300/60 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{urgentLead.dueTime || 'Due in 15 mins'}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400">Next Callback Lead</span>
        </div>

        <div className="mb-3">
          <h4 className="font-display font-bold text-base text-[#0A2540]">{urgentLead.company}</h4>
          <p className="text-xs font-semibold text-slate-700">{urgentLead.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{urgentLead.requirement}</p>
        </div>

        {/* 1-Tap Action Triggers */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleInstantCall}
            className="py-2.5 px-3 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-bold text-xs shadow-md shadow-[#00C9A7]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Instant Call</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 6. Quick Action Floating Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIsQuickCallModalOpen(true)}
          className="py-3 px-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] text-[#0A2540] font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <div className="w-7 h-7 rounded-xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span>Quick Log Call</span>
        </button>

        <button
          onClick={() => {
            triggerToast('📝 Opening Client Note dialog');
            setActiveTab('clients');
          }}
          className="py-3 px-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] text-[#0A2540] font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span>Client Note</span>
        </button>
      </div>

    </div>
  );
};
