import React from 'react';

interface TradeNexusLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
}

export const TradeNexusLogo: React.FC<TradeNexusLogoProps> = ({ 
  size = 'md', 
  showText = true,
  textColor = 'dark',
  className = ''
}) => {
  const iconDimensions = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Official Circular Emblem with ZERO text */}
      <div className={`${iconDimensions} rounded-full overflow-hidden flex-shrink-0 bg-[#0A2540] shadow-md shadow-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center`}>
        <img 
          src="/logo-icon.png" 
          alt="Trade Nexus Emblem" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Clean Brand Typography Beside the Emblem */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-display font-black text-sm sm:text-base tracking-[0.06em] leading-tight ${
            textColor === 'light' ? 'text-white' : 'text-[#0A2540]'
          }`}>
            TRADE NEXUS
          </span>
          <span className="font-mono font-extrabold text-[9px] sm:text-[10px] tracking-[0.22em] uppercase leading-tight mt-0.5 text-[#00A88B]">
            TRADE SMART
          </span>
        </div>
      )}
    </div>
  );
};
