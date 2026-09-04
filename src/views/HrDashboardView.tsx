import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useListDefault } from '../hooks/useListDefault';
import { useScreenData } from '../hooks/useScreenData';
import { 
  Menu,
  Bell,
  Users, 
  UserCheck, 
  FileText, 
  CreditCard, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Download, 
  ChevronRight, 
  TrendingUp, 
  Layers, 
  Check, 
  Home,
  MoreHorizontal,
  DollarSign,
  QrCode,
  Printer,
  Shield,
  Calendar,
  Briefcase,
  ScanFace,
  Award,
  Sparkles,
  PhoneCall,
  Video,
  Send,
  Upload,
  User,
  Search,
  Clock,
  ArrowLeft,
  CalendarCheck,
  AlertCircle,
  Filter
} from 'lucide-react';
import { OnboardingEmployee, ExitEmployee, TeamMember, TeamGroup } from '../types';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { OfferLetterModal } from '../components/modals/OfferLetterModal';
import { GenerateOfferLetterModal } from '../components/modals/GenerateOfferLetterModal';
import { DigitalIdCardModal } from '../components/modals/DigitalIdCardModal';
import { FaceRegistrationModal } from '../components/modals/FaceRegistrationModal';
import { Employee360ProfileView } from './Employee360ProfileView';

const formatInLakhs = (val: number) => {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
};

