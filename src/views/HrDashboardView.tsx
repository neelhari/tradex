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
  Clock
} from 'lucide-react';
import { OnboardingEmployee, ExitEmployee, TeamMember } from '../types';
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

  const [activeHrNav, setActiveHrNav] = useState<'home' | 'employees' | 'approvals' | 'reports' | 'more'>('home');
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
  const attendancePercent = Math.round((presentCount / Math.max(1, totalEmployees)) * 100);

  const totalSalesTarget = teamMembers.reduce((sum, m) => sum + m.salesTarget, 0);
  const totalSalesAchieved = teamMembers.reduce((sum, m) => sum + m.salesAchieved, 0);
  const targetAchievedPercent = Math.round((totalSalesAchieved / Math.max(1, totalSalesTarget)) * 100);

  const pendingApprovalsCount =
    leaveRequests.filter((r) => r.status === 'PENDING').length +
    paymentVerifications.filter((p) => p.status === 'PENDING_HR_AUDIT').length;

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

            {/* Overview Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  Overview
                </h3>
                <span className="text-[11px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2.5 py-0.5 rounded-full">
                  This Month
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Attendance</span>
                  <span className="font-display font-black text-xl text-[#00A88B]">
                    {attendancePercent}%
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Target Achieved</span>
                  <span className="font-display font-black text-xl text-amber-500">
                    {targetAchievedPercent}%
                  </span>
                </div>

                <div 
                  onClick={() => setActiveHrNav('approvals')}
                  className="bg-white border border-slate-200 hover:border-rose-400 rounded-2xl p-3 shadow-xs text-center space-y-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Pending Approvals</span>
                  <span className="font-display font-black text-xl text-rose-600">
                    {pendingApprovalsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* HR Analytics Section: Attendance Bar Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  HR Analytics
                </h3>
                <button 
                  onClick={() => setActiveHrNav('reports')}
                  className="text-[11px] font-bold text-[#00A88B] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                <span className="text-xs font-bold text-[#0A2540] block">
                  Attendance % Across Squads
                </span>

                <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 relative">
                  {teamAnalyticsData.map((item) => (
                    <div key={item.team} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative z-10 group cursor-pointer">
                      <span className="text-[10px] font-mono font-bold text-[#00A88B]">
                        {item.percent}%
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#00A88B] to-[#00C9A7] rounded-t-xl group-hover:brightness-110 transition-all shadow-xs"
                        style={{ height: `${item.percent}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between px-1 text-[10px] font-bold text-slate-500">
                  {teamAnalyticsData.map(item => (
                    <span key={item.team} className="flex-1 text-center truncate">{item.team}</span>
                  ))}
                </div>
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

        {/* --- TAB 2: TEAM ROSTER (Exact Screenshot 2 Pixel-Perfect Implementation) --- */}
        {activeHrNav === 'employees' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            
            {/* Header with Title and Filter Pills */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">Team Roster ({teamMembers.length})</h2>
                <p className="text-xs text-slate-500">Tap any telecaller to view performance profile</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['ALL', 'PRESENT', 'LATE', 'ON_LEAVE'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAttendanceFilter(f)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      attendanceFilter === f ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'ON_LEAVE' ? 'Leave' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search telecaller by name or employee code..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
              />
            </div>

            {/* List of Telecallers - Exact Screenshot 2 Layout */}
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const isPresent = member.attendanceStatus === 'PRESENT';
                const isLate = member.attendanceStatus === 'LATE';

                return (
                  <div 
                    key={member.id}
                    onClick={() => setSelectedEmployeeFor360(member)}
                    className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-2xs hover:shadow-md flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all group relative overflow-hidden"
                  >
                    {/* Subtle Top Status Accent Line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      isPresent ? 'bg-gradient-to-r from-emerald-400 to-[#00C9A7]' :
                      isLate ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      'bg-gradient-to-r from-rose-400 to-rose-500'
                    }`} />

                    {/* Member Header */}
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                              {member.name}
                            </strong>
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-200/80">
                              {member.group}
                            </span>
                          </div>
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

                    {/* 3 Metric Matrix - Clean Elevated Micro-Cards */}
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

                    {/* Footer: Check-in Time + Clean Interactive Pill Button */}
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
        )}

        {/* --- TAB 3: APPROVALS & LEAVES --- */}
        {activeHrNav === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">HR Sanctions &amp; Approvals ({pendingApprovalsCount})</h2>
              <p className="text-xs text-slate-500">Leave applications and payment verification queue</p>
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
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{req.reason}"
                  </p>

                  {req.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => approveLeaveRequest(req.id)}
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Sanction Leave
                      </button>
                      <button
                        onClick={() => rejectLeaveRequest(req.id, 'Shift understaffing')}
                        className="py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

          </div>
        )}

      </div>

      {/* Modern HR Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-3 py-2">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'employees', label: 'Team', icon: Users },
            { id: 'approvals', label: 'Leaves', icon: UserCheck, badge: pendingApprovalsCount },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
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

      {/* 3. Official Offer Letter Preview Modal */}
      <OfferLetterModal />

      {/* 4. Digital ID Card Modal (Image 1 Template with Photo Upload) */}
      <DigitalIdCardModal />

      {/* 5. Face Registration Modal */}
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
