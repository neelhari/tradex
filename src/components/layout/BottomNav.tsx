import React from 'react';
import { Home, PhoneCall, Users, CalendarCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calling', label: 'Calling', icon: PhoneCall },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'leaves', label: 'Leaves', icon: CalendarCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 pb-safe flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
              isActive ? 'text-[#00C9A7]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {/* Active Indicator line */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-[#00C9A7] rounded-full shadow-[0_0_8px_#00C9A7]" />
            )}

            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className={`text-[11px] mt-1 font-bold ${isActive ? 'text-[#00A88B]' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
