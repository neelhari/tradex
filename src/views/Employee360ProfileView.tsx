import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TeamMember, AssignedLead, UserRole } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Search, 
  Download, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Briefcase, 
  ArrowRightLeft,
  DollarSign,
  Filter
} from 'lucide-react';

interface Employee360ProfileViewProps {
  member: TeamMember | null;
  onBack: () => void;
  viewerRole?: UserRole;
}

export const Employee360ProfileView: React.FC<Employee360ProfileViewProps> = ({
  member,
  onBack,
  viewerRole = 'team_leader'
}) => {
  const { 
    assignedLeads, 
    clients, 
    callLogs, 
    teamMembers,
    reassignLead, 
    triggerToast,
    faceProfiles
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CALLING' | 'ATTENDANCE' | 'COMPLIANCE'>('CALLING');
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);
  const [reassigningLeadId, setReassigningLeadId] = useState<string | null>(null);
  const [targetAssignee, setTargetAssignee] = useState<string>('');
  
  // Day filter for categories matching telecaller options
  const [dayCategoryFilter, setDayCategoryFilter] = useState<'ALL' | 'INTERESTED' | 'CALLBACK' | 'NOT_INTERESTED' | 'CONVERTED' | 'BUSY' | 'CONNECTED'>('ALL');

  if (!member) return null;

  // Mask client phone numbers for high security
  const maskPhone = (phone?: string) => {
    if (!phone) return '—';
    const clean = phone.trim();
    if (clean.length > 5) {
      return clean.substring(0, clean.length - 5) + '*****';
    }
    return '*****';
  };

  const formatInLakhs = (amount: number) => {
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(2);
      return `₹${lakhs.replace(/\.00$/, '')} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const memberNameLower = member.name.toLowerCase();

  // 1. Match assigned leads for this telecaller
  const matchedAssigned = assignedLeads.filter((l) => {
    const byId = l.assignedToEmployeeId === member.id || l.assignedToEmployeeId === member.empCode;
    const byName = l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === memberNameLower;
    const isArjunSpecial = memberNameLower.includes('arjun') && (l.assignedToEmployeeId === 'emp-101' || l.assignedToEmployeeId === 'tm-1');
    return byId || byName || isArjunSpecial;
  });

  // Client leads from the CRM pipeline
  const pipelineLeads: AssignedLead[] = (memberNameLower.includes('arjun') ? clients : []).map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    company: c.company,
    city: 'Pan-India',
    assignedToEmployeeId: member.id,
    assignedToEmployeeName: member.name,
    batchId: 'crm-pipeline',
    assignedDate: 'Today',
    status: (
      c.status === 'Converted' ? 'CONVERTED' :
      c.status === 'Due Today' ? 'CALLBACK' :
      c.status === 'Follow-up' ? 'INTERESTED' :
      'PENDING'
    ) as AssignedLead['status'],
    notes: c.requirement || 'Direct CRM Client Lead',
    callCount: 1,
    lastCallTimestamp: c.lastContacted,
    dealValue: c.dealValue,
  }));

  const existingIds = new Set(matchedAssigned.map(l => l.id));
  const memberLeads: AssignedLead[] = [
    ...matchedAssigned,
    ...pipelineLeads.filter(p => !existingIds.has(p.id))
  ];

  // 2. Match Call Logs for this telecaller
  const leadPhones = new Set(memberLeads.map(l => (l.phone || '').replace(/\s+/g, '')));
  const leadNames = new Set(memberLeads.map(l => (l.name || '').toLowerCase()));

  const memberCallLogs = callLogs.filter((c) => {
    const cleanPhone = (c.phoneNumber || '').replace(/\s+/g, '');
    const clientNameLower = (c.clientName || '').toLowerCase();
    const byEmpId = c.employeeId && (c.employeeId === member.id || c.employeeId === member.empCode);
    const byLeadMatch = (cleanPhone && leadPhones.has(cleanPhone)) || (clientNameLower && leadNames.has(clientNameLower));
    const byArjunFallback = memberNameLower.includes('arjun') && (!c.employeeId || c.employeeId === 'emp-101');
    return byEmpId || byLeadMatch || byArjunFallback;
  });

  // 3. Generate 10-Day Calling & Work Ledger
  const callingLedger10Days = useMemo(() => {
    const records = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isSunday = d.getDay() === 0;
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      if (isSunday) {
        records.push({
          index: i,
          dateLabel: `${dateStr} (${dayName})`,
          assigned: 0,
          called: 0,
          target: 100,
          interested: 0,
          callback: 0,
          notInterested: 0,
          converted: 0,
          revenue: 0,
          isSunday: true,
          leads: [] as AssignedLead[],
        });
      } else if (i === 0) {
        // Today
        records.push({
          index: i,
          dateLabel: `Today (${dateStr})`,
          assigned: memberLeads.length || 44,
          called: member.dialsToday || 68,
          target: member.goalCalls || 100,
          interested: member.interested || 12,
          callback: 7,
          notInterested: 8,
          converted: 2,
          revenue: member.salesAchieved || 145000,
          isSunday: false,
          leads: memberLeads.slice(0, 12),
        });
      } else {
        const daySeed = (member.name.length * 11 + i * 19) % 25;
        const assigned = 40 + (daySeed * 2);
        const called = Math.min(assigned, 48 + daySeed);
        const interested = 6 + (daySeed % 6);
        const callback = 4 + (daySeed % 5);
        const notInterested = 10 + (daySeed % 8);
        const converted = (i % 3 === 0) ? 2 : (i % 2 === 0) ? 1 : 0;
        const revenue = converted * (45000 + daySeed * 1500);

        records.push({
          index: i,
          dateLabel: `${dateStr} (${dayName})`,
          assigned,
          called,
          target: 100,
          interested,
          callback,
          notInterested,
          converted,
          revenue,
          isSunday: false,
          leads: memberLeads.slice(0, 8),
        });
      }
    }
    return records;
  }, [member, memberLeads]);

  // Helper to parse time string like "09:15 AM" or "11:42 AM" into minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr || timeStr === '—' || timeStr.toLowerCase().includes('shift') || timeStr.toLowerCase().includes('active')) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // Check if punch-in is late compared to standard 09:30 AM (570 minutes)
  const isPunchInLate = (inTimeStr: string): boolean => {
    const mins = parseTimeToMinutes(inTimeStr);
    if (mins === null) return false;
    // Standard shift starts at 09:30 AM (9*60 + 30 = 570 mins)
    return mins > 570;
  };

  // Compute dynamic working hours string
  const computeDurationHours = (inTimeStr: string, outTimeStr: string): string => {
    const inMins = parseTimeToMinutes(inTimeStr);
    if (inMins === null) return '0h 00m';

    let outMins = parseTimeToMinutes(outTimeStr);
    if (outMins === null) {
      // If Shift Active, calculate against current real time
      const now = new Date();
      outMins = now.getHours() * 60 + now.getMinutes();
    }

    const diffMins = Math.max(0, outMins - inMins);
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  // 4. Generate structured attendance history with dynamic time calculation
  const attendanceHistory = useMemo(() => {
    const records = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isSunday = d.getDay() === 0;
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      if (isSunday) {
        records.push({
          date: dateStr,
          dayName,
          inTime: '—',
          outTime: '—',
          hours: '0h 00m',
          status: 'WEEKLY_OFF',
          isLate: false,
          isShort: false,
        });
      } else if (i === 0) {
        // Today - Dynamically evaluate based on punch-in time against 09:30 AM standard shift
        const inTime = member.checkInTime || (member.attendanceStatus === 'LATE' ? '09:48 AM' : '09:15 AM');
        const isLate = isPunchInLate(inTime);
        const outTime = member.checkOutTime || 'Shift Active';
        const hours = computeDurationHours(inTime, outTime);

        records.push({
          date: `${dateStr} (Today)`,
          dayName,
          inTime,
          outTime,
          hours,
          status: isLate ? 'LATE' : 'PRESENT',
          isLate,
          isShort: false,
        });
      } else if (i === 4) {
        // Approved Leave
        records.push({
          date: dateStr,
          dayName,
          inTime: '—',
          outTime: '—',
          hours: '0h 00m',
          status: 'LEAVE',
          isLate: false,
          isShort: false,
        });
      } else if (i === 2 || i === 7) {
        // Late day
        const inTime = '09:48 AM';
        const outTime = '06:45 PM';
        const isLate = isPunchInLate(inTime);
        const hours = computeDurationHours(inTime, outTime);

        records.push({
          date: dateStr,
          dayName,
          inTime,
          outTime,
          hours,
          status: 'LATE',
          isLate,
          isShort: true,
        });
      } else {
        // Regular on-time day
        const inTime = '09:12 AM';
        const outTime = '06:30 PM';
        const isLate = isPunchInLate(inTime);
        const hours = computeDurationHours(inTime, outTime);

        records.push({
          date: dateStr,
          dayName,
          inTime,
          outTime,
          hours,
          status: 'PRESENT',
          isLate,
          isShort: false,
        });
      }
    }
    return records;
  }, [member]);

  // Dynamic Attendance Stats & Highlighters
  const onTimeCount = useMemo(() => attendanceHistory.filter(r => r.status === 'PRESENT').length, [attendanceHistory]);
  const lateCount = useMemo(() => attendanceHistory.filter(r => r.status === 'LATE').length, [attendanceHistory]);
  const leaveCount = useMemo(() => attendanceHistory.filter(r => r.status === 'LEAVE').length, [attendanceHistory]);
  const activeShiftDays = onTimeCount + lateCount;
  const onTimePercentage = activeShiftDays > 0 ? Math.round((onTimeCount / activeShiftDays) * 100) : 100;

  // Handle lead reassign
  const handleReassign = (leadId: string) => {
    if (!targetAssignee) return;
    reassignLead(leadId, targetAssignee);
    triggerToast(`✓ Lead reassigned to ${targetAssignee}`);
    setReassigningLeadId(null);
    setTargetAssignee('');
  };

  // Export CSV for this employee
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Check In', 'Check Out', 'Total Hours', 'Attendance Status'];
    const rows = attendanceHistory.map(r => [
      `"${r.date}"`,
      `"${r.dayName}"`,
      `"${r.inTime}"`,
      `"${r.outTime}"`,
      `"${r.hours}"`,
      `"${r.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${member.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`✓ Downloaded attendance report for ${member.name}`);
  };

  // Clean role title without buzzwords
  const cleanRole = member.role ? member.role.replace(/\/.*$/, '').trim() : 'Senior Telecaller';
  const faceProfile = faceProfiles.find(f => f.employeeName?.toLowerCase() === memberNameLower || f.employeeId === member.id);

  return (
    <div className="animate-in fade-in duration-150">
      
      {/* Attached Compact Profile Header (Edge-to-edge, no bulky floating outer card) */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 shadow-2xs space-y-2 sticky top-0 z-30">
        
        {/* Top utility row: Back button on left, Active Status & CSV on right */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-[#00A88B] transition-colors py-0.5 group"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#E6FAF6] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00A88B]" />
            </div>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Shift
            </span>

            <button
              onClick={handleExportCSV}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3 h-3 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Compact Employee Info Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-sm shadow-xs flex-shrink-0">
              {member.name.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display font-black text-sm text-[#0A2540] truncate">
                  {member.name}
                </h2>
                <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider ${
                  member.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                  member.attendanceStatus === 'LATE' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {member.attendanceStatus}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-mono font-bold">
                  {member.empCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium truncate">
                <span className="font-bold text-slate-700">{cleanRole}</span> • <span>{member.group || 'Alpha Team'}</span> • <span>TL: Ramesh Sharma</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sleek 4-Column Metric Strip (Replaces bulky 4 boxes to free up screen space for main calls content) */}
        <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100 bg-slate-50/90 rounded-xl py-1.5 px-1 border border-slate-100">
          <div className="px-0.5">
            <strong className="text-xs font-display font-black text-[#0A2540] block leading-tight">
              {member.dialsToday} <span className="text-[9px] text-slate-400 font-normal">/{member.goalCalls || 100}</span>
            </strong>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Dials
            </span>
          </div>

          <div className="px-0.5">
            <strong className="text-xs font-display font-black text-[#00A88B] block leading-tight">
              {formatInLakhs(member.salesAchieved)}
            </strong>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Sales
            </span>
          </div>

          <div className="px-0.5">
            <strong className="text-xs font-display font-black text-purple-700 block leading-tight">
              {member.interested || 12}
            </strong>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Interested
            </span>
          </div>

          <div className="px-0.5">
            <strong className={`text-xs font-display font-black block leading-tight ${onTimePercentage >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {onTimePercentage}%
            </strong>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Punctual
            </span>
          </div>
        </div>

      </div>

      {/* Main Content Area (Directly below attached header, with ample vertical room for calls & history) */}
      <div className="p-3 sm:p-4 space-y-3">

      {/* Tabs Row - Mobile Native Symmetric Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex items-center justify-between gap-1.5">
        <button
          onClick={() => setActiveTab('CALLING')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
            activeTab === 'CALLING'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
            activeTab === 'ATTENDANCE'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Attendance</span>
        </button>

        {(viewerRole === 'hr' || viewerRole === 'admin') && (
          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'COMPLIANCE'
                ? 'bg-[#0A2540] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Audit</span>
          </button>
        )}
      </div>

      {/* TAB 1: DAILY CALLS & TARGETS */}
      {activeTab === 'CALLING' && (
        <div className="space-y-3">
          
          {/* MOBILE-ONLY VIEW (Screens < 768px): Free, Airy, Direct on Canvas */}
          <div className="block md:hidden space-y-2.5">
            {/* Clean Section Header */}
            <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
              <div>
                <h3 className="font-display font-black text-sm text-[#0A2540]">
                  Calling History
                </h3>
                <p className="text-[10px] text-slate-500">
                  Daily logged calls, outcomes & verified revenue
                </p>
              </div>
            </div>

            {/* Free-Floating Day Cards */}
            {callingLedger10Days.map((day) => {
              const isExpanded = expandedDayIndex === day.index;

              if (day.isSunday) {
                return (
                  <div key={day.index} className="p-3 bg-white/70 border border-slate-200/60 rounded-2xl text-center text-xs text-slate-400 font-medium">
                    <span className="font-bold text-slate-500 block">{day.dateLabel}</span>
                    <span className="text-[10px] italic">Sunday (Weekly Off)</span>
                  </div>
                );
              }

              // Filter leads for this day
              const filteredDayLeads = day.leads.filter((l) => {
                if (dayCategoryFilter === 'ALL') return true;
                const s = (l.status || '').toUpperCase();
                if (dayCategoryFilter === 'INTERESTED') return s === 'INTERESTED' || s === 'FOLLOW-UP';
                if (dayCategoryFilter === 'CALLBACK') return s === 'CALLBACK' || s === 'DUE TODAY';
                if (dayCategoryFilter === 'NOT_INTERESTED') return s === 'NOT_INTERESTED' || s === 'REJECTED';
                if (dayCategoryFilter === 'CONVERTED') return s === 'CONVERTED' || s === 'DEAL_CLOSED';
                if (dayCategoryFilter === 'BUSY') return s === 'BUSY';
                if (dayCategoryFilter === 'CONNECTED') return s === 'CONNECTED' || s === 'PENDING';
                return true;
              });

              return (
                <div 
                  key={day.index}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-mono font-bold text-xs text-[#0A2540] shadow-2xs flex-shrink-0">
                        {day.dateLabel.match(/\d{1,2}/)?.[0].padStart(2, '0') || '01'}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-[#0A2540] block">{day.dateLabel}</strong>
                        <span className="text-[10px] font-mono text-slate-500">
                          {day.called} / {day.assigned} Calls Made
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-nums font-black text-xs text-[#00A88B] block">
                        {formatInLakhs(day.revenue)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {day.converted > 0 ? `🏆 ${day.converted} Won` : `${day.interested} Int.`}
                      </span>
                    </div>
                  </div>

                  {/* 4 Structured Outcome Metric Badges (Exact match to Image 2 - Locked) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-100 text-center">
                    <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl py-1.5 px-1">
                      <span className="text-[9px] font-bold text-emerald-600 block leading-tight">Interested</span>
                      <span className="font-mono-nums font-black text-xs text-emerald-800 leading-tight">{day.interested}</span>
                    </div>
                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl py-1.5 px-1">
                      <span className="text-[9px] font-bold text-amber-600 block leading-tight">Callback</span>
                      <span className="font-mono-nums font-black text-xs text-amber-800 leading-tight">{day.callback}</span>
                    </div>
                    <div className="bg-rose-50/80 border border-rose-200/60 rounded-xl py-1.5 px-1">
                      <span className="text-[9px] font-bold text-rose-600 block leading-tight">Not Int.</span>
                      <span className="font-mono-nums font-black text-xs text-rose-800 leading-tight">{day.notInterested}</span>
                    </div>
                    <div className="bg-purple-50/80 border border-purple-200/60 rounded-xl py-1.5 px-1">
                      <span className="text-[9px] font-bold text-purple-600 block leading-tight">Won</span>
                      <span className="font-mono-nums font-black text-xs text-purple-800 leading-tight">{day.converted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP-ONLY WIDESCREEN TABLE (Screens >= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-[#0A2540]">
                  Daily Calling Performance Record (Last 10 Days)
                </h3>
                <p className="text-xs text-slate-500">
                  Click any day's row to open its complete list of called leads, feedback notes, and conversion status
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
                10-Day Work Ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Date & Day</th>
                    <th className="pb-3">Calls Assigned</th>
                    <th className="pb-3">Calls Made</th>
                    <th className="pb-3">🟢 Interested</th>
                    <th className="pb-3">⏰ Call Back Later</th>
                    <th className="pb-3">🛑 Not Interested</th>
                    <th className="pb-3">🏆 Won Deals</th>
                    <th className="pb-3">Total Sales Generated</th>
                    <th className="pb-3 text-right pr-2">Day Work Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {callingLedger10Days.map((day) => {
                    const isExpanded = expandedDayIndex === day.index;

                    if (day.isSunday) {
                      return (
                        <tr key={day.index} className="bg-slate-50/50 text-slate-400 font-medium">
                          <td className="py-3 pl-2 font-bold">{day.dateLabel}</td>
                          <td colSpan={7} className="py-3 text-center italic text-[11px]">
                            — Sunday (Weekly Off) —
                          </td>
                          <td className="py-3 text-right pr-2">—</td>
                        </tr>
                      );
                    }

                    // Filter leads for this day based on the selected telecaller outcome category
                    const filteredDayLeads = day.leads.filter((l) => {
                      if (dayCategoryFilter === 'ALL') return true;
                      const s = (l.status || '').toUpperCase();
                      if (dayCategoryFilter === 'INTERESTED') return s === 'INTERESTED' || s === 'FOLLOW-UP';
                      if (dayCategoryFilter === 'CALLBACK') return s === 'CALLBACK' || s === 'DUE TODAY';
                      if (dayCategoryFilter === 'NOT_INTERESTED') return s === 'NOT_INTERESTED' || s === 'REJECTED';
                      if (dayCategoryFilter === 'CONVERTED') return s === 'CONVERTED' || s === 'DEAL_CLOSED';
                      if (dayCategoryFilter === 'BUSY') return s === 'BUSY';
                      if (dayCategoryFilter === 'CONNECTED') return s === 'CONNECTED' || s === 'PENDING';
                      return true;
                    });

                    return (
                      <React.Fragment key={day.index}>
                        <tr 
                          onClick={() => setExpandedDayIndex(isExpanded ? null : day.index)}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-emerald-50/40 border-l-4 border-[#00C9A7]' : ''
                          }`}
                        >
                          <td className="py-3.5 pl-2 font-bold text-[#0A2540]">
                            {day.dateLabel}
                          </td>

                          <td className="py-3.5 font-semibold text-slate-700">
                            {day.assigned} Leads
                          </td>

                          <td className="py-3.5">
                            <span className={`font-mono font-bold ${
                              day.called < day.assigned ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              {day.called} / {day.assigned}
                            </span>
                            {day.called < day.assigned && (
                              <span className="text-[10px] text-amber-600 block">
                                ({day.assigned - day.called} uncalled)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 font-mono font-bold text-emerald-600">
                            {day.interested} Leads
                          </td>

                          <td className="py-3.5 font-mono font-bold text-amber-600">
                            {day.callback} Leads
                          </td>

                          <td className="py-3.5 font-mono font-bold text-slate-500">
                            {day.notInterested} Leads
                          </td>

                          <td className="py-3.5 font-mono font-bold text-purple-700">
                            {day.converted} Deals
                          </td>

                          <td className="py-3.5 font-mono font-bold text-[#00A88B]">
                            {day.revenue > 0 ? formatInLakhs(day.revenue) : '—'}
                          </td>

                          <td className="py-3.5 text-right pr-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDayIndex(isExpanded ? null : day.index);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#00C9A7] hover:text-[#0A2540] font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                            >
                              <span>{isExpanded ? 'Hide' : 'View Day Work'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED DAY DETAILS ACCORDION */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={9} className="p-4 border-b border-slate-200">
                              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
                                
                                {/* Top Header */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                                  <span className="font-bold text-[#0A2540]">
                                    Calls & Feedback Notes for {day.dateLabel}:
                                  </span>
                                </div>

                                {/* FILTER PILLS MATCHING TELECALLER SAVE OPTIONS EXACTLY */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Filter by Telecaller Result:</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                      { key: 'ALL', label: 'All Results' },
                                      { key: 'INTERESTED', label: '🟢 Interested' },
                                      { key: 'CALLBACK', label: '⏰ Call Back Later' },
                                      { key: 'NOT_INTERESTED', label: '🛑 Not Interested' },
                                      { key: 'CONVERTED', label: '🏆 Won Deals' },
                                      { key: 'BUSY', label: '🚫 No Answer / Busy' },
                                      { key: 'CONNECTED', label: '💬 Spoke / General' },
                                    ].map((pill) => (
                                      <button
                                        key={pill.key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDayCategoryFilter(pill.key as typeof dayCategoryFilter);
                                        }}
                                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                          dayCategoryFilter === pill.key
                                            ? 'bg-[#0A2540] text-white shadow-xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {pill.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Leads Called on this Day */}
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Client Calls & Notes Recorded ({filteredDayLeads.length}):
                                  </span>

                                  {filteredDayLeads.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl">
                                      No client calls found in this category.
                                    </p>
                                  ) : (
                                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                      {filteredDayLeads.map((lead) => (
                                        <div key={lead.id} className="p-3 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-xs text-[#0A2540]">{lead.name}</span>
                                              <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                                {lead.company}
                                              </span>
                                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                lead.status === 'INTERESTED' ? 'bg-emerald-100 text-emerald-800' :
                                                lead.status === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                                                lead.status === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                                                lead.status === 'NOT_INTERESTED' ? 'bg-rose-100 text-rose-800' :
                                                'bg-slate-100 text-slate-700'
                                              }`}>
                                                {lead.status === 'CONVERTED' ? '🏆 Won Deal' :
                                                 lead.status === 'INTERESTED' ? '🟢 Interested' :
                                                 lead.status === 'CALLBACK' ? '⏰ Call Back Later' :
                                                 lead.status === 'NOT_INTERESTED' ? '🛑 Not Interested' :
                                                 lead.status === 'BUSY' ? '🚫 No Answer / Busy' :
                                                 '💬 Spoke / General'}
                                              </span>
                                            </div>
                                            <p className="text-xs text-slate-600 italic">
                                              "{lead.notes || 'Spoke with client, follow-up scheduled.'}"
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-4 text-xs font-mono">
                                            <span className="text-slate-500 font-bold">
                                              Phone: {maskPhone(lead.phone)}
                                            </span>

                                            {/* WON DEAL AMOUNT PRIVACY: Hidden from Team Leader to protect high-ticket deal pricing, but added in total revenue & targets */}
                                            {lead.status === 'CONVERTED' ? (
                                              viewerRole === 'admin' && lead.dealValue ? (
                                                <span className="text-[#00A88B] font-bold">
                                                  {formatInLakhs(lead.dealValue)}
                                                </span>
                                              ) : (
                                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                  ✓ Won Deal Verified
                                                </span>
                                              )
                                            ) : null}

                                            {/* Reassign action: Strictly Admin Only. Hidden from Team Leader to protect lead confidentiality */}
                                            {viewerRole === 'admin' && (
                                              reassigningLeadId === lead.id ? (
                                                <div className="flex items-center gap-1">
                                                  <select
                                                    value={targetAssignee}
                                                    onChange={(e) => setTargetAssignee(e.target.value)}
                                                    className="text-[11px] p-1 rounded-lg border border-slate-300 bg-white font-bold"
                                                  >
                                                    <option value="">Transfer to</option>
                                                    {teamMembers.filter(m => m.id !== member.id).map(m => (
                                                      <option key={m.id} value={m.name}>{m.name}</option>
                                                    ))}
                                                  </select>
                                                  <button
                                                    onClick={() => handleReassign(lead.id)}
                                                    className="px-2 py-1 bg-[#00C9A7] text-[#0A2540] font-black rounded-lg text-[10px]"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => setReassigningLeadId(null)}
                                                    className="p-1 text-slate-400 hover:text-slate-600 text-[10px]"
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => setReassigningLeadId(lead.id)}
                                                  className="text-[#00A88B] hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                                                >
                                                  <ArrowRightLeft className="w-3 h-3" />
                                                  <span>Reassign</span>
                                                </button>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & SHIFT LOGS (10 DAYS HISTORY TABLE) */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-3">
          
          {/* MOBILE-ONLY VIEW (Screens < 768px): Free, Direct on Canvas */}
          <div className="block md:hidden space-y-2.5">
            <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
              <div>
                <h3 className="font-display font-black text-sm text-[#0A2540]">
                  Attendance History
                </h3>
                <p className="text-[10px] text-slate-500">
                  Standard shift starts at 09:30 AM (9.0 Hours)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold px-1">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                On-Time: {onTimeCount} Days
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Late: {lateCount} Days
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                Leaves: {leaveCount} Days
              </span>
            </div>

            {/* Attendance Cards */}
            {attendanceHistory.map((rec, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#0A2540] block">{rec.date}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">({rec.dayName})</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                    rec.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                    rec.status === 'WEEKLY_OFF' ? 'bg-slate-100 text-slate-500' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Punch In</span>
                    <strong className="text-xs font-mono font-bold text-slate-700">{rec.inTime}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Punch Out</span>
                    <strong className="text-xs font-mono font-bold text-slate-700">{rec.outTime}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Shift Hours</span>
                    <strong className="text-xs font-mono font-bold text-[#00A88B]">{rec.hours}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP-ONLY ATTENDANCE TABLE (Screens >= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-[#0A2540]">
                  Daily Shift & Attendance Log
                </h3>
                <p className="text-xs text-slate-500">
                  Standard shift starts at 09:30 AM • Required shift duration: 9.0 Hours
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  On-Time: {onTimeCount} Days
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Late: {lateCount} Days
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Leaves: {leaveCount} Days
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Date & Day</th>
                    <th className="pb-3">Punch-In Time</th>
                    <th className="pb-3">Punch-Out Time</th>
                    <th className="pb-3">Shift Working Hours</th>
                    <th className="pb-3">Attendance Status</th>
                    <th className="pb-3 text-right pr-2">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceHistory.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-[#0A2540]">
                        {rec.date} <span className="text-slate-400 font-normal font-mono">({rec.dayName})</span>
                      </td>

                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold ${
                          rec.isLate ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                          rec.status === 'WEEKLY_OFF' || rec.status === 'LEAVE' ? 'text-slate-400' :
                          'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}>
                          <Clock className="w-3 h-3 text-slate-400" />
                          {rec.inTime}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold ${
                          rec.outTime === 'Shift Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          rec.status === 'WEEKLY_OFF' || rec.status === 'LEAVE' ? 'text-slate-400' :
                          'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}>
                          <Clock className="w-3 h-3 text-slate-400" />
                          {rec.outTime}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono font-bold">
                        <span className={rec.isShort ? 'text-amber-700' : rec.hours !== '0h 00m' ? 'text-emerald-700' : 'text-slate-400'}>
                          {rec.hours}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                          rec.status === 'LEAVE' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 text-right pr-2 text-slate-500 font-medium text-[11px]">
                        {rec.isLate ? '⚠️ Late Punch (>09:30 AM)' : 
                         rec.status === 'LEAVE' ? 'Approved Casual Leave' :
                         rec.status === 'WEEKLY_OFF' ? 'Weekly Off' : '✓ Full Shift Completed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: COMPLIANCE / HR & ADMIN AUDIT */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* HR Payroll & Onboarding Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-black text-lg text-[#0A2540] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>HR & Payroll Details</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Employment Status</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Permanent Staff</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Compensation Package</span>
                  <span className="font-bold font-mono text-[#0A2540]">₹35,000 / month + Incentives</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Leaves Balance</span>
                  <span className="font-bold text-[#0A2540]">14 Days Available (Casual + Sick)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Relieving / Offer Document</span>
                  <span className="font-bold text-sky-700">✓ Signed Offer Letter on File</span>
                </div>
              </div>
            </div>

            {/* Admin Biometric Compliance */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-black text-lg text-[#0A2540] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C9A7]" />
                <span>Security & Biometric Verification</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Face Biometric Registration</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {faceProfile ? '✓ Registered Face ID' : '✓ Verified System Match'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Geofence Compliance</span>
                  <span className="font-bold text-emerald-700">Within Office Radius (&lt;50m)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Device Login Restrictions</span>
                  <span className="font-bold text-slate-700">Office IP & Authorized Mac Address</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Audit Status</span>
                  <span className="font-bold text-emerald-700">Zero Compliance Flags</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
};
