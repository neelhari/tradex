import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-11 px-7 flex items-center justify-between text-xs font-bold text-slate-800 select-none bg-white border-b border-slate-100 z-30 flex-shrink-0">
      {/* Time */}
      <span className="font-mono-nums text-[13px]">{timeStr}</span>

      {/* Dynamic Island */}
      <div className="h-6 px-3 rounded-full bg-black flex items-center gap-2 shadow-inner">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
        <span className="text-[9px] text-[#38E1B7] font-mono tracking-wider font-extrabold">TRADE NEXUS</span>
      </div>

      {/* Signal & Battery */}
      <div className="flex items-center gap-1.5 text-slate-700">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-4 h-4 fill-slate-700" />
      </div>
    </div>
  );
};
