import React from 'react';
import { useApp } from '../../context/AppContext';
import { TradeNexusLogo } from '../common/TradeNexusLogo';
import { Bell } from 'lucide-react';

export const MobileHeader: React.FC = () => {
  const { triggerToast } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Official Trade Nexus Logo with Text as in original header */}
      <TradeNexusLogo size="sm" showText={true} />

      {/* Right: Clean Notification Bell with Unread Dot */}
      <button
        onClick={() => triggerToast('🔔 2 pending callbacks and 1 leave approval')}
        className="relative w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#0A2540] shadow-2xs active:scale-95 transition-all"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
      </button>
    </header>
  );
};
