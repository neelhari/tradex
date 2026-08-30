import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useListDefault } from '../../hooks/useListDefault';
import { useScreenData } from '../../hooks/useScreenData';
import { 
  Users, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  PhoneCall, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  MoreHorizontal, 
  ArrowUpRight, 
  MessageCircle, 
  Layers, 
  Check, 
  X,
  CalendarCheck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TeamMeeting, TeamMember } from '../../types';

interface DesktopTeamLeaderViewProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DesktopTeamLeaderView: React.FC<DesktopTeamLeaderViewProps> = ({ 
  currentTab = 'home',
  onTabChange 
}) => {
  const { 
    teamMembers, 
    teamGroups, 
    teamTasks, 
    teamMeetings, 
    leaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    reassignLead, 
    createTeamTask, 
    toggleTaskStatus, 
    scheduleTeamMeeting, 
    triggerToast 
  } = useApp();

  useScreenData('teamLeaderDashboard');

  const [activeSubTab, setActiveSubTab] = useState<string>(currentTab);
  const activeTab = onTabChange ? currentTab : activeSubTab;
  const setTab = onTabChange || setActiveSubTab;

  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Metrics
  const totalTeamStrength = teamMembers.length;
  const presentCount = teamMembers.filter(m => m.attendanceStatus === 'PRESENT').length;
  const onLeaveCount = teamMembers.filter(m => m.attendanceStatus === 'ON_LEAVE').length;
  const lateCount = teamMembers.filter(m => m.attendanceStatus === 'LATE').length;
  const totalActivities = teamMembers.reduce((sum, m) => sum + (m.dialsToday || 0), 0);
  const totalSales = teamMembers.reduce((sum, m) => sum + (m.salesAchieved || 0), 0);
  const totalCollections = Math.round(totalSales * 0.85);
  const targetTotal = teamMembers.reduce((sum, m) => sum + (m.salesTarget || 200000), 0);
  const targetPercentage = Math.min(100, Math.round((totalSales / Math.max(1, targetTotal)) * 100));

  const pendingLeaves = leaveRequests.filter(r => r.status === 'PENDING');

  const filteredMembers = teamMembers.filter(m => {
    const matchesFilter = attendanceFilter === 'ALL' || m.attendanceStatus === attendanceFilter;
    const matchesSearch = !searchQuery.trim() || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.group.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      dateTime: meetingTime,
      type: meetingType,
      location: meetingLocation,
      agenda: meetingAgenda,
    });
    setMeetingTitle('');
    setMeetingAgenda('');
    setIsMeetingModalOpen(false);
  };

  const exportTeamReportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Group,Status,CheckIn,Dials,Sales Achieved,Conversion Rate\n"
      + teamMembers.map(e => `"${e.name}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || 'N/A'}",${e.dialsToday},${e.salesAchieved},${e.conversionRate}%`).join("\n");
    
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Top Header Banner with Greeting & High-Value Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
              Hello, Ramesh Sharma
            </h2>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Team Leader • <span className="text-[#00A88B] font-bold">Alpha Growth Team</span> • <strong className="text-emerald-600">● {presentCount} Active Telecallers</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportTeamReportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 bg-[#E6FAF6] border border-[#00C9A7]/30 text-[#00A88B] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#00C9A7]/20 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>

          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4 stroke-[3]" />
            <span>Schedule Standup</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Summary Cards (Widescreen 4-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Team Members */}
        <div 
          onClick={() => setTab('team')}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#00C9A7] transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Team Size
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{totalTeamStrength}</span>
              <span className="text-xs font-bold text-slate-400">Telecallers</span>
            </div>
            <span className="text-xs text-[#00A88B] font-extrabold mt-1 block group-hover:underline">
              View Roster →
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Attendance / Present */}
        <div 
          onClick={() => { setAttendanceFilter('PRESENT'); setTab('team'); }}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Present Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-emerald-600">{presentCount}</span>
              <span className="text-xs font-bold text-slate-400">/ {totalTeamStrength} On Duty</span>
            </div>
            <span className="text-xs text-emerald-600 font-extrabold mt-1 block">
              {Math.round((presentCount / Math.max(1, totalTeamStrength)) * 100)}% Attendance Rate
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Dials Today */}
        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Dials Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{totalActivities}</span>
              <span className="text-xs font-bold text-slate-400">Calls Logged</span>
            </div>
            <span className="text-xs text-sky-600 font-extrabold mt-1 block">
              Avg {Math.round(totalActivities / Math.max(1, presentCount))} calls / rep
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Sales Achieved */}
        <div 
          onClick={() => setTab('reports')}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Team Monthly Sales
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">₹{(totalSales / 1000).toFixed(0)}k</span>
              <span className="text-xs font-bold text-slate-400">/ ₹{(targetTotal / 1000).toFixed(0)}k</span>
            </div>
            <span className="text-xs text-amber-600 font-extrabold mt-1 block">
              {targetPercentage}% Target Reached
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Main Stage Content Switcher based on active tab */}

      {/* --- TAB: HOME / OVERVIEW --- */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Target Achievement Hero Progress Banner */}
          <div className="bg-gradient-to-r from-[#0A2540] to-[#0A192F] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 z-10">
              <span className="text-xs font-bold text-[#00C9A7] uppercase tracking-wider">
                Monthly Target Performance
              </span>
              <h3 className="font-display font-black text-2xl md:text-3xl text-white">
                ₹{totalSales.toLocaleString()} <span className="text-lg font-normal text-slate-400">of ₹{targetTotal.toLocaleString()}</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Alpha Growth Team has achieved <strong>{targetPercentage}%</strong> of the collective quota for May. Estimated collections standing at <strong>₹{totalCollections.toLocaleString()}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-6 z-10 flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-8 border-[#00C9A7] flex items-center justify-center bg-white/5 shadow-inner">
                <span className="font-display font-black text-2xl text-white">{targetPercentage}%</span>
              </div>
            </div>
            
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#00C9A7]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* 2-Column Section: Leaderboard + Upcoming Standups & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Real-Time Team Leaderboard Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-black text-base text-[#0A2540]">Team Reps Performance</h3>
                  <p className="text-xs text-slate-400">Live dial quotas and conversion rates for today</p>
                </div>
                <button 
                  onClick={() => setTab('team')}
                  className="text-xs font-bold text-[#00A88B] hover:underline"
                >
                  Manage Roster →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Telecaller</th>
                      <th className="pb-3">Group</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Dials Today</th>
                      <th className="pb-3">Sales Done</th>
                      <th className="pb-3">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-xs">
                              {member.avatar || member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#0A2540] block">{member.name}</span>
                              <span className="text-[10px] text-slate-400">{member.empCode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-slate-600">{member.group}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            member.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            member.attendanceStatus === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {member.attendanceStatus}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-800">
                          {member.dialsToday} <span className="text-slate-400 font-normal">/ {member.goalCalls}</span>
                        </td>
                        <td className="py-3 font-mono font-bold text-[#00A88B]">
                          ₹{member.salesAchieved.toLocaleString()}
                        </td>
                        <td className="py-3 font-mono font-black text-slate-700">
                          {member.conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Standups & Pending Approvals */}
            <div className="space-y-6">
              
              {/* Standup Meetings Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-sm text-[#0A2540]">Scheduled Standups</h4>
                  <button onClick={() => setIsMeetingModalOpen(true)} className="text-[11px] font-bold text-[#00A88B] hover:underline">
                    + New
                  </button>
                </div>

                <div className="space-y-2.5">
                  {teamMeetings.slice(0, 2).map((mtg) => (
                    <div key={mtg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#00A88B] bg-[#E6FAF6] px-2 py-0.5 rounded-md uppercase">
                          {mtg.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{(mtg.dateTime ?? '').split('•')[0]}</span>
                      </div>
                      <h5 className="font-bold text-xs text-[#0A2540]">{mtg.title}</h5>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {(mtg.dateTime ?? '').split('•')[1] || mtg.dateTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Leave Approvals Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-sm text-[#0A2540]">Pending Leaves</h4>
                    {pendingLeaves.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {pendingLeaves.length}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setTab('approvals')} className="text-[11px] font-bold text-[#00A88B] hover:underline">
                    Review All →
                  </button>
                </div>

                {pendingLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No pending leave requests</p>
                ) : (
                  <div className="space-y-2.5">
                    {pendingLeaves.slice(0, 2).map((req) => (
                      <div key={req.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{req.employeeName || 'Employee'}</span>
                            <span className="text-[10px] text-rose-700 font-semibold">{req.leaveType} • {req.totalDays} Day(s)</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{req.appliedOn}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">"{req.reason}"</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => approveLeaveRequest(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[#00C9A7] text-[#0A2540] font-bold text-xs shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingLeaveId(req.id)}
                            className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- TAB: TEAM / ROSTER --- */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-xl text-[#0A2540]">Team Roster & Live Tracking</h3>
                <p className="text-xs text-slate-500">Monitor attendance, dialing throughput and sales numbers</p>
              </div>

              {/* Attendance Filter Tabs */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'PRESENT', 'LATE', 'ON_LEAVE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAttendanceFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      attendanceFilter === filter 
                        ? 'bg-white text-[#0A2540] shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Members' : filter.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search telecallers by name, ID code, or group..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
              />
            </div>

            {/* Widescreen Roster Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 hover:border-[#00C9A7] transition-all space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-sm">
                        {member.avatar || member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0A2540]">{member.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{member.empCode} • {member.group}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      member.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                      member.attendanceStatus === 'LATE' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {member.attendanceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Dials</span>
                      <strong className="text-xs font-mono text-[#0A2540]">{member.dialsToday}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Sales</span>
                      <strong className="text-xs font-mono text-[#00A88B]">₹{(member.salesAchieved / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Conv. %</span>
                      <strong className="text-xs font-mono text-slate-700">{member.conversionRate}%</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      In: {member.checkInTime || 'Not checked in'}
                    </span>
                    <button 
                      onClick={() => triggerToast(`📞 Calling ${member.name} (${member.phone})...`)}
                      className="text-[#00A88B] hover:underline font-bold text-[11px]"
                    >
                      Call Rep
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* --- TAB: APPROVALS --- */}
      {activeTab === 'approvals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-black text-xl text-[#0A2540]">Leave & Exception Approvals</h3>
              <p className="text-xs text-slate-500">Review, approve or reject pending leave requests from team members</p>
            </div>

            <div className="space-y-3">
              {leaveRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    req.status === 'PENDING' ? 'bg-amber-50/40 border-amber-200' :
                    req.status === 'APPROVED' ? 'bg-emerald-50/30 border-emerald-200' :
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#0A2540]">{req.employeeName || 'Employee'} ({req.employeeCode || '—'})</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <span><strong>Type:</strong> {req.leaveType}</span>
                      <span>•</span>
                      <span><strong>Duration:</strong> {req.fromDate} to {req.toDate} ({req.totalDays} Day)</span>
                    </div>

                    <p className="text-xs text-slate-500">
                      <strong>Reason:</strong> {req.reason}
                    </p>
                    {req.approvedBy && (
                      <span className="text-[11px] text-slate-400 italic block">Actioned by: {req.approvedBy}</span>
                    )}
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => approveLeaveRequest(req.id)}
                        className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Leave</span>
                      </button>

                      <button
                        onClick={() => setRejectingLeaveId(req.id)}
                        className="flex items-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-[#0A2540]">Team Performance Analytics</h3>
                <p className="text-xs text-slate-500">Breakdown of targets, revenue contributions and team group dynamics</p>
              </div>
              <button
                onClick={exportTeamReportCSV}
                className="flex items-center gap-2 bg-[#00C9A7] text-[#0A2540] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Detailed Report</span>
              </button>
            </div>

            {/* Groups Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamGroups.map((grp) => {
                const percent = Math.min(100, Math.round((grp.achieved / Math.max(1, grp.monthlyTarget)) * 100));
                return (
                  <div key={grp.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#0A2540]">{grp.name}</h4>
                        <span className="text-[11px] text-slate-400">Leader: {grp.leaderName}</span>
                      </div>
                      <span className="font-bold text-xs text-[#00A88B] bg-[#E6FAF6] px-2.5 py-0.5 rounded-full">
                        {percent}%
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Achieved</span>
                        <span className="text-[#0A2540]">₹{grp.achieved.toLocaleString()} / ₹{grp.monthlyTarget.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C9A7] rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: MEETINGS & TASKS --- */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          
          {/* Tasks Column */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-[#0A2540]">Team Tasks & Quotas</h3>
                <p className="text-xs text-slate-400">Assign and track deliverables</p>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00A88B] hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            <div className="space-y-2.5">
              {teamTasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => toggleTaskStatus(t.id)}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer hover:border-[#00C9A7] transition-all"
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 ${
                    t.status === 'COMPLETED' ? 'bg-[#00C9A7] border-[#00C9A7] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {t.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-[#0A2540]'}`}>
                      {t.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      Assigned to: {t.assignedTo} • Due: {t.dueDate}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                    t.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Standup Meetings Column */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-[#0A2540]">Standups & Coaching</h3>
                <p className="text-xs text-slate-400">Team huddles and 1-on-1s</p>
              </div>
              <button 
                onClick={() => setIsMeetingModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00A88B] hover:underline"
              >
                <Plus className="w-4 h-4" /> Schedule
              </button>
            </div>

            <div className="space-y-3">
              {teamMeetings.map((mtg) => (
                <div key={mtg.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-0.5 rounded-full uppercase">
                      {mtg.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{mtg.dateTime}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0A2540]">{mtg.title}</h4>
                  <p className="text-xs text-slate-600 font-medium">📍 {mtg.location}</p>
                  <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                    "{mtg.agenda}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Create Team Task</h3>
            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Task Title</label>
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
                <label className="font-bold text-slate-600 block mb-1">Assign To</label>
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
                <label className="font-bold text-slate-600 block mb-1">Meeting Topic</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Daily Morning Target Huddle"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Session Type</label>
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
                  <label className="font-bold text-slate-600 block mb-1">Location</label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="Bay A / Meet"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Date & Time</label>
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Agenda Points</label>
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
                  Schedule Standup
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
