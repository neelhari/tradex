import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { OnboardingEmployee, ExitEmployee } from '../types';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { OfferLetterModal } from '../components/modals/OfferLetterModal';
import { FaceRegistrationModal } from '../components/modals/FaceRegistrationModal';

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
    setIsFaceRegistrationModalOpen,
    setFaceRegistrationEmployee,
    scheduleInterview,
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
  
  // Modals
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isPayslipGenModalOpen, setIsPayslipGenModalOpen] = useState(false);
  const [selectedIdCardEmpId, setSelectedIdCardEmpId] = useState('');

  // Form states
  const [candName, setCandName] = useState('');
  const [candRole, setCandRole] = useState('Senior Telecaller Specialist');
  const [candExp, setCandExp] = useState('2+ Years in B2B Sales');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candTime, setCandTime] = useState('Tomorrow • 02:30 PM');
  const [candInterviewer, setCandInterviewer] = useState('Ramesh Sharma (Team Leader)');

  const idCardEmp = teamMembers.find((m) => m.id === selectedIdCardEmpId);
  useListDefault(selectedIdCardEmpId, setSelectedIdCardEmpId, teamMembers, (m) => m.id);

  const [payrollMonth, setPayrollMonth] = useState('May');
  const [payrollYear, setPayrollYear] = useState('2025');

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
    leaveRequests.filter((l) => l.status === 'PENDING').length +
    paymentVerifications.filter((p) => p.status === 'PENDING_HR_AUDIT').length;

  // Per-squad target attainment for the bar chart
  const teamAnalyticsData = teamGroups.map((grp, i) => ({
    team: `Team ${String.fromCharCode(65 + i)}`,
    percent: Math.min(100, Math.round((grp.achieved / Math.max(1, grp.monthlyTarget)) * 100)),
    label: grp.name,
  }));

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) return;
    scheduleInterview({
      candidateName: candName,
      roleApplied: candRole,
      experience: candExp,
      email: candEmail || `${candName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: candPhone || '+91 98450 11223',
      interviewTime: candTime,
      interviewer: candInterviewer,
    });
    setCandName('');
    setCandEmail('');
    setCandPhone('');
    setIsInterviewModalOpen(false);
  };

  const handleBulkPayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateBulkPayslips(payrollMonth, payrollYear);
    setIsPayslipGenModalOpen(false);
  };

  const exportHrReportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Group,Status,Check-in,Dials,Sales Achieved\n"
      + teamMembers.map(e => `"${e.name}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || 'N/A'}",${e.dialsToday},${e.salesAchieved}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HR_Org_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Exported HR Organization Audit Report (CSV)');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between max-w-lg mx-auto font-sans pb-28 selection:bg-[#00C9A7]/20">
      
      {/* Main Content Viewport */}
      <main className="flex-1 p-3.5 sm:p-4 space-y-4 pt-2">
        
        {/* --- TAB 1: HOME (Exact 1-to-1 Match with Image 1 Mockup) --- */}
        {activeHrNav === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* Greeting Header matching Mockup: Hello, Priya 👋 / HR / Admin */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
                    Hello, Priya
                  </h2>
                  <span className="text-xl">👋</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  HR / Admin • <span className="text-[#00A88B] font-bold">People Operations</span>
                </p>
              </div>

              {/* Avatar Badge */}
              <div className="w-10 h-10 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-xs shadow-sm">
                PV
              </div>
            </div>

            {/* 3 Top Stat Cards (3 Columns: Teams 8, Employees 96, On Leave 7) */}
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

            {/* Overview Section (This Month - 3 Columns: Attendance 92%, Target 78%, Pending Approvals 14) */}
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
                
                {/* Attendance */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Attendance</span>
                  <span className="font-display font-black text-xl text-[#00A88B]">
                    {attendancePercent}%
                  </span>
                </div>

                {/* Target Achievement */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Target Achieved</span>
                  <span className="font-display font-black text-xl text-amber-500">
                    {targetAchievedPercent}%
                  </span>
                </div>

                {/* Pending Approvals */}
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

            {/* HR Analytics Section: Attendance % Bar Chart (Matching Image 1) */}
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
                  Attendance %
                </span>

                {/* Vertical Bar Chart Container */}
                <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 relative">
                  
                  {/* Background grid lines */}
                  <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 text-[9px] text-slate-300">100%</div>
                  <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 text-[9px] text-slate-300">80%</div>
                  <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100 text-[9px] text-slate-300">60%</div>
                  <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100 text-[9px] text-slate-300">40%</div>

                  {teamAnalyticsData.map((item) => (
                    <div key={item.team} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative z-10 group cursor-pointer">
                      {/* Tooltip on hover */}
                      <span className="text-[10px] font-mono font-bold text-[#00A88B] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.percent}%
                      </span>
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#00A88B] to-[#00C9A7] rounded-t-xl group-hover:brightness-110 transition-all shadow-xs"
                        style={{ height: `${item.percent}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Team Labels X-Axis */}
                <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500">
                  {teamAnalyticsData.map(item => (
                    <span key={item.team} className="flex-1 text-center truncate">{item.team}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-[#0A2540]">
                Quick Operations
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Action 0: Onboard New Employee (Client Priority) */}
                <button
                  onClick={() => setIsAddEmployeeModalOpen(true)}
                  className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-2 border-[#00C9A7]/60 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-sm flex items-center gap-3 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00C9A7] text-slate-950 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-[#0A2540] block">Onboard Employee</strong>
                    <span className="text-[10px] text-teal-800 font-medium">Create profile & credentials</span>
                  </div>
                </button>

                {/* Action 1: Generate Payslips */}
                <button
                  onClick={() => setIsPayslipGenModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center font-bold flex-shrink-0">
                    ₹
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Generate Payslips</strong>
                    <span className="text-[10px] text-slate-400">1-click bulk monthly salary</span>
                  </div>
                </button>

                {/* Action 2: View Offer Letters */}
                <button
                  onClick={() => {
                    if (offerLetters.length > 0) {
                      setSelectedOfferLetter(offerLetters[0]);
                      setIsOfferLetterModalOpen(true);
                    } else {
                      setIsAddEmployeeModalOpen(true);
                    }
                  }}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Offer Letters ({offerLetters.length})</strong>
                    <span className="text-[10px] text-slate-400">Print & PDF contracts</span>
                  </div>
                </button>

                {/* Action 3: Schedule Interview */}
                <button
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-3.5 shadow-xs flex items-center gap-3 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0A2540] block">Schedule Interview</strong>
                    <span className="text-[10px] text-slate-400">Candidate hiring pipeline</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Recent Generated Offer Letters List */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Official Offer Letters ({offerLetters.length})
                </h3>
                <button
                  onClick={() => setIsAddEmployeeModalOpen(true)}
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
                    className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs flex items-center justify-between text-xs cursor-pointer transition-all active:scale-98"
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

        {/* --- TAB 2: EMPLOYEES & TEAM LEADERS --- */}
        {activeHrNav === 'employees' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Employee Directory ({totalEmployees})</h2>
              <p className="text-xs text-slate-500">Supervision across all {totalTeams} squads &amp; Team Leaders</p>
            </div>

            <div className="space-y-2.5">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-xs">
                      {member.avatar}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#0A2540] block">{member.name}</strong>
                      <span className="text-[11px] text-slate-500 font-medium">{member.role} • {member.group}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    member.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {member.attendanceStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: APPROVALS & LEAVES --- */}
        {activeHrNav === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">HR Sanction &amp; Approvals ({pendingApprovalsCount})</h2>
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
                <p className="text-xs text-slate-500">Biometric audits &amp; payroll reports</p>
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
                <span className="text-[10px] text-slate-500 block font-semibold">Monthly Headcount Growth</span>
                <span className="font-mono-nums font-black text-lg text-[#0A2540]">+{onboardingList.length} Joiners</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Biometric Regularity</span>
                <span className="font-mono-nums font-black text-lg text-[#00A88B]">94.2%</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: MORE (ID Cards, Onboarding, Recruitment) --- */}
        {activeHrNav === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">ID Cards, Onboarding &amp; Hiring</h2>
              <p className="text-xs text-slate-500">Employee lifecycle &amp; identity issuance</p>
            </div>

            {/* ID Card preview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-[#0A2540]">Digital ID Card Studio</strong>
                <span className="text-[10px] text-[#00A88B] font-bold">Print Ready</span>
              </div>

              <select
                value={selectedIdCardEmpId}
                onChange={(e) => setSelectedIdCardEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.empCode}</option>
                ))}
              </select>

              {idCardEmp ? (
                <div className="w-full max-w-xs mx-auto bg-gradient-to-b from-[#0A2540] via-[#0F3258] to-[#0A2540] text-white rounded-2xl p-4 space-y-3 text-center shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-[#00C9A7] text-[#0A2540] font-black text-lg mx-auto flex items-center justify-center">
                    {idCardEmp.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{idCardEmp.name}</h4>
                    <span className="text-[11px] text-[#00C9A7] font-semibold block">{idCardEmp.role} • {idCardEmp.empCode}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-slate-300">
                    <span>{idCardEmp.group}</span>
                    <strong className="text-white">{idCardEmp.phone}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-4">
                  No employees loaded yet.
                </p>
              )}

              <button
                onClick={() => triggerToast('✓ ID Card Exported as Print-Ready PDF')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A2540] font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Export Print-Ready PDF ID Card</span>
              </button>
            </div>

            {/* Onboarding Checklist with Face Enrollment Action */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <strong className="text-xs font-bold text-[#0A2540] block">New Joiner Onboarding & Biometrics</strong>
                <button
                  onClick={() => setIsAddEmployeeModalOpen(true)}
                  className="text-[11px] font-bold text-[#00A88B] hover:underline"
                >
                  + Add Employee
                </button>
              </div>

              {onboardingList.map(emp => (
                <div key={emp.id} className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 font-bold block">{emp.name}</strong>
                      <span className="text-[10px] text-slate-500">{emp.role} • {emp.department}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      emp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                    <div 
                      onClick={() => toggleOnboardingChecklist(emp.id, 'documentsVerified')}
                      className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900"
                    >
                      <Check className={`w-3.5 h-3.5 ${emp.checklist.documentsVerified ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                      <span>KYC Verified</span>
                    </div>

                    <div 
                      onClick={() => toggleOnboardingChecklist(emp.id, 'workstationAllocated')}
                      className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900"
                    >
                      <Check className={`w-3.5 h-3.5 ${emp.checklist.workstationAllocated ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                      <span>CRM Access</span>
                    </div>
                  </div>

                  {/* Face Biometric Enrollment Trigger Button */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <ScanFace className="w-3.5 h-3.5 text-teal-600" />
                      Face Biometric Status:
                    </span>

                    {emp.checklist.biometricEnrolled ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setFaceRegistrationEmployee({ id: emp.id, name: emp.name });
                          setIsFaceRegistrationModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                      >
                        <ScanFace className="w-3 h-3" /> Enroll Face
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 5 Bottom Navigation Tabs (Matching Image 1 Mockup) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 max-w-lg mx-auto px-2 py-1.5 flex justify-around items-center shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingApprovalsCount },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'more', label: 'More', icon: MoreHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeHrNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveHrNav(item.id as any)}
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

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
      />

      {/* Offer Letter Document Viewer & Printer Modal */}
      <OfferLetterModal />

      {/* Face Biometric Registration Modal */}
      <FaceRegistrationModal />

      {/* Bulk Payslip Generation Modal */}
      {isPayslipGenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Generate Monthly Payslips</h3>
            <p className="text-xs text-slate-500">
              Calculate basic pay, HRA, incentives, and PF deductions for all {totalEmployees} employees:
            </p>
            <form onSubmit={handleBulkPayrollSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Month</label>
                  <select
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    {['May', 'June', 'July', 'August'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Year</label>
                  <input
                    type="text"
                    value={payrollYear}
                    onChange={(e) => setPayrollYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between font-bold text-[#0A2540]">
                  <span>Total Employees:</span>
                  <span>{totalEmployees} Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Total Payout:</span>
                  <span>₹38,40,000</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-black"
                >
                  Publish Payslips
                </button>
                <button
                  type="button"
                  onClick={() => setIsPayslipGenModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Schedule Candidate Interview</h3>
            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00C9A7]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Role Applied</label>
                <input
                  type="text"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Date &amp; Time</label>
                <input
                  type="text"
                  value={candTime}
                  onChange={(e) => setCandTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-black"
                >
                  Confirm Interview
                </button>
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