export const HrDashboardView: React.FC = () => {
  const {
    teamMembers,
    teamGroups,
    candidates,
    onboardingList,
    exitList,
    payslips,
    leaveRequests,
    paymentVerifications,
    offerLetters,
    setSelectedOfferLetter,
    setIsOfferLetterModalOpen,
    setIsIdCardModalOpen,
    setIsFaceRegistrationModalOpen,
    setFaceRegistrationEmployee,
    scheduleInterview,
    scheduleTeamMeeting,
    updateCandidateStatus,
    toggleOnboardingChecklist,
    toggleExitChecklist,
    generateBulkPayslips,
    approveLeaveRequest,
    rejectLeaveRequest,
    verifyPayment,
    triggerToast 
  } = useApp();

  useScreenData('hrDashboard');

  const [activeHrNav, setActiveHrNav] = useState<'home' | 'attendance' | 'employees' | 'approvals' | 'reports' | 'more'>('home');
  const [selectedTeamGroup, setSelectedTeamGroup] = useState<TeamGroup | null>(null);
  const [selectedEmployeeFor360, setSelectedEmployeeFor360] = useState<TeamMember | null>(null);
  
  // Search & Filter for Team Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE'>('ALL');

  // Modals
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isGenerateOfferLetterModalOpen, setIsGenerateOfferLetterModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isPayslipGenModalOpen, setIsPayslipGenModalOpen] = useState(false);
  const [selectedIdCardEmpId, setSelectedIdCardEmpId] = useState('');

  // Payslip Generator States
  const [payrollMonth, setPayrollMonth] = useState('May');
  const [payrollYear, setPayrollYear] = useState('2025');
  const [payslipSelectionMode, setPayslipSelectionMode] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedEmpIdsForPayroll, setSelectedEmpIdsForPayroll] = useState<string[]>(teamMembers.map(m => m.id));

  // Schedule Interview States
  const [candName, setCandName] = useState('');
  const [candRole, setCandRole] = useState('Senior Telecaller Specialist');
  const [candExp, setCandExp] = useState('2+ Years in B2B Sales');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candTime, setCandTime] = useState('Tomorrow • 02:30 PM');
  const [interviewTeamScope, setInterviewTeamScope] = useState('ALL');
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>(['Priya Nair', 'Ramesh Sharma']);

  const idCardEmp = teamMembers.find((m) => m.id === selectedIdCardEmpId);
  useListDefault(selectedIdCardEmpId, setSelectedIdCardEmpId, teamMembers, (m) => m.id);

  // Filtered members for Team Roster
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.group && m.group.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFilter =
        attendanceFilter === 'ALL' || m.attendanceStatus === attendanceFilter;
      return matchSearch && matchFilter;
    });
  }, [teamMembers, searchQuery, attendanceFilter]);

  // Org stats derived from live backend data
  const totalTeams = teamGroups.length;
  const totalEmployees = teamMembers.length;
  const onLeaveCount = teamMembers.filter((m) => m.attendanceStatus === 'ON_LEAVE').length;
  const presentCount = teamMembers.filter((m) => m.attendanceStatus === 'PRESENT').length;
  const lateCount = teamMembers.filter((m) => m.attendanceStatus === 'LATE').length;
  const absentCount = teamMembers.filter((m) => m.attendanceStatus === 'ABSENT').length;
  const attendancePercent = Math.round((presentCount / Math.max(1, totalEmployees)) * 100);

  const lateEmployees = useMemo(() => teamMembers.filter((m) => m.attendanceStatus === 'LATE'), [teamMembers]);
  const onLeaveEmployees = useMemo(() => teamMembers.filter((m) => m.attendanceStatus === 'ON_LEAVE'), [teamMembers]);

  const totalActivities = teamMembers.reduce((sum, m) => sum + (m.dialsToday || 0), 0);
  const totalGoalCalls = teamMembers.reduce((sum, m) => sum + (m.goalCalls || 100), 0);
  const totalWonToday = useMemo(() => {
    return teamMembers.filter(m => m.salesAchieved > 0).length || 7;
  }, [teamMembers]);

  const formatInLakhs = (amount: number) => {
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(2);
      return `₹${lakhs.replace(/\.00$/, '')} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalSalesTarget = teamMembers.reduce((sum, m) => sum + m.salesTarget, 0);
  const totalSalesAchieved = teamMembers.reduce((sum, m) => sum + m.salesAchieved, 0);
  const targetAchievedPercent = Math.round((totalSalesAchieved / Math.max(1, totalSalesTarget)) * 100);

  const pendingApprovalsCount =
    leaveRequests.filter((r) => r.status === 'PENDING').length +
    paymentVerifications.filter((p) => p.status === 'PENDING_HR_AUDIT').length;

  // Leave Approvals & Sanctions States
  const [leaveApprovalTab, setLeaveApprovalTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [approvedCategoryFilter, setApprovedCategoryFilter] = useState<'ALL' | 'Casual Leave' | 'Sick Leave' | 'Earned / Paid Leave'>('ALL');

  const pendingLeaves = useMemo(() => leaveRequests.filter((r) => r.status === 'PENDING'), [leaveRequests]);
  const approvedLeaves = useMemo(() => leaveRequests.filter((r) => r.status === 'APPROVED'), [leaveRequests]);
  const rejectedLeaves = useMemo(() => leaveRequests.filter((r) => r.status === 'REJECTED'), [leaveRequests]);

  const approvedCasualCount = useMemo(() => approvedLeaves.filter((r) => r.leaveType === 'Casual Leave').length, [approvedLeaves]);
  const approvedSickCount = useMemo(() => approvedLeaves.filter((r) => r.leaveType === 'Sick Leave').length, [approvedLeaves]);
  const approvedEarnedCount = useMemo(() => approvedLeaves.filter((r) => r.leaveType.includes('Earned') || r.leaveType.includes('Paid')).length, [approvedLeaves]);
  const totalApprovedDays = useMemo(() => approvedLeaves.reduce((sum, r) => sum + (r.totalDays || 1), 0), [approvedLeaves]);

  const displayedApprovedLeaves = useMemo(() => {
    if (approvedCategoryFilter === 'ALL') return approvedLeaves;
    if (approvedCategoryFilter === 'Earned / Paid Leave') {
      return approvedLeaves.filter((r) => r.leaveType.includes('Earned') || r.leaveType.includes('Paid'));
    }
    return approvedLeaves.filter((r) => r.leaveType === approvedCategoryFilter);
  }, [approvedLeaves, approvedCategoryFilter]);

  const teamAnalyticsData = [
    { team: 'HNI Closers', percent: 96 },
    { team: 'Inbound Qualifiers', percent: 92 },
    { team: 'Retention Squad', percent: 88 },
    { team: 'Enterprise Growth', percent: 94 },
  ];

  const handleGeneratePayslipsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateBulkPayslips(payrollMonth, payrollYear);
    setIsPayslipGenModalOpen(false);
    triggerToast(`✓ Published ${payrollMonth} ${payrollYear} payslips for ${payslipSelectionMode === 'ALL' ? totalEmployees : selectedEmpIdsForPayroll.length} employees!`);
  };

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) return;

    // 1. Create interview record
    scheduleInterview({
      candidateName: candName.trim(),
      roleApplied: candRole,
      experience: candExp,
      email: candEmail || `${candName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: candPhone || '+91 98765 43210',
      interviewTime: candTime,
      interviewer: selectedInterviewers.join(', ') || 'HR & Team Leader',
    });

    // 2. Dispatch Live Video Meeting to attendees' dashboards
    scheduleTeamMeeting({
      title: `Candidate Interview: ${candName} (${candRole})`,
      dateTime: candTime,
      type: 'Candidate Interview (Video Call)',
      location: 'Trade Nexus Live Room #HR-101',
      agenda: `HR & Technical screening for ${candName} applying for ${candRole}. Attendees: ${selectedInterviewers.join(', ')}`,
      attendeesCount: selectedInterviewers.length + 1,
      invitedMemberName: selectedInterviewers.join(', '),
      meetingLink: 'https://meet.tradenexus.io/interview-hr',
    });

    setCandName('');
    setIsInterviewModalOpen(false);
    triggerToast(`✓ Candidate Interview & Live Video Call dispatched to ${selectedInterviewers.join(', ')}!`);
  };

  const exportHrReportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Name,Role,Group,Attendance,Dials,Sales Target,Sales Achieved\n' +
      teamMembers
        .map(
          (m) =>
            `${m.id},"${m.name}","${m.role}","${m.group}",${m.attendanceStatus},${m.dialsToday},${m.salesTarget},${m.salesAchieved}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HR_Workforce_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ HR Workforce Analytics Report downloaded (CSV)');
  };

  // If 360 Dossier is open, render Employee360ProfileView
  if (selectedEmployeeFor360) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 px-3 sm:px-6 pt-2">
        <Employee360ProfileView
          member={selectedEmployeeFor360}
          onBack={() => setSelectedEmployeeFor360(null)}
          viewerRole="hr"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 animate-in fade-in duration-150">
      
      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* --- TAB 1: HR HOME / PULSE --- */}
        {activeHrNav === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* 3 Top Stat Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Card 1: Teams */}
              <div 
                onClick={() => setActiveHrNav('employees')}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#00C9A7] transition-all active:scale-95"
              >
                <span className="text-[11px] font-bold text-slate-600 leading-tight mb-1">
                  Teams
                </span>
                <span className="font-display font-black text-2xl text-[#0A2540]">
                  {totalTeams}
                </span>
              </div>

              {/* Card 2: Employees */}
              <div 
                onClick={() => setActiveHrNav('employees')}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#00C9A7] transition-all active:scale-95"
              >
                <span className="text-[11px] font-bold text-slate-600 leading-tight mb-1">
                  Employees
                </span>
                <span className="font-display font-black text-2xl text-[#0A2540]">
                  {totalEmployees}
                </span>
              </div>

              {/* Card 3: On Leave */}
              <div 
                onClick={() => setActiveHrNav('approvals')}
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

            {/* Today's Floor Overview Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  Today's Floor Overview
                </h3>
                <span className="text-[11px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A88B] animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Attendance - Real Headcount */}
                <div 
                  onClick={() => {
                    setAttendanceFilter('PRESENT');
                    setActiveHrNav('attendance');
                  }}
                  className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 shadow-xs text-center space-y-1 cursor-pointer transition-all active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Attendance</span>
                  <span className="font-display font-black text-xl text-emerald-600 block group-hover:scale-105 transition-transform">
                    {presentCount} <span className="text-xs text-slate-400 font-normal">/ {totalEmployees}</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                    {attendancePercent}% On Floor
                  </span>
                </div>

                {/* Late Punch-ins - Replaces Target Achieved */}
                <div 
                  onClick={() => {
                    setAttendanceFilter('LATE');
                    setActiveHrNav('attendance');
                  }}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-3 shadow-xs text-center space-y-1 cursor-pointer transition-all active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Late Punch-ins</span>
                  <span className="font-display font-black text-xl text-amber-600 block group-hover:scale-105 transition-transform">
                    {lateCount}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                    lateCount > 0 ? 'text-amber-800 bg-amber-50 border border-amber-200/80' : 'text-slate-500 bg-slate-100'
                  }`}>
                    {lateCount > 0 ? 'Late Flagged' : 'All On Time'}
                  </span>
                </div>

                {/* Today's Revenue - Replaces Pending Approvals */}
                <div 
                  onClick={() => setActiveHrNav('employees')}
                  className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 shadow-xs text-center space-y-1 cursor-pointer transition-all active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Today's Revenue</span>
                  <span className="font-display font-black text-xl text-emerald-600 block group-hover:scale-105 transition-transform">
                    {formatInLakhs(totalSalesAchieved)}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md inline-block">
                    {totalWonToday} Won Deals
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Attendance Exceptions & Late Arrivals Radar (Replaces Useless Bar Chart) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Today's Attendance Exceptions</span>
                </h3>
                <button 
                  onClick={() => setActiveHrNav('attendance')}
                  className="text-[11px] font-bold text-[#00A88B] hover:text-[#0A2540] transition-colors flex items-center gap-0.5"
                >
                  <span>Open Register</span>
                  <span>→</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#0A2540] block">
                    Punctuality &amp; Leaves Log
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Floor Cutoff: 09:30 AM
                  </span>
                </div>

                {lateEmployees.length === 0 && onLeaveEmployees.length === 0 ? (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>All clocked-in staff arrived on time today. Zero punctuality flags!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Late Arrival Items */}
                    {lateEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setAttendanceFilter('LATE');
                          setActiveHrNav('attendance');
                        }}
                        className="bg-amber-50/60 border border-amber-200/80 hover:border-amber-400 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {emp.avatar || emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-xs font-bold text-[#0A2540] truncate group-hover:text-amber-800 transition-colors">
                                {emp.name}
                              </strong>
                              <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {emp.group}
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              Checked in: {emp.checkInTime || '09:42 AM'} (Late Flag)
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-amber-800 bg-white border border-amber-200 px-2 py-1 rounded-xl shadow-2xs group-hover:bg-amber-500 group-hover:text-white transition-colors flex-shrink-0">
                          Review →
                        </span>
                      </div>
                    ))}

                    {/* On-Leave Items */}
                    {onLeaveEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setAttendanceFilter('ON_LEAVE');
                          setActiveHrNav('attendance');
                        }}
                        className="bg-purple-50/60 border border-purple-200/80 hover:border-purple-400 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {emp.avatar || emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-xs font-bold text-[#0A2540] truncate group-hover:text-purple-800 transition-colors">
                                {emp.name}
                              </strong>
                              <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {emp.group}
                              </span>
                            </div>
                            <span className="text-[10px] text-purple-700 font-medium">
                              Approved Leave for Today
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-purple-800 bg-white border border-purple-200 px-2 py-1 rounded-xl shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
                          Inspect →
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Operations Grid */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-[#0A2540]">
                HR Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Action 1: Onboard New Employee */}
                <button
                  onClick={() => setIsAddEmployeeModalOpen(true)}
                  className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-2 border-[#00C9A7]/60 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-sm flex items-center gap-3 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00C9A7] text-slate-950 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-[#0A2540] block">Onboard Employee</strong>
                    <span className="text-[10px] text-teal-800 font-medium">Create credentials</span>
                  </div>
                </button>

                {/* Action 2: Generate Offer Letter */}
                <button
                  onClick={() => setIsGenerateOfferLetterModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Offer Letter</strong>
                    <span className="text-[10px] text-slate-500">Pre-onboarding form</span>
                  </div>
                </button>

                {/* Action 3: Generate Payslips */}
                <button
                  onClick={() => setIsPayslipGenModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center font-bold flex-shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Generate Payslips</strong>
                    <span className="text-[10px] text-slate-500">Select &amp; calculate</span>
                  </div>
                </button>

                {/* Action 4: Schedule Interview */}
                <button
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Interview Call</strong>
                    <span className="text-[10px] text-slate-500">Meeting &amp; alert</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Official Offer Letters Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540] flex items-center gap-1.5">
                  <span>Official Offer Letters ({offerLetters.length})</span>
                </h3>
                <button
                  onClick={() => setIsGenerateOfferLetterModalOpen(true)}
                  className="text-[11px] font-bold text-[#00A88B] hover:underline"
                >
                  + Generate New
                </button>
              </div>

              <div className="space-y-2">
                {offerLetters.map((letter) => (
                  <div 
                    key={letter.id} 
                    onClick={() => {
                      setSelectedOfferLetter(letter);
                      setIsOfferLetterModalOpen(true);
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 shadow-xs flex items-center justify-between text-xs cursor-pointer transition-all active:scale-98"
                  >
                    <div className="space-y-0.5">
                      <strong className="font-bold text-[#0A2540] block">{letter.candidateName}</strong>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {letter.roleTitle} • CTC: <span className="font-bold text-slate-700">₹{letter.annualCtc.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {letter.issuedDate}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: DEDICATED DAILY ATTENDANCE & PUNCH REGISTER --- */}
        {activeHrNav === 'attendance' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Header with Date & Cutoff */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-black text-xl text-[#0A2540]">Daily Attendance Register</h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })} • Cutoff: 09:30 AM
                </p>
              </div>
              <button
                onClick={exportHrReportCSV}
                className="flex items-center gap-1 text-[11px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-1.5 rounded-xl border border-[#00C9A7]/30 hover:bg-[#00C9A7] hover:text-[#0A2540] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Log</span>
              </button>
            </div>

            {/* Attendance Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => setAttendanceFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  attendanceFilter === 'ALL'
                    ? 'bg-[#0A2540] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({totalEmployees})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('PRESENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  attendanceFilter === 'PRESENT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-emerald-200/80 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('LATE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  attendanceFilter === 'LATE'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border border-amber-200/80 text-amber-700 hover:bg-amber-50'
                }`}
              >
                Late ({lateCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('ON_LEAVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  attendanceFilter === 'ON_LEAVE'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white border border-purple-200/80 text-purple-700 hover:bg-purple-50'
                }`}
              >
                On Leave ({onLeaveCount})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee name, code, or squad..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
              />
            </div>

            {/* Attendance Register Roster */}
            <div className="space-y-2.5">
              {filteredMembers.map((member) => {
                const isPresent = member.attendanceStatus === 'PRESENT';
                const isLate = member.attendanceStatus === 'LATE';
                const isLeave = member.attendanceStatus === 'ON_LEAVE';

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedEmployeeFor360(member)}
                    className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                    />

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform flex-shrink-0">
                          {member.avatar || member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                              {member.name}
                            </strong>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {member.group}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {member.empCode} • {member.role || 'Telecaller'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isPresent
                            ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                            : isLate
                            ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
                            : 'bg-purple-100/90 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {member.attendanceStatus}
                      </span>
                    </div>

                    {/* Punch details & dials */}
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                      <span className="text-slate-600 font-mono flex items-center gap-1">
                        <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-amber-500' : isPresent ? 'text-emerald-500' : 'text-slate-400'}`} />
                        {isLeave
                          ? 'Approved Leave for Today'
                          : member.checkInTime
                          ? `Punch In: ${member.checkInTime}${isLate ? ' (Late Flag)' : ' (On Time)'}`
                          : 'Punch In: Not Logged'}
                      </span>
                      <span className="text-[#00A88B] font-bold group-hover:underline flex items-center gap-0.5">
                        <span>View 360</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-semibold">
                  Nobody matches this attendance filter or search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: TEAMS & EMPLOYEES HIERARCHY --- */}
        {activeHrNav === 'employees' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* If a team is selected -> LEVEL 2: THAT TEAM'S EMPLOYEES */}
            {selectedTeamGroup ? (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Back to All Teams Navigation Header */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => setSelectedTeamGroup(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00A88B] bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>All Teams</span>
                  </button>

                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Team Scope
                  </span>
                </div>

                {/* Team Pulse Box for THIS team */}
                <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTeamGroup.color || '#00C9A7' }} />
                      <span className="text-xs font-black tracking-wider text-[#0A2540] uppercase">
                        {selectedTeamGroup.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      TL: {selectedTeamGroup.leaderName || 'Ramesh Sharma'}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* 4 Metric Columns for this team */}
                  {(() => {
                    const teamEmps = teamMembers.filter(m => m.group === selectedTeamGroup.name);
                    const teamDials = teamEmps.reduce((s, m) => s + (m.dialsToday || 0), 0);
                    const teamGoals = teamEmps.reduce((s, m) => s + (m.goalCalls || 100), 0);
                    const teamWon = teamEmps.filter(m => m.salesAchieved > 0).length;
                    const teamRev = teamEmps.reduce((s, m) => s + (m.salesAchieved || 0), 0);
                    const teamPresent = teamEmps.filter(m => m.attendanceStatus === 'PRESENT').length;
                    const teamLate = teamEmps.filter(m => m.attendanceStatus === 'LATE').length;
                    const teamLeave = teamEmps.filter(m => m.attendanceStatus === 'ON_LEAVE').length;

                    return (
                      <>
                        <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                              {teamEmps.length}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Team
                            </span>
                          </div>

                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                              <span className="text-[#00A88B]">{teamDials}</span>
                              <span className="text-slate-300 font-normal text-xs">/{teamGoals}</span>
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Calls
                            </span>
                          </div>

                          <div className="px-1">
                            <strong className="text-base font-display font-black text-purple-700 block leading-tight">
                              {teamWon}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Won
                            </span>
                          </div>

                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#00A88B] block leading-tight">
                              {formatInLakhs(teamRev)}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Revenue
                            </span>
                          </div>
                        </div>

                        {/* Attendance Pill status */}
                        <div className="bg-[#E6F8F5] border border-[#B2EFE5] text-[#00897B] font-bold text-[10px] px-2.5 py-1 rounded-xl text-center">
                          {teamPresent} Present • {teamLate} Late • {teamLeave} Leave
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Search within this team */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${selectedTeamGroup.name}...`}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>

                {/* Filter Pills for this team */}
                {(() => {
                  const teamEmps = teamMembers.filter(m => m.group === selectedTeamGroup.name);
                  const pCount = teamEmps.filter(m => m.attendanceStatus === 'PRESENT').length;
                  const lCount = teamEmps.filter(m => m.attendanceStatus === 'LATE').length;
                  const oCount = teamEmps.filter(m => m.attendanceStatus === 'ON_LEAVE').length;

                  return (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'ALL'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        All ({teamEmps.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('PRESENT')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'PRESENT'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Present ({pCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('LATE')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'LATE'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Late ({lCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('ON_LEAVE')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'ON_LEAVE'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Leave ({oCount})
                      </button>
                    </div>
                  );
                })()}

                {/* Team's Telecallers List */}
                <div className="space-y-3">
                  {teamMembers
                    .filter(m => m.group === selectedTeamGroup.name)
                    .filter(m => {
                      const matchSearch =
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.empCode.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchFilter =
                        attendanceFilter === 'ALL' || m.attendanceStatus === attendanceFilter;
                      return matchSearch && matchFilter;
                    })
                    .map((member) => {
                      const isPresent = member.attendanceStatus === 'PRESENT';
                      const isLate = member.attendanceStatus === 'LATE';

                      return (
                        <div 
                          key={member.id}
                          onClick={() => setSelectedEmployeeFor360(member)}
                          className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-2xs hover:shadow-md flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all group relative overflow-hidden"
                        >
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            isPresent ? 'bg-gradient-to-r from-emerald-400 to-[#00C9A7]' :
                            isLate ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            'bg-gradient-to-r from-rose-400 to-rose-500'
                          }`} />

                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                                  {member.avatar || member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                              </div>

                              <div>
                                <strong className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors block">
                                  {member.name}
                                </strong>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {member.empCode} • {member.role || 'Telecaller'}
                                </span>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isPresent ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80' :
                              isLate ? 'bg-amber-100/90 text-amber-800 border border-amber-200/80' :
                              'bg-rose-100/90 text-rose-800 border border-rose-200/80'
                            }`}>
                              {member.attendanceStatus}
                            </span>
                          </div>

                          {/* 3 Metric Matrix */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-1.5 rounded-xl border border-slate-100 text-center">
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Dials</span>
                              <strong className="text-xs font-mono font-black text-[#0A2540]">{member.dialsToday}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-[#00A88B] block font-bold uppercase tracking-wider">Sales</span>
                              <strong className="text-xs font-mono font-black text-[#00A88B]">{formatInLakhs(member.salesAchieved)}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-emerald-600 block font-bold uppercase tracking-wider">Interested</span>
                              <strong className="text-xs font-mono font-black text-emerald-700">{member.interested || 12}</strong>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              In: {member.checkInTime || '09:12 AM'}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-[#E6FAF6] text-[#00A88B] font-bold group-hover:bg-[#00C9A7] group-hover:text-[#0A2540] transition-colors flex items-center gap-1 shadow-2xs">
                              <span>View Profile</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              /* LEVEL 1: ALL TEAMS VIEW (DEFAULT) */
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Floor Pulse Box */}
                <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black tracking-wider text-[#0A2540] uppercase">
                        Organization Floor Pulse
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="bg-[#E6F8F5] border border-[#B2EFE5] text-[#00897B] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {presentCount} Present • {lateCount} Late • {onLeaveCount} Leave
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                        {teamGroups.length}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Teams
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                        <span className="text-[#00A88B]">{totalActivities}</span>
                        <span className="text-slate-300 font-normal text-xs">/{totalGoalCalls}</span>
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Calls
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-purple-700 block leading-tight">
                        {totalWonToday}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Won
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#00A88B] block leading-tight">
                        {formatInLakhs(totalSalesAchieved)}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Revenue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="font-display font-black text-sm text-[#0A2540]">
                      All Sales Teams ({teamGroups.length})
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Tap a team to inspect telecallers, attendance &amp; daily calls
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {totalEmployees} Total Staff
                  </span>
                </div>

                {/* Teams List */}
                <div className="space-y-3">
                  {teamGroups.map((group) => {
                    const groupMembers = teamMembers.filter(m => m.group === group.name);
                    const groupPresent = groupMembers.filter(m => m.attendanceStatus === 'PRESENT').length;
                    const groupLate = groupMembers.filter(m => m.attendanceStatus === 'LATE').length;
                    const groupLeave = groupMembers.filter(m => m.attendanceStatus === 'ON_LEAVE').length;
                    const groupDials = groupMembers.reduce((s, m) => s + (m.dialsToday || 0), 0);
                    const groupSales = groupMembers.reduce((s, m) => s + (m.salesAchieved || 0), 0);

                    return (
                      <div
                        key={group.id}
                        onClick={() => setSelectedTeamGroup(group)}
                        className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden space-y-3"
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-1" 
                          style={{ backgroundColor: group.color || '#00C9A7' }} 
                        />

                        {/* Team Title & TL */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-black text-white text-sm shadow-xs group-hover:scale-105 transition-transform flex-shrink-0"
                              style={{ backgroundColor: group.color || '#0A2540' }}
                            >
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-display font-black text-sm text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                                  {group.name}
                                </h4>
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                                  {groupMembers.length} Members
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                Team Leader: <strong className="text-slate-700">{group.leaderName || 'Ramesh Sharma'}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#E6FAF6] text-[#00A88B] border border-[#00C9A7]/30">
                              {groupPresent}/{groupMembers.length} Present
                            </span>
                          </div>
                        </div>

                        {/* Team Stats Matrix */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-2 rounded-xl border border-slate-100 text-center">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Calls Today</span>
                            <strong className="text-xs font-mono font-black text-[#0A2540]">{groupDials} calls</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#00A88B] block font-bold uppercase tracking-wider">Revenue</span>
                            <strong className="text-xs font-mono font-black text-[#00A88B]">{formatInLakhs(groupSales)}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Attendance</span>
                            <strong className="text-xs font-mono font-bold text-slate-700">
                              {groupPresent}P • {groupLate}L • {groupLeave}O
                            </strong>
                          </div>
                        </div>

                        {/* Card Footer Action */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {group.description || 'High-velocity client engagement team'}
                          </span>
                          <span className="text-[11px] font-bold text-[#00A88B] group-hover:underline flex items-center gap-1">
                            <span>View Employees</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: APPROVALS & LEAVES --- */}
        {activeHrNav === 'approvals' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Clean Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540] flex items-center gap-2">
                  <span>HR Sanctions &amp; Approvals</span>
                </h2>
                <p className="text-xs text-slate-500">Leave applications &amp; floor attendance governance</p>
              </div>
              {pendingLeaves.length > 0 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingLeaves.length} Needs Action</span>
                </span>
              )}
            </div>

            {/* Unified 3-Card Stage Selector (Consolidates stats + navigation, eliminates redundant button bar) */}
            <div className="grid grid-cols-3 gap-2">
              {/* Tab 1: Pending */}
              <button
                onClick={() => setLeaveApprovalTab('PENDING')}
                className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  leaveApprovalTab === 'PENDING'
                    ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/25 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className={`text-[11px] font-bold ${
                    leaveApprovalTab === 'PENDING' ? 'text-amber-900' : 'text-slate-500'
                  }`}>
                    Pending
                  </span>
                  {pendingLeaves.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display font-black text-2xl ${
                    leaveApprovalTab === 'PENDING' ? 'text-amber-700' : 'text-[#0A2540]'
                  }`}>
                    {pendingLeaves.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">to review</span>
                </div>
                <div className={`mt-2 h-1 w-full rounded-full transition-all ${
                  leaveApprovalTab === 'PENDING' ? 'bg-amber-500' : 'bg-transparent'
                }`} />
              </button>

              {/* Tab 2: Approved */}
              <button
                onClick={() => setLeaveApprovalTab('APPROVED')}
                className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  leaveApprovalTab === 'APPROVED'
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/25 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className={`text-[11px] font-bold ${
                    leaveApprovalTab === 'APPROVED' ? 'text-emerald-900' : 'text-slate-500'
                  }`}>
                    Approved
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/70 px-1 py-0.2 rounded font-mono">
                    {totalApprovedDays}d
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display font-black text-2xl ${
                    leaveApprovalTab === 'APPROVED' ? 'text-emerald-700' : 'text-[#0A2540]'
                  }`}>
                    {approvedLeaves.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">sanctioned</span>
                </div>
                <div className={`mt-2 h-1 w-full rounded-full transition-all ${
                  leaveApprovalTab === 'APPROVED' ? 'bg-emerald-500' : 'bg-transparent'
                }`} />
              </button>

              {/* Tab 3: Rejected */}
              <button
                onClick={() => setLeaveApprovalTab('REJECTED')}
                className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  leaveApprovalTab === 'REJECTED'
                    ? 'bg-rose-500/10 border-rose-400 ring-2 ring-rose-400/25 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className={`text-[11px] font-bold ${
                    leaveApprovalTab === 'REJECTED' ? 'text-rose-900' : 'text-slate-500'
                  }`}>
                    Rejected
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                    Log
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display font-black text-2xl ${
                    leaveApprovalTab === 'REJECTED' ? 'text-rose-700' : 'text-[#0A2540]'
                  }`}>
                    {rejectedLeaves.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">archived</span>
                </div>
                <div className={`mt-2 h-1 w-full rounded-full transition-all ${
                  leaveApprovalTab === 'REJECTED' ? 'bg-rose-500' : 'bg-transparent'
                }`} />
              </button>
            </div>

            {/* --- SECTION 1: PENDING QUEUE --- */}
            {leaveApprovalTab === 'PENDING' && (
              <div className="space-y-3">
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl px-3 py-2 text-xs text-amber-900 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-[11px]">Review reason &amp; shift coverage before sanctioning.</span>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-[#0A2540]">All Clear!</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Zero pending leave applications. Floor attendance is fully accounted for.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingLeaves.map((req) => {
                      const emp = teamMembers.find(m => m.name === req.employeeName || m.empCode === req.employeeCode);
                      return (
                        <div key={req.id} className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-3.5 shadow-xs space-y-2.5 transition-all">
                          {/* Clean Applicant Header (No stacked pills) */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {emp?.avatar || req.employeeName?.substring(0, 2).toUpperCase() || 'EM'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#0A2540] truncate">
                                  {req.employeeName || 'Employee'}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate">
                                  <span className="font-mono text-slate-600">{req.employeeCode || emp?.empCode || 'TNX'}</span>
                                  <span className="mx-1.5 text-slate-300">•</span>
                                  <span>{emp?.group || 'Inside Sales Squad'}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap flex-shrink-0">
                              Awaiting Decision
                            </span>
                          </div>

                          {/* Leave Specs: Single elegant info row */}
                          <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                req.leaveType === 'Sick Leave'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              }`}>
                                {req.leaveType} ({req.totalDays}d)
                              </span>
                              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{req.fromDate} {req.toDate !== req.fromDate ? `– ${req.toDate}` : ''}</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {req.appliedOn || 'Today'}
                            </span>
                          </div>

                          {/* Reason Quote with elegant left accent border */}
                          <div className="border-l-2 border-amber-400 bg-amber-50/30 pl-2.5 py-1.5 rounded-r-lg">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              Stated Reason
                            </span>
                            <p className="text-xs text-slate-700 italic">
                              "{req.reason}"
                            </p>
                          </div>

                          {/* Action Bar */}
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <button
                              onClick={() => {
                                approveLeaveRequest(req.id);
                                triggerToast(`✓ Sanctioned leave for ${req.employeeName || 'Employee'}`);
                              }}
                              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Sanction Leave</span>
                            </button>
                            <button
                              onClick={() => {
                                rejectLeaveRequest(req.id, 'Shift coverage constraint');
                                triggerToast(`✗ Rejected leave application for ${req.employeeName || 'Employee'}`);
                              }}
                              className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>

                          {/* Quick 360 link */}
                          {emp && (
                            <div className="text-right pt-0.5">
                              <button
                                onClick={() => setSelectedEmployeeFor360(emp)}
                                className="text-[11px] font-bold text-[#00A88B] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Inspect Employee 360 &amp; Past Leaves</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- SECTION 2: APPROVED LEAVES WITH STREAMLINED CATEGORY FILTER --- */}
            {leaveApprovalTab === 'APPROVED' && (
              <div className="space-y-3">
                {/* Approved Overview Card */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-emerald-900 block">
                        Total Leaves Approved: {approvedLeaves.length}
                      </strong>
                      <span className="text-[10px] text-emerald-700">
                        {totalApprovedDays} total days sanctioned across all squads
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg shadow-2xs">
                    Sanctions Log
                  </span>
                </div>

                {/* Category Filter Pills Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#00A88B]" />
                      <span>Leave Categories:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Showing {displayedApprovedLeaves.length} of {approvedLeaves.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      { id: 'ALL', label: 'All Approved', count: approvedLeaves.length },
                      { id: 'Casual Leave', label: 'Casual', count: approvedCasualCount },
                      { id: 'Sick Leave', label: 'Sick', count: approvedSickCount },
                      { id: 'Earned / Paid Leave', label: 'Paid / Earned', count: approvedEarnedCount },
                    ].map((cat) => {
                      const isActive = approvedCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setApprovedCategoryFilter(cat.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#00A88B] text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                            isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Approved Cards List */}
                {displayedApprovedLeaves.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-1 shadow-xs">
                    <p className="text-xs font-bold text-[#0A2540]">No records in this category</p>
                    <p className="text-[11px] text-slate-400">
                      No approved leave applications match "{approvedCategoryFilter}".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {displayedApprovedLeaves.map((req) => {
                      const emp = teamMembers.find(m => m.name === req.employeeName || m.empCode === req.employeeCode);
                      return (
                        <div key={req.id} className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-3.5 shadow-xs space-y-2.5 transition-all">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-100 flex-shrink-0">
                                {emp?.avatar || req.employeeName?.substring(0, 2).toUpperCase() || 'EM'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#0A2540] truncate">
                                  {req.employeeName || 'Employee'}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate">
                                  <span className="font-mono text-slate-600">{req.employeeCode || emp?.empCode || 'TNX'}</span>
                                  <span className="mx-1.5 text-slate-300">•</span>
                                  <span>{emp?.group || 'Inside Sales Squad'}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sanctioned</span>
                            </span>
                          </div>

                          {/* Leave Specs */}
                          <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-100">
                            <span className="text-[11px] font-bold text-slate-700">
                              {req.leaveType} ({req.totalDays}d)
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{req.fromDate} {req.toDate !== req.fromDate ? `– ${req.toDate}` : ''}</span>
                            </span>
                          </div>

                          {/* Reason */}
                          <div className="border-l-2 border-emerald-400 bg-emerald-50/30 pl-2.5 py-1.5 rounded-r-lg">
                            <p className="text-xs text-slate-600 italic">
                              "{req.reason}"
                            </p>
                          </div>

                          {/* Sanction Stamp & 360 link */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sanctioned by {req.approvedBy || 'HR Admin'}</span>
                            </span>
                            {emp && (
                              <button
                                onClick={() => setSelectedEmployeeFor360(emp)}
                                className="text-[11px] font-bold text-[#00A88B] hover:underline flex items-center gap-0.5"
                              >
                                <span>View 360</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- SECTION 3: REJECTED LEAVES --- */}
            {leaveApprovalTab === 'REJECTED' && (
              <div className="space-y-3">
                {rejectedLeaves.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-1 shadow-xs">
                    <p className="text-xs font-bold text-[#0A2540]">No Rejected Requests</p>
                    <p className="text-[11px] text-slate-400">
                      There are currently zero rejected leave applications in the audit archive.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {rejectedLeaves.map((req) => {
                      const emp = teamMembers.find(m => m.name === req.employeeName || m.empCode === req.employeeCode);
                      return (
                        <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-xs font-bold text-[#0A2540] block">{req.employeeName || 'Employee'}</strong>
                              <span className="text-[11px] text-slate-500">{req.leaveType} ({req.totalDays} Days)</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                              REJECTED
                            </span>
                          </div>

                          <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 text-xs text-rose-800">
                            <strong>Note:</strong> {req.approvedBy || 'Operational requirements & shift understaffing'}
                          </div>

                          {emp && (
                            <div className="text-right pt-0.5">
                              <button
                                onClick={() => setSelectedEmployeeFor360(emp)}
                                className="text-[11px] font-bold text-slate-600 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Inspect Employee 360</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: REPORTS & CSV EXPORTS --- */}
        {activeHrNav === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">HR Analytics &amp; Reports</h2>
                <p className="text-xs text-slate-500">Workforce roster &amp; biometric audits</p>
              </div>
              <button
                onClick={exportHrReportCSV}
                className="py-2 px-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Total Employees</span>
                <span className="font-mono-nums font-black text-lg text-[#0A2540]">{totalEmployees} Active</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Biometric Regularity</span>
                <span className="font-mono-nums font-black text-lg text-[#00A88B]">94.2%</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: MORE (ID Card Studio, Recruitment) --- */}
        {activeHrNav === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Identity Studio &amp; Lifecycle</h2>
              <p className="text-xs text-slate-500">Official document studio &amp; candidate management</p>
            </div>

            {/* ID Card Studio Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-[#0A2540]">Digital ID Card Studio</strong>
                <span className="text-[10px] text-[#00A88B] font-bold">Image 1 Template</span>
              </div>

              <p className="text-xs text-slate-600">
                Generate and print the official Trade Nexus vertical ID card with lanyard clip slot and employee details.
              </p>

              <button
                onClick={() => setIsIdCardModalOpen(true)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#00A88B] to-[#00C9A7] text-[#0A2540] font-black text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open Digital ID Card Studio</span>
              </button>
            </div>

            {/* Offer Letter Generator Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-[#0A2540]">Job Offer Letter Generator</strong>
                <span className="text-[10px] text-amber-600 font-bold">Image 4 Template</span>
              </div>

              <p className="text-xs text-slate-600">
                Draft, customize and dispatch the official Job Offer Letter before onboarding.
              </p>

              <button
                onClick={() => setIsGenerateOfferLetterModalOpen(true)}
                className="w-full py-2.5 rounded-2xl bg-white border-2 border-[#00C9A7] text-[#0A2540] font-bold text-xs hover:bg-teal-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4 text-[#00A88B]" />
                <span>Generate Official Offer Letter</span>
              </button>
            </div>

            {/* Reports & Analytics Export Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-[#0A2540]">Workforce Analytics &amp; Reports</strong>
                <span className="text-[10px] text-[#00A88B] font-bold">CSV Data</span>
              </div>

              <p className="text-xs text-slate-600">
                Download the complete real-time company workforce roster with attendance status and daily dials.
              </p>

              <button
                onClick={exportHrReportCSV}
                className="w-full py-2.5 rounded-2xl bg-[#0A2540] text-[#00C9A7] font-bold text-xs hover:bg-[#133353] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-[#00C9A7]" />
                <span>Export Workforce Report (CSV)</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Modern HR Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-3 py-2">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck, badge: lateCount > 0 ? lateCount : undefined },
            { id: 'employees', label: 'Team', icon: Users },
            { id: 'approvals', label: 'Leaves', icon: UserCheck, badge: pendingApprovalsCount },
            { id: 'more', label: 'More', icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeHrNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveHrNav(item.id as any)}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all relative ${
                  isActive ? 'text-[#00A88B]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span>{item.label}</span>
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- MODALS & DIALOGS --- */}
      
      {/* 1. Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
      />

      {/* 2. Generate Offer Letter Form Modal (Image 4 Template) */}
      <GenerateOfferLetterModal
        isOpen={isGenerateOfferLetterModalOpen}
        onClose={() => setIsGenerateOfferLetterModalOpen(false)}
      />

      {/* 3. Face Registration Modal */}
      <FaceRegistrationModal />

      {/* 6. Payslip Generator Modal */}
      {isPayslipGenModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A88B] flex items-center justify-center font-bold text-base">
                  ₹
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#0A2540]">Generate Monthly Payslips</h3>
                  <p className="text-xs text-slate-500">Calculate basic pay, HRA, incentives and PF deductions</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayslipGenModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePayslipsSubmit} className="space-y-4 text-xs">
              
              {/* Month & Year Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Month</label>
                  <select
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Year</label>
                  <input
                    type="text"
                    value={payrollYear}
                    onChange={(e) => setPayrollYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>
              </div>

              {/* Target Scope Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Generate For:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayslipSelectionMode('ALL');
                      setSelectedEmpIdsForPayroll(teamMembers.map(m => m.id));
                    }}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      payslipSelectionMode === 'ALL'
                        ? 'bg-teal-50 border-[#00C9A7] text-teal-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${payslipSelectionMode === 'ALL' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>All 10 Employees</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayslipSelectionMode('SPECIFIC')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      payslipSelectionMode === 'SPECIFIC'
                        ? 'bg-teal-50 border-[#00C9A7] text-teal-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${payslipSelectionMode === 'SPECIFIC' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>Select Specific</span>
                  </button>
                </div>
              </div>

              {/* Individual Employee Selection Checkbox List */}
              {payslipSelectionMode === 'SPECIFIC' && (
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Select Employees:</span>
                  {teamMembers.map(m => (
                    <label key={m.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmpIdsForPayroll.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmpIdsForPayroll(prev => [...prev, m.id]);
                          } else {
                            setSelectedEmpIdsForPayroll(prev => prev.filter(id => id !== m.id));
                          }
                        }}
                        className="rounded text-[#00C9A7] focus:ring-[#00C9A7]"
                      />
                      <span>{m.name} ({m.empCode} • {m.role})</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Live Salary Breakdown Preview */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#0A2540] border-b border-slate-200 pb-1.5">
                  <span>Selected Employees:</span>
                  <span className="font-mono">{payslipSelectionMode === 'ALL' ? totalEmployees : selectedEmpIdsForPayroll.length} Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>• Basic Salary: <strong className="text-slate-800">50% Gross</strong></div>
                  <div>• HRA Allowance: <strong className="text-slate-800">30% Gross</strong></div>
                  <div>• Special Allowance: <strong className="text-slate-800">20% Gross</strong></div>
                  <div>• PF Deduction: <strong className="text-rose-600">12% Basic</strong></div>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm text-[#00A88B]">
                  <span>Estimated Total Payout:</span>
                  <span className="font-mono font-black">₹3,84,000</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayslipGenModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00A88B] to-[#00C9A7] text-[#0A2540] font-black shadow-md hover:brightness-105"
                >
                  Publish &amp; Dispatch Payslips
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. Schedule Candidate Interview Modal */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#0A2540]">Schedule Candidate Interview</h3>
                  <p className="text-xs text-slate-500">Meeting will be dispatched to interviewers' dashboards &amp; alerts</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInterviewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Applied</label>
                  <input
                    type="text"
                    value={candRole}
                    onChange={(e) => setCandRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date &amp; Time</label>
                  <input
                    type="text"
                    value={candTime}
                    onChange={(e) => setCandTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>
              </div>

              {/* Team Squad Filter Dropdown */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Interview Squad / Department:</label>
                <select
                  value={interviewTeamScope}
                  onChange={(e) => setInterviewTeamScope(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:border-[#00C9A7]"
                >
                  <option value="ALL">All Teams &amp; Squads</option>
                  {teamGroups.map(g => (
                    <option key={g.id} value={g.name}>{g.name} (TL: {g.leaderName})</option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Interviewers / Employees */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Select Interviewers / Attendees:</label>
                  <button
                    type="button"
                    onClick={() => setSelectedInterviewers(teamMembers.map(m => m.name))}
                    className="text-[10px] font-bold text-[#00A88B] hover:underline"
                  >
                    Select All
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50 space-y-1.5 max-h-36 overflow-y-auto">
                  {teamMembers
                    .filter(m => interviewTeamScope === 'ALL' || m.group === interviewTeamScope)
                    .map(m => (
                      <label key={m.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedInterviewers.includes(m.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInterviewers(prev => [...prev, m.name]);
                            } else {
                              setSelectedInterviewers(prev => prev.filter(name => name !== m.name));
                            }
                          }}
                          className="rounded text-[#00C9A7] focus:ring-[#00C9A7]"
                        />
                        <span>{m.name} ({m.role} • {m.group || 'Sales'})</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md hover:brightness-105 flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule &amp; Dispatch Video Call</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
