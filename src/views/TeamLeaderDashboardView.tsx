import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useListDefault } from '../hooks/useListDefault';
import { useScreenData } from '../hooks/useScreenData';
import { 
  Bell, 
  Users, 
  PhoneCall, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Edit3, 
  ChevronRight, 
  Home, 
  Download, 
  Calendar, 
  Layers, 
  Plus, 
  Check, 
  Clock, 
  UserCheck, 
  MoreHorizontal,
  Wallet,
  Shield,
  Search,
  Sparkles
} from 'lucide-react';
import { TeamMeeting, TeamMember } from '../types';

export const TeamLeaderDashboardView: React.FC = () => {
  const { 
    teamMembers, 
    teamGroups, 
    teamTasks, 
    teamMeetings,
    leaveRequests, 
    clients,
    approveLeaveRequest, 
    rejectLeaveRequest,
    reassignLead,
    createTeamTask,
    toggleTaskStatus,
    scheduleTeamMeeting,
    triggerToast 
  } = useApp();

  useScreenData('teamLeaderDashboard');

  const [activeTab, setActiveTab] = useState<'home' | 'team' | 'approvals' | 'reports' | 'more'>('home');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE'>('ALL');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedLeadForReassign, setSelectedLeadForReassign] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState('');

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  useListDefault(taskAssignee, setTaskAssignee, teamMembers, (m) => m.name);
  useListDefault(newAssignee, setNewAssignee, teamMembers, (m) => m.name);
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('HIGH');
  const [taskDueDate, setTaskDueDate] = useState('Today, 06:00 PM');

  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState<TeamMeeting['type']>('Team Standup');
  const [meetingTime, setMeetingTime] = useState('Today • 04:30 PM');
  const [meetingLocation, setMeetingLocation] = useState('Conference Bay A');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  // Rejection modal state
  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Dynamic Live Computations from Active Team State
  const totalTeamStrength = teamMembers.length;
  const presentCount = teamMembers.filter(m => m.attendanceStatus === 'PRESENT').length;
  const onLeaveCount = teamMembers.filter(m => m.attendanceStatus === 'ON_LEAVE').length;
  const totalActivities = teamMembers.reduce((sum, m) => sum + (m.dialsToday || 0), 0);
  const totalSales = teamMembers.reduce((sum, m) => sum + (m.salesAchieved || 0), 0);
  const totalCollections = Math.round(totalSales * 0.85);
  const targetAchieved = totalSales;
  const targetTotal = teamMembers.reduce((sum, m) => sum + (m.salesTarget || 200000), 0);
  const targetPercentage = Math.min(100, Math.round((targetAchieved / Math.max(1, targetTotal)) * 100));

  const pendingLeaves = leaveRequests.filter(r => r.status === 'PENDING');

  const avgDialsPerAgent = (totalActivities / Math.max(1, teamMembers.length)).toFixed(1);
  const avgConversion = (
    teamMembers.reduce((sum, m) => sum + (m.conversionRate || 0), 0) / Math.max(1, teamMembers.length)
  ).toFixed(1);

  // Copy before sorting so the shared context array is not mutated during render
  const membersByDials = [...teamMembers].sort((a, b) => b.dialsToday - a.dialsToday);

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    createTeamTask({
      title: taskTitle,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority,
    });
    setTaskTitle('');
    setIsTaskModalOpen(false);
  };

  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    scheduleTeamMeeting({
      title: meetingTitle,
      type: meetingType,
      dateTime: meetingTime,
      location: meetingLocation,
      agenda: meetingAgenda || 'Review weekly telecalling milestones and lead conversion rate.',
    });
    setMeetingTitle('');
    setMeetingAgenda('');
    setIsMeetingModalOpen(false);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForReassign) return;
    reassignLead(selectedLeadForReassign, newAssignee);
    setIsReassignModalOpen(false);
    setSelectedLeadForReassign(null);
  };

  const filteredMembers = teamMembers.filter(m => {
    if (attendanceFilter === 'ALL') return true;
    return m.attendanceStatus === attendanceFilter;
  });

  const exportTeamReportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Group,Attendance,Check-in,Dials,Connected,Interested,Sales Achieved,Target\n"
      + teamMembers.map(e => `"${e.name}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || 'N/A'}",${e.dialsToday},${e.connected},${e.interested},${e.salesAchieved},${e.salesTarget}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Team_Performance_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Exported Team Performance Report (CSV)');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between max-w-lg mx-auto font-sans pb-28 selection:bg-[#00C9A7]/20">
      
      {/* Main Scrollable Content Area */}
      <main className="flex-1 p-3.5 sm:p-4 space-y-4 pt-2">
        
        {/* --- TAB 1: HOME (Clean White & Mint Theme matching Telecaller) --- */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* Greeting Header */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
                    Hello, Ramesh
                  </h2>
                  <span className="text-xl">👋</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Team Leader • <span className="text-[#00A88B] font-bold">Alpha Growth Team</span>
                </p>
              </div>

              {/* Avatar Badge */}
              <div className="w-10 h-10 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-xs shadow-sm">
                RS
              </div>
            </div>

            {/* 3 Top Attendance Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Card 1: Team Members */}
              <div 
                onClick={() => setActiveTab('team')}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#00C9A7] transition-all active:scale-95"
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-bold text-slate-600 leading-tight">Team Members</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00C9A7]" />
                </div>
                <span className="font-display font-black text-2xl text-[#0A2540]">
                  {totalTeamStrength}
                </span>
              </div>

              {/* Card 2: Present Today */}
              <div 
                onClick={() => { setAttendanceFilter('PRESENT'); setActiveTab('team'); }}
                className="bg-white border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all active:scale-95"
              >
                <span className="text-[11px] font-bold text-emerald-700 leading-tight mb-1">
                  Present Today
                </span>
                <span className="font-display font-black text-2xl text-emerald-600">
                  {presentCount}
                </span>
              </div>

              {/* Card 3: On Leave */}
              <div 
                onClick={() => setActiveTab('approvals')}
                className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all active:scale-95"
              >
                <span className="text-[11px] font-bold text-amber-700 leading-tight mb-1">
                  On Leave
                </span>
                <span className="font-display font-black text-2xl text-amber-600">
                  {onLeaveCount}
                </span>
              </div>

            </div>

            {/* Team Overview Section (Today's Summary) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  Team Overview
                </h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-display font-bold text-xs text-slate-700">
                    Today's Summary
                  </span>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className="text-[11px] font-bold text-[#00A88B] hover:underline"
                  >
                    View Report
                  </button>
                </div>

                {/* 3 Metrics in Today's Summary */}
                <div className="space-y-3">
                  
                  {/* Total Activities */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        Total Activities
                      </span>
                    </div>
                    <span className="font-mono-nums font-black text-base text-[#0A2540]">
                      {totalActivities}
                    </span>
                  </div>

                  {/* Total Sales */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        Total Sales
                      </span>
                    </div>
                    <span className="font-mono-nums font-black text-base text-[#0A2540]">
                      ₹ {totalSales.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Collections */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        Total Collections
                      </span>
                    </div>
                    <span className="font-mono-nums font-black text-base text-emerald-600">
                      ₹ {totalCollections.toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Team Performance Section (72% Ring in Light Theme) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  Team Performance
                </h3>
                <span className="text-[11px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-0.5 rounded-full">
                  This Month
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center gap-4">
                
                {/* Circular 72% Gauge */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
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
                      strokeDashoffset={201 - (201 * targetPercentage) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display font-black text-lg text-[#0A2540] leading-none">
                      {targetPercentage}%
                    </span>
                  </div>
                </div>

                {/* Target Metric Breakdown */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Target Achievement
                  </span>
                  <div className="font-mono-nums font-black text-sm text-[#0A2540] truncate">
                    ₹ {targetAchieved.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ ₹ {targetTotal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] rounded-full" style={{ width: `${targetPercentage}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-[#0A2540]">
                Pending Approvals
              </h3>

              <div className="space-y-2.5">
                
                {/* Row 1: Leave Requests */}
                <div 
                  onClick={() => setActiveTab('approvals')}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Leave Requests</h4>
                      <span className="text-[10px] text-slate-500">{pendingLeaves.length} requests awaiting supervisor review</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#00C9A7] text-[#0A2540] font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Row 2: Activity Updates */}
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-white border border-slate-200 hover:border-sky-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Activity Updates</h4>
                      <span className="text-[10px] text-slate-500">Daily client callback logs &amp; notes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                      8
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: TEAM (Live Attendance & Telecaller Roster) --- */}
        {activeTab === 'team' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">Team Members ({teamMembers.length})</h2>
                <p className="text-xs text-slate-500">Real-time attendance &amp; daily dial tracking</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['ALL', 'PRESENT', 'LATE'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAttendanceFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      attendanceFilter === f ? 'bg-[#00C9A7] text-[#0A2540]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Telecallers */}
            <div className="space-y-2.5">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-xs">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-[#0A2540]">{member.name}</strong>
                        <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {member.group}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        Check-in: <strong className="text-emerald-600">{member.checkInTime || 'On Leave'}</strong> • {member.checkInMethod || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono-nums">
                    <span className="font-bold text-xs text-[#0A2540] block">
                      {member.dialsToday} Dials
                    </span>
                    <span className="text-[10px] text-[#00A88B] font-bold">
                      {member.interested} Interested
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: APPROVALS (Leave & Activity Approvals) --- */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Pending Approvals ({pendingLeaves.length})</h2>
              <p className="text-xs text-slate-500">1-tap leave approvals &amp; exceptions</p>
            </div>

            <div className="space-y-3">
              {leaveRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs font-bold text-[#0A2540] block">{req.employeeName || 'Employee'}</strong>
                      <span className="text-[11px] text-slate-500">{req.leaveType} ({req.totalDays} Days)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{req.reason}"
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                    <span>{req.fromDate} to {req.toDate}</span>
                    <span>Applied: {req.appliedOn}</span>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => approveLeaveRequest(req.id)}
                        className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setRejectingLeaveId(req.id)}
                        className="py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: REPORTS (Calling Analytics & CSV Export) --- */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">Performance Reports</h2>
                <p className="text-xs text-slate-500">Team production &amp; target analysis</p>
              </div>
              <button
                onClick={exportTeamReportCSV}
                className="py-2 px-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Mini Summary Chips */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Average Dials / Agent</span>
                <span className="font-mono-nums font-black text-lg text-[#0A2540]">{avgDialsPerAgent} Calls</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Average Conversion</span>
                <span className="font-mono-nums font-black text-lg text-[#00A88B]">{avgConversion}%</span>
              </div>
            </div>

            {/* Leaderboard list */}
            <div className="space-y-2">
              {membersByDials.map((m, i) => (
                <div key={m.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-400 w-5">#{i + 1}</span>
                    <div>
                      <strong className="font-bold text-[#0A2540] block">{m.name}</strong>
                      <span className="text-[10px] text-slate-400">{m.group}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono-nums">
                    <span className="text-[#0A2540] font-bold block">{m.dialsToday} Dials</span>
                    <span className="text-[#00A88B] text-[10px] font-bold">₹{(m.salesAchieved / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: MORE (Groups, Tasks & Standups) --- */}
        {activeTab === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Groups, Tasks &amp; Meetings</h2>
              <p className="text-xs text-slate-500">Manage campaign squads and standups</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="py-3 px-3 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] font-bold text-xs flex items-center justify-center gap-2 text-[#0A2540] shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-[#00C9A7]" />
                <span>Assign Task</span>
              </button>

              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="py-3 px-3 rounded-2xl bg-white border border-slate-200 hover:border-[#00C9A7] font-bold text-xs flex items-center justify-center gap-2 text-[#0A2540] shadow-xs active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4 text-[#00C9A7]" />
                <span>Schedule Standup</span>
              </button>
            </div>

            {/* Groups */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Campaign Groups</h3>
              <div className="space-y-2">
                {teamGroups.map(g => (
                  <div key={g.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#0A2540] block font-bold">{g.name}</strong>
                      <span className="text-[10px] text-slate-400">{g.description}</span>
                    </div>
                    <span className="font-mono text-[#00A88B] font-bold">{g.memberCount} Members</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Active Tasks</h3>
              <div className="space-y-2">
                {teamTasks.map(t => (
                  <div key={t.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          t.status === 'COMPLETED' ? 'bg-[#00C9A7] border-[#00C9A7] text-[#0A2540]' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {t.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <span className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-[#0A2540]'}`}>{t.title}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Assigned: {t.assignedTo}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 5 Bottom Navigation Tabs (Matching Light Theme) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 max-w-lg mx-auto px-2 py-1.5 flex justify-around items-center shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingLeaves.length },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'more', label: 'More', icon: MoreHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-[#00C9A7]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge ? (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black absolute -top-1 -right-2 flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-[#00A88B]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Create Team Task</h3>
            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Task Title / Objective</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call back 20 pending leads from Q2"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Assign To Telecaller</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Due Date</label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-black shadow-md shadow-[#00C9A7]/25"
                >
                  Assign Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standup Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Schedule Team Standup</h3>
            <form onSubmit={handleCreateMeetingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Daily Standup & Pipeline Review"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Meeting Type</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="Team Standup">Team Standup</option>
                  <option value="Sales Pipeline Review">Sales Pipeline Review</option>
                  <option value="Product Training">Product Training</option>
                  <option value="1-on-1 Coaching">1-on-1 Coaching</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Date &amp; Time</label>
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Agenda</label>
                <textarea
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="Points to discuss..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-black shadow-md shadow-[#00C9A7]/25"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Leave Reason Modal */}
      {rejectingLeaveId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-rose-700">Reject Leave Request</h3>
            <p className="text-xs text-slate-500">Enter rejection remarks for employee feedback:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Critical campaign deadline / Shift understaffing"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs h-24 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  rejectLeaveRequest(rejectingLeaveId, rejectReason);
                  setRejectingLeaveId(null);
                  setRejectReason('');
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setRejectingLeaveId(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
