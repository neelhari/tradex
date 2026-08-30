import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  UserRole, 
  AuthStep,
  NavTab, 
  EmployeeProfile, 
  TelecallerStats, 
  CallLogItem, 
  ClientLead, 
  AttendanceRecord, 
  LeaveRequest, 
  PayslipItem,
  CallOutcome,
  TeamMember,
  TeamGroup,
  TeamTask,
  TeamMeeting,
  CandidateInterview,
  OnboardingEmployee,
  ExitEmployee,
  PaymentVerificationItem,
  AssignedLead,
  LeadBatch,
  FaceBiometricProfile,
  OfferLetterData,
  NewEmployeeInput
} from '../types';
import { 
  INITIAL_PROFILE, 
  INITIAL_TELECALLER_STATS, 
  INITIAL_CALL_LOGS, 
  INITIAL_CLIENT_LEADS, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYSLIPS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_TEAM_GROUPS,
  INITIAL_TEAM_TASKS,
  INITIAL_TEAM_MEETINGS,
  INITIAL_CANDIDATES,
  INITIAL_ONBOARDING,
  INITIAL_EXIT_LIST,
  INITIAL_PAYMENTS,
  INITIAL_ASSIGNED_LEADS,
  INITIAL_LEAD_BATCHES,
  INITIAL_FACE_PROFILES,
  INITIAL_OFFER_LETTERS
} from '../data/mockData';
import { api } from '../services/api';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  deviceMode: 'mobile' | 'desktop';
  setDeviceMode: (mode: 'mobile' | 'desktop') => void;
  
  profile: EmployeeProfile;
  stats: TelecallerStats;
  callLogs: CallLogItem[];
  clients: ClientLead[];
  attendanceLogs: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payslips: PayslipItem[];
  
  // Dynamic Lead Management
  assignedLeads: AssignedLead[];
  leadBatches: LeadBatch[];
  importAndAssignLeads: (
    fileName: string, 
    targetEmployeeId: string, 
    targetEmployeeName: string, 
    leads: Array<{ name: string; phone: string; company: string; email?: string; city?: string }>
  ) => void;
  updateAssignedLeadStatus: (
    leadId: string, 
    status: AssignedLead['status'], 
    notes: string, 
    dealValue?: number, 
    followUpDate?: string
  ) => void;

  // Face Recognition Biometric System
  faceProfiles: FaceBiometricProfile[];
  registerFaceBiometric: (employeeId: string, employeeName: string, photoDataUrl: string) => void;
  verifyFaceAttendance: (employeeId?: string) => boolean;

  // Employee Management & Documents
  offerLetters: OfferLetterData[];
  selectedOfferLetter: OfferLetterData | null;
  setSelectedOfferLetter: (letter: OfferLetterData | null) => void;
  isOfferLetterModalOpen: boolean;
  setIsOfferLetterModalOpen: (open: boolean) => void;
  createNewEmployee: (data: NewEmployeeInput) => void;
  generateOfferLetter: (data: Omit<OfferLetterData, 'id' | 'issuedDate'>) => void;

  // Team Leader Module State
  teamMembers: TeamMember[];
  teamGroups: TeamGroup[];
  teamTasks: TeamTask[];
  teamMeetings: TeamMeeting[];
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;
  reassignLead: (leadId: string, newAssigneeName: string) => void;
  createTeamGroup: (data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string }) => void;
  assignTeamLeaderToGroup: (groupId: string, leaderName: string) => void;
  createTeamTask: (data: { title: string; assignedTo: string; group?: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'NORMAL' }) => void;
  toggleTaskStatus: (taskId: string) => void;
  scheduleTeamMeeting: (data: { title: string; dateTime: string; type: TeamMeeting['type']; location: string; agenda: string }) => void;
  
  // HR Module State
  candidates: CandidateInterview[];
  onboardingList: OnboardingEmployee[];
  exitList: ExitEmployee[];
  paymentVerifications: PaymentVerificationItem[];
  scheduleInterview: (data: { candidateName: string; roleApplied: string; experience: string; email: string; phone: string; interviewTime: string; interviewer: string }) => void;
  updateCandidateStatus: (candidateId: string, status: CandidateInterview['status'], notes?: string) => void;
  toggleOnboardingChecklist: (employeeId: string, itemKey: keyof OnboardingEmployee['checklist']) => void;
  toggleExitChecklist: (employeeId: string, itemKey: keyof ExitEmployee['checklist']) => void;
  verifyPayment: (paymentId: string, status: 'VERIFIED' | 'REJECTED') => void;
  generateBulkPayslips: (month: string, year: string) => void;
  
  // Authentication Flow
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  logout: () => void;
  
  // Modals & Drawers
  isFaceIdModalOpen: boolean;
  setIsFaceIdModalOpen: (open: boolean) => void;
  isFaceRegistrationModalOpen: boolean;
  setIsFaceRegistrationModalOpen: (open: boolean) => void;
  faceRegistrationEmployee: { id: string; name: string } | null;
  setFaceRegistrationEmployee: (emp: { id: string; name: string } | null) => void;
  isExcelUploadModalOpen: boolean;
  setIsExcelUploadModalOpen: (open: boolean) => void;
  isQuickCallModalOpen: boolean;
  setIsQuickCallModalOpen: (open: boolean) => void;
  isLeaveModalOpen: boolean;
  setIsLeaveModalOpen: (open: boolean) => void;
  isIdCardModalOpen: boolean;
  setIsIdCardModalOpen: (open: boolean) => void;
  selectedPayslip: PayslipItem | null;
  setSelectedPayslip: (payslip: PayslipItem | null) => void;
  
  // Quick Actions & Simulation
  activeToast: string | null;
  triggerToast: (msg: string) => void;
  logNewCall: (data: {
    clientName: string;
    companyName: string;
    phoneNumber: string;
    outcome: CallOutcome;
    durationSec: number;
    notes: string;
    followUpDate?: string;
  }) => void;
  submitLeaveRequest: (data: {
    leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned / Paid Leave';
    fromDate: string;
    toDate: string;
    totalDays: number;
    reason: string;
  }) => void;
  simulateFaceIdCheckIn: () => void;
  simulateFaceIdCheckOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('tnx_currentRole') as UserRole) || 'telecaller';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [authStep, setAuthStep] = useState<AuthStep>('LOGIN');

  const [profile, setProfile] = useState<EmployeeProfile>(() => {
    const saved = localStorage.getItem('tnx_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  const [stats, setStats] = useState<TelecallerStats>(() => {
    const saved = localStorage.getItem('tnx_stats');
    return saved ? JSON.parse(saved) : INITIAL_TELECALLER_STATS;
  });
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(() => {
    const saved = localStorage.getItem('tnx_callLogs');
    return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
  });
  const [clients, setClients] = useState<ClientLead[]>(() => {
    const saved = localStorage.getItem('tnx_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_LEADS;
  });
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('tnx_attendanceLogs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('tnx_leaveRequests');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });
  const [payslips, setPayslips] = useState<PayslipItem[]>(() => {
    const saved = localStorage.getItem('tnx_payslips');
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  // Dynamic Lead Management State
  const [assignedLeads, setAssignedLeads] = useState<AssignedLead[]>(() => {
    const saved = localStorage.getItem('tnx_assignedLeads');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNED_LEADS;
  });
  const [leadBatches, setLeadBatches] = useState<LeadBatch[]>(() => {
    const saved = localStorage.getItem('tnx_leadBatches');
    return saved ? JSON.parse(saved) : INITIAL_LEAD_BATCHES;
  });

  // Face Biometric State
  const [faceProfiles, setFaceProfiles] = useState<FaceBiometricProfile[]>(() => {
    const saved = localStorage.getItem('tnx_faceProfiles');
    return saved ? JSON.parse(saved) : INITIAL_FACE_PROFILES;
  });

  // Offer Letters State
  const [offerLetters, setOfferLetters] = useState<OfferLetterData[]>(() => {
    const saved = localStorage.getItem('tnx_offerLetters');
    return saved ? JSON.parse(saved) : INITIAL_OFFER_LETTERS;
  });
  const [selectedOfferLetter, setSelectedOfferLetter] = useState<OfferLetterData | null>(null);
  const [isOfferLetterModalOpen, setIsOfferLetterModalOpen] = useState(false);

  // Team Leader Module State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('tnx_teamMembers');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(() => {
    const saved = localStorage.getItem('tnx_teamGroups');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_GROUPS;
  });
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>(() => {
    const saved = localStorage.getItem('tnx_teamTasks');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_TASKS;
  });
  const [teamMeetings, setTeamMeetings] = useState<TeamMeeting[]>(() => {
    const saved = localStorage.getItem('tnx_teamMeetings');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEETINGS;
  });

  // HR Module State
  const [candidates, setCandidates] = useState<CandidateInterview[]>(() => {
    const saved = localStorage.getItem('tnx_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });
  const [onboardingList, setOnboardingList] = useState<OnboardingEmployee[]>(() => {
    const saved = localStorage.getItem('tnx_onboardingList');
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDING;
  });
  const [exitList, setExitList] = useState<ExitEmployee[]>(() => {
    const saved = localStorage.getItem('tnx_exitList');
    return saved ? JSON.parse(saved) : INITIAL_EXIT_LIST;
  });
  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerificationItem[]>(() => {
    const saved = localStorage.getItem('tnx_paymentVerifications');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Modals & UI State
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [isFaceRegistrationModalOpen, setIsFaceRegistrationModalOpen] = useState(false);
  const [faceRegistrationEmployee, setFaceRegistrationEmployee] = useState<{ id: string; name: string } | null>(null);
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Sync to backend SQLite on mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const [
          profRes, statsRes, callsRes, clientsRes, attRes, leavesRes,
          paysRes, tmRes, grpRes, tasksRes, mtgRes, candsRes,
          onbRes, exitRes, asgRes, batchesRes, faceRes, offRes, payRes
        ] = await Promise.allSettled([
          api.getProfile(),
          api.getStats(),
          api.getCallLogs(),
          api.getClients(),
          api.getAttendance(),
          api.getLeaves(),
          api.getPayslips(),
          api.getTeamMembers(),
          api.getTeamGroups(),
          api.getTeamTasks(),
          api.getTeamMeetings(),
          api.getInterviews(),
          api.getOnboarding(),
          api.getExitEmployees(),
          api.getAssignedLeads(),
          api.getLeadBatches(),
          api.getBiometrics(),
          api.getOfferLetters(),
          api.getPayments(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value) setProfile(profRes.value);
        if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value);
        if (callsRes.status === 'fulfilled' && callsRes.value) setCallLogs(callsRes.value);
        if (clientsRes.status === 'fulfilled' && clientsRes.value) setClients(clientsRes.value);
        if (attRes.status === 'fulfilled' && attRes.value) setAttendanceLogs(attRes.value);
        if (leavesRes.status === 'fulfilled' && leavesRes.value) setLeaveRequests(leavesRes.value);
        if (paysRes.status === 'fulfilled' && paysRes.value) setPayslips(paysRes.value);
        if (tmRes.status === 'fulfilled' && tmRes.value) setTeamMembers(tmRes.value);
        if (grpRes.status === 'fulfilled' && grpRes.value) setTeamGroups(grpRes.value);
        if (tasksRes.status === 'fulfilled' && tasksRes.value) setTeamTasks(tasksRes.value);
        if (mtgRes.status === 'fulfilled' && mtgRes.value) setTeamMeetings(mtgRes.value);
        if (candsRes.status === 'fulfilled' && candsRes.value) setCandidates(candsRes.value);
        if (onbRes.status === 'fulfilled' && onbRes.value) setOnboardingList(onbRes.value);
        if (exitRes.status === 'fulfilled' && exitRes.value) setExitList(exitRes.value);
        if (asgRes.status === 'fulfilled' && asgRes.value) setAssignedLeads(asgRes.value);
        if (batchesRes.status === 'fulfilled' && batchesRes.value) setLeadBatches(batchesRes.value);
        if (faceRes.status === 'fulfilled' && faceRes.value) setFaceProfiles(faceRes.value);
        if (offRes.status === 'fulfilled' && offRes.value) setOfferLetters(offRes.value);
        if (payRes.status === 'fulfilled' && payRes.value) setPaymentVerifications(payRes.value);
      } catch (err) {
        console.warn('Could not connect to SQLite backend initially, using cached/mock state:', err);
      }
    };

    loadFromDatabase();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tnx_currentRole', currentRole);
      localStorage.setItem('tnx_profile', JSON.stringify(profile));
      localStorage.setItem('tnx_stats', JSON.stringify(stats));
      localStorage.setItem('tnx_callLogs', JSON.stringify(callLogs));
      localStorage.setItem('tnx_clients', JSON.stringify(clients));
      localStorage.setItem('tnx_attendanceLogs', JSON.stringify(attendanceLogs));
      localStorage.setItem('tnx_leaveRequests', JSON.stringify(leaveRequests));
      localStorage.setItem('tnx_payslips', JSON.stringify(payslips));
      localStorage.setItem('tnx_assignedLeads', JSON.stringify(assignedLeads));
      localStorage.setItem('tnx_leadBatches', JSON.stringify(leadBatches));
      localStorage.setItem('tnx_faceProfiles', JSON.stringify(faceProfiles));
      localStorage.setItem('tnx_offerLetters', JSON.stringify(offerLetters));
      localStorage.setItem('tnx_teamMembers', JSON.stringify(teamMembers));
      localStorage.setItem('tnx_teamGroups', JSON.stringify(teamGroups));
      localStorage.setItem('tnx_teamTasks', JSON.stringify(teamTasks));
      localStorage.setItem('tnx_teamMeetings', JSON.stringify(teamMeetings));
      localStorage.setItem('tnx_candidates', JSON.stringify(candidates));
      localStorage.setItem('tnx_onboardingList', JSON.stringify(onboardingList));
      localStorage.setItem('tnx_exitList', JSON.stringify(exitList));
      localStorage.setItem('tnx_paymentVerifications', JSON.stringify(paymentVerifications));
    } catch {
      // Ignore quota storage errors in preview
    }
  }, [
    currentRole, profile, stats, callLogs, clients, attendanceLogs, leaveRequests, 
    payslips, assignedLeads, leadBatches, faceProfiles, offerLetters, teamMembers, 
    teamGroups, teamTasks, teamMeetings, candidates, onboardingList, exitList, paymentVerifications
  ]);

  const logout = () => {
    setAuthStep('LOGIN');
    triggerToast('Logged out. Please login to continue.');
  };

  const triggerToast = useCallback((msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Lead Import & Allocation
  const importAndAssignLeads = async (
    fileName: string, 
    targetEmployeeId: string, 
    targetEmployeeName: string, 
    leads: Array<{ name: string; phone: string; company: string; email?: string; city?: string }>
  ) => {
    const batchId = `batch-${Date.now()}`;
    const newBatch: LeadBatch = {
      id: batchId,
      fileName,
      uploadedAt: 'Just now',
      totalLeads: leads.length,
      assignedToEmployeeId: targetEmployeeId,
      assignedToEmployeeName: targetEmployeeName,
    };

    const newAssignedItems: AssignedLead[] = leads.map((lead, idx) => ({
      id: `asg-${Date.now()}-${idx}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      company: lead.company || 'Private Enterprise',
      city: lead.city || 'Pan-India',
      assignedToEmployeeId: targetEmployeeId,
      assignedToEmployeeName: targetEmployeeName,
      batchId,
      assignedDate: 'Today',
      status: 'PENDING',
      notes: `Imported via ${fileName}`,
      callCount: 0,
    }));

    setLeadBatches(prev => [newBatch, ...prev]);
    setAssignedLeads(prev => [...newAssignedItems, ...prev]);
    triggerToast(`✓ Successfully allocated ${leads.length} leads to ${targetEmployeeName}!`);

    try {
      await api.bulkImportAssignedLeads(fileName, targetEmployeeId, targetEmployeeName, leads);
    } catch (err) {
      console.warn('API bulk import error:', err);
    }
  };

  const updateAssignedLeadStatus = async (
    leadId: string, 
    status: AssignedLead['status'], 
    notes: string, 
    dealValue?: number, 
    followUpDate?: string
  ) => {
    let targetLead: AssignedLead | undefined;

    setAssignedLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        targetLead = {
          ...lead,
          status,
          notes: notes || lead.notes,
          callCount: lead.callCount + 1,
          lastCallTimestamp: 'Just now',
          dealValue: dealValue !== undefined ? dealValue : lead.dealValue,
          followUpDate: followUpDate || lead.followUpDate,
        };
        return targetLead;
      }
      return lead;
    }));

    if (targetLead) {
      // Also log as call item
      const newCallItem: CallLogItem = {
        id: `call-${Date.now()}`,
        clientName: targetLead.name,
        companyName: targetLead.company,
        phoneNumber: targetLead.phone,
        durationSec: 180,
        outcome: status === 'CONVERTED' ? 'DEAL_CLOSED' : 
                 status === 'INTERESTED' ? 'INTERESTED' : 
                 status === 'CALLBACK' ? 'CALLBACK' : 
                 status === 'NOT_INTERESTED' ? 'NOT_INTERESTED' : 'CONNECTED',
        notes: notes || `Call outcome updated to ${status}`,
        timestamp: 'Just now',
        followUpDate,
      };

      setCallLogs(prev => [newCallItem, ...prev]);

      // Update Telecaller Stats
      const updatedStats: TelecallerStats = {
        ...stats,
        dialsMade: stats.dialsMade + 1,
        connected: status !== 'NOT_INTERESTED' ? stats.connected + 1 : stats.connected,
        interested: (status === 'INTERESTED' || status === 'CONVERTED') ? stats.interested + 1 : stats.interested,
        rejected: status === 'NOT_INTERESTED' ? stats.rejected + 1 : stats.rejected,
        monthlySalesAchieved: dealValue ? stats.monthlySalesAchieved + dealValue : stats.monthlySalesAchieved,
      };
      setStats(updatedStats);

      // Update Team Member record for TL and HR live visibility
      setTeamMembers(prev => prev.map(m => {
        if (m.name.toLowerCase() === targetLead?.assignedToEmployeeName.toLowerCase() || m.id === targetLead?.assignedToEmployeeId) {
          const newDials = m.dialsToday + 1;
          const newConnected = status !== 'NOT_INTERESTED' ? m.connected + 1 : m.connected;
          const newInterested = (status === 'INTERESTED' || status === 'CONVERTED') ? m.interested + 1 : m.interested;
          const newSales = dealValue ? m.salesAchieved + dealValue : m.salesAchieved;
          const updatedM: TeamMember = {
            ...m,
            dialsToday: newDials,
            connected: newConnected,
            interested: newInterested,
            salesAchieved: newSales,
            conversionRate: Math.min(100, Math.round((newInterested / Math.max(1, newDials)) * 100)),
          };
          api.updateTeamMember(m.id, updatedM).catch(console.warn);
          return updatedM;
        }
        return m;
      }));

      // If converted with deal value, record in payment verification list for HR
      if (status === 'CONVERTED' && dealValue && dealValue > 0) {
        const newPayment: PaymentVerificationItem = {
          id: `pay-${Date.now()}`,
          leadName: targetLead.name,
          companyName: targetLead.company,
          telecallerName: targetLead.assignedToEmployeeName,
          dealAmount: dealValue,
          utrNumber: `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          paymentMode: 'Online Bank Transfer',
          timestamp: 'Just now',
          status: 'PENDING_HR_AUDIT',
        };
        setPaymentVerifications(prev => [newPayment, ...prev]);
        api.createPayment(newPayment).catch(console.warn);
      }

      // SQLite API calls
      try {
        api.updateAssignedLead(leadId, targetLead).catch(console.warn);
        api.createCallLog(newCallItem).catch(console.warn);
        api.updateStats(updatedStats).catch(console.warn);
      } catch (err) {
        console.warn('API sync error:', err);
      }
    }

    triggerToast(`✓ Status updated: ${status.replace('_', ' ')} for ${targetLead?.name || 'Lead'}`);
  };

  // Face Biometric Registration
  const registerFaceBiometric = async (employeeId: string, employeeName: string, photoDataUrl: string) => {
    const profileItem: FaceBiometricProfile = {
      employeeId,
      employeeName,
      registeredPhoto: photoDataUrl,
      registeredAt: 'Just now',
      status: 'REGISTERED',
    };

    setFaceProfiles(prev => {
      const existing = prev.filter(p => p.employeeId !== employeeId);
      return [profileItem, ...existing];
    });

    // Mark Onboarding checklist item
    setOnboardingList(prev => prev.map(onb => {
      if (onb.id === employeeId || onb.name.toLowerCase() === employeeName.toLowerCase()) {
        const updated = {
          ...onb,
          checklist: { ...onb.checklist, biometricEnrolled: true },
        };
        api.updateOnboarding(onb.id, updated).catch(console.warn);
        return updated;
      }
      return onb;
    }));

    triggerToast(`✓ Face Biometric Enrolled successfully for ${employeeName}!`);

    try {
      await api.registerBiometric(profileItem);
    } catch (err) {
      console.warn('API biometric register error:', err);
    }
  };

  const verifyFaceAttendance = (employeeId?: string): boolean => {
    const targetId = employeeId || profile.id;
    const enrolled = faceProfiles.find(p => p.employeeId === targetId || p.employeeName.toLowerCase() === profile.name.toLowerCase());
    
    // Check-in
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    const updatedProfile: EmployeeProfile = {
      ...profile,
      faceIdStatus: 'VERIFIED_PRESENT',
      checkInTime: timeStr,
    };
    setProfile(updatedProfile);

    const newAttendanceItem: AttendanceRecord = {
      date: today,
      dayNumber: now.getDate(),
      status: 'PRESENT',
      checkIn: timeStr,
      workHours: 'In Progress',
      method: 'Face ID Biometric',
    };

    setAttendanceLogs(prev => [
      newAttendanceItem,
      ...prev.filter(item => item.dayNumber !== now.getDate()),
    ]);

    setTeamMembers(prev => prev.map(m => {
      if (m.id === profile.id || m.name.toLowerCase() === profile.name.toLowerCase()) {
        const updated = { ...m, attendanceStatus: 'PRESENT' as const, checkInTime: timeStr, checkInMethod: 'Face ID Biometric' };
        api.updateTeamMember(m.id, updated).catch(console.warn);
        return updated;
      }
      return m;
    }));

    api.verifyBiometric(targetId).catch(console.warn);
    api.recordAttendance(newAttendanceItem).catch(console.warn);
    api.updateProfile(updatedProfile).catch(console.warn);

    return !!enrolled;
  };

  // Employee Creation & Onboarding (HR & Admin)
  const createNewEmployee = async (data: NewEmployeeInput) => {
    const empCode = data.empCode || `TNX-${Math.floor(8000 + Math.random() * 999)}`;
    const empId = `emp-${Date.now()}`;
    const monthlyGross = data.salary || ((data.basicSalary || 20000) + (data.hra || 10000) + (data.specialAllowance || 5000));
    const annualCtc = monthlyGross * 12;

    // 1. Add to Team Members
    const newMember: TeamMember = {
      id: empId,
      empCode,
      name: data.name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: data.roleTitle || (data.role === 'telecaller' ? 'Telecaller Executive' : data.role === 'team_leader' ? 'Team Leader' : data.role.toUpperCase()),
      group: data.teamGroup || 'Alpha Growth Team',
      phone: data.phone,
      attendanceStatus: 'PRESENT',
      checkInTime: '09:00 AM',
      checkInMethod: 'Face ID Biometric',
      dialsToday: 0,
      goalCalls: 100,
      connected: 0,
      interested: 0,
      salesAchieved: 0,
      salesTarget: 200000,
      conversionRate: 0,
    };
    setTeamMembers(prev => [newMember, ...prev]);

    // 2. Add to Onboarding List
    const newOnboarding: OnboardingEmployee = {
      id: empId,
      empCode,
      name: data.name,
      role: data.roleTitle || 'Telecaller Executive',
      department: data.department || 'Sales & Client Acquisition',
      joiningDate: data.joiningDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      probationEnd: '6 Months from Joining',
      status: 'IN_PROGRESS',
      checklist: {
        documentsVerified: !!data.panDocumentName && !!data.aadhaarDocumentName,
        workstationAllocated: true,
        biometricEnrolled: false,
        trainingScheduled: false,
      },
    };
    setOnboardingList(prev => [newOnboarding, ...prev]);

    // 3. Generate Offer Letter
    const newOfferLetter: OfferLetterData = {
      id: `off-${Date.now()}`,
      candidateName: data.name,
      candidateEmail: data.email,
      candidatePhone: data.phone,
      roleTitle: data.roleTitle || 'Telecaller Executive',
      department: data.department || 'Sales & Client Acquisition',
      annualCtc,
      monthlyGross,
      joiningDate: data.joiningDate || 'Immediate',
      reportingManager: data.teamLeaderName || 'Ramesh Sharma (Team Leader)',
      location: data.address || 'Bengaluru Corporate HQ',
      issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setOfferLetters(prev => [newOfferLetter, ...prev]);

    triggerToast(`✓ Employee ${data.name} (${empCode}) created! Offer Letter generated.`);

    // Persist to SQLite
    try {
      await Promise.all([
        api.createTeamMember(newMember),
        api.createOnboarding(newOnboarding),
        api.createOfferLetter(newOfferLetter)
      ]);
    } catch (err) {
      console.warn('API error creating employee:', err);
    }
  };

  const generateOfferLetter = async (data: Omit<OfferLetterData, 'id' | 'issuedDate'>) => {
    const newOffer: OfferLetterData = {
      ...data,
      id: `off-${Date.now()}`,
      issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setOfferLetters(prev => [newOffer, ...prev]);
    setSelectedOfferLetter(newOffer);
    setIsOfferLetterModalOpen(true);
    triggerToast(`✓ Offer letter generated for ${data.candidateName}`);

    try {
      await api.createOfferLetter(newOffer);
    } catch (err) {
      console.warn('API create offer letter error:', err);
    }
  };

  // Team Leader Assignment
  const assignTeamLeaderToGroup = async (groupId: string, leaderName: string) => {
    setTeamGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const updated = { ...g, leaderName };
        api.updateTeamGroup(groupId, updated).catch(console.warn);
        return updated;
      }
      return g;
    }));

    const targetGroup = teamGroups.find(g => g.id === groupId);
    triggerToast(`✓ ${leaderName} assigned as Team Leader to ${targetGroup?.name || 'Group'}`);
  };

  // Team Leader Actions
  const approveLeaveRequest = async (id: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated: LeaveRequest = { ...req, status: 'APPROVED', approvedBy: 'Ramesh Sharma (Team Leader)' };
        api.updateLeave(id, updated).catch(console.warn);
        return updated;
      }
      return req;
    }));
    triggerToast('✓ Leave request APPROVED by Team Leader');
  };

  const rejectLeaveRequest = async (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated: LeaveRequest = { ...req, status: 'REJECTED', approvedBy: `Rejected: ${reason || 'Operational requirements'}` };
        api.updateLeave(id, updated).catch(console.warn);
        return updated;
      }
      return req;
    }));
    triggerToast('✗ Leave request REJECTED with feedback');
  };

  const reassignLead = async (leadId: string, newAssigneeName: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === leadId) {
        const updated: ClientLead = { ...c, requirement: `${c.requirement} (Reassigned to ${newAssigneeName})` };
        api.updateClient(leadId, updated).catch(console.warn);
        return updated;
      }
      return c;
    }));
    triggerToast(`✓ Lead successfully reassigned to ${newAssigneeName}`);
  };

  const createTeamGroup = async (data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string }) => {
    const newGroup: TeamGroup = {
      id: `grp-${Date.now()}`,
      name: data.name,
      description: data.description,
      leaderName: data.leaderName,
      memberCount: 1,
      monthlyTarget: data.monthlyTarget,
      achieved: 0,
      color: data.color || '#00C9A7',
    };
    setTeamGroups(prev => [...prev, newGroup]);
    triggerToast(`✓ Team group "${data.name}" created successfully`);

    try {
      await api.createTeamGroup(newGroup);
    } catch (err) {
      console.warn('API create group error:', err);
    }
  };

  const createTeamTask = async (data: { title: string; assignedTo: string; group?: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'NORMAL' }) => {
    const newTask: TeamTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      assignedTo: data.assignedTo,
      group: data.group,
      dueDate: data.dueDate,
      priority: data.priority,
      status: 'PENDING',
    };
    setTeamTasks(prev => [newTask, ...prev]);
    triggerToast(`✓ Task assigned to ${data.assignedTo}`);

    try {
      await api.createTeamTask(newTask);
    } catch (err) {
      console.warn('API create task error:', err);
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    setTeamTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'PENDING' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
        const updated: TeamTask = { ...t, status: nextStatus };
        api.updateTeamTask(taskId, updated).catch(console.warn);
        return updated;
      }
      return t;
    }));
    triggerToast('✓ Task status updated');
  };

  const scheduleTeamMeeting = async (data: { title: string; dateTime: string; type: TeamMeeting['type']; location: string; agenda: string }) => {
    const newMtg: TeamMeeting = {
      id: `mtg-${Date.now()}`,
      title: data.title,
      dateTime: data.dateTime,
      type: data.type,
      location: data.location,
      attendeesCount: teamMembers.length,
      agenda: data.agenda,
    };
    setTeamMeetings(prev => [newMtg, ...prev]);
    triggerToast(`✓ Team meeting "${data.title}" scheduled & invites dispatched`);

    try {
      await api.createTeamMeeting(newMtg);
    } catch (err) {
      console.warn('API create meeting error:', err);
    }
  };

  // HR Actions
  const scheduleInterview = async (data: { candidateName: string; roleApplied: string; experience: string; email: string; phone: string; interviewTime: string; interviewer: string }) => {
    const newCandidate: CandidateInterview = {
      id: `cand-${Date.now()}`,
      candidateName: data.candidateName,
      roleApplied: data.roleApplied,
      experience: data.experience,
      email: data.email,
      phone: data.phone,
      status: 'INTERVIEW_SCHEDULED',
      interviewTime: data.interviewTime,
      interviewer: data.interviewer,
    };
    setCandidates(prev => [newCandidate, ...prev]);
    triggerToast(`✓ Interview scheduled for ${data.candidateName}`);

    try {
      await api.createInterview(newCandidate);
    } catch (err) {
      console.warn('API create candidate interview error:', err);
    }
  };

  const updateCandidateStatus = async (candidateId: string, status: CandidateInterview['status'], notes?: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        const updated: CandidateInterview = { ...c, status, notes: notes || c.notes };
        api.updateInterview(candidateId, updated).catch(console.warn);
        return updated;
      }
      return c;
    }));
    triggerToast(`✓ Candidate status updated to: ${status.replace('_', ' ')}`);
  };

  const toggleOnboardingChecklist = async (employeeId: string, itemKey: keyof OnboardingEmployee['checklist']) => {
    setOnboardingList(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updatedChecklist = { ...emp.checklist, [itemKey]: !emp.checklist[itemKey] };
        const allCompleted = Object.values(updatedChecklist).every(Boolean);
        const updated: OnboardingEmployee = { 
          ...emp, 
          checklist: updatedChecklist,
          status: allCompleted ? 'COMPLETED' : 'IN_PROGRESS'
        };
        api.updateOnboarding(employeeId, updated).catch(console.warn);
        return updated;
      }
      return emp;
    }));
    triggerToast('✓ Onboarding checklist updated');
  };

  const toggleExitChecklist = async (employeeId: string, itemKey: keyof ExitEmployee['checklist']) => {
    setExitList(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updatedChecklist = { ...emp.checklist, [itemKey]: !emp.checklist[itemKey] };
        const allCompleted = Object.values(updatedChecklist).every(Boolean);
        const updated: ExitEmployee = { 
          ...emp, 
          checklist: updatedChecklist,
          status: allCompleted ? 'RELIEVED' : 'CLEARANCE_PENDING'
        };
        api.updateExitEmployee(employeeId, updated).catch(console.warn);
        return updated;
      }
      return emp;
    }));
    triggerToast('✓ Exit clearance updated');
  };

  const verifyPayment = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    setPaymentVerifications(prev => prev.map(p => {
      if (p.id === paymentId) {
        const updated: PaymentVerificationItem = { ...p, status };
        api.updatePayment(paymentId, updated).catch(console.warn);
        return updated;
      }
      return p;
    }));
    triggerToast(`✓ Payment ${status === 'VERIFIED' ? 'Approved & Verified' : 'Rejected'}`);
  };

  const generateBulkPayslips = async (month: string, year: string) => {
    const newPayslip: PayslipItem = {
      id: `ps-${Date.now()}`,
      month: month,
      year: parseInt(year, 10) || 2025,
      basicSalary: 38000,
      hra: 14000,
      specialAllowance: 6500,
      incentives: 22500,
      pfDeduction: 2400,
      taxDeduction: 2600,
      netPay: 76000,
      generatedDate: `01 ${month} ${year}`,
      status: 'PAID',
    };
    setPayslips(prev => [newPayslip, ...prev]);
    triggerToast(`✓ Generated ${month} ${year} payslips for all active employees!`);

    try {
      await api.generateBulkPayslips(month, year);
    } catch (err) {
      console.warn('API generate bulk payslips error:', err);
    }
  };

  const logNewCall = async (data: {
    clientName: string;
    companyName: string;
    phoneNumber: string;
    outcome: CallOutcome;
    durationSec: number;
    notes: string;
    followUpDate?: string;
  }) => {
    const newCallItem: CallLogItem = {
      id: `log-${Date.now()}`,
      clientName: data.clientName,
      companyName: data.companyName,
      phoneNumber: data.phoneNumber,
      outcome: data.outcome,
      durationSec: data.durationSec,
      notes: data.notes,
      followUpDate: data.followUpDate,
      timestamp: 'Just now',
    };

    setCallLogs((prev) => [newCallItem, ...prev]);

    const isConnected = data.outcome !== 'BUSY';
    const isInterested = data.outcome === 'INTERESTED' || data.outcome === 'DEAL_CLOSED';
    const isRejected = data.outcome === 'NOT_INTERESTED';

    const updatedStats: TelecallerStats = {
      ...stats,
      dialsMade: stats.dialsMade + 1,
      connected: isConnected ? stats.connected + 1 : stats.connected,
      interested: isInterested ? stats.interested + 1 : stats.interested,
      rejected: isRejected ? stats.rejected + 1 : stats.rejected,
    };

    setStats(updatedStats);
    triggerToast(`✓ Call logged for ${data.clientName} (${data.outcome.replace('_', ' ')})`);

    try {
      await Promise.all([
        api.createCallLog(newCallItem),
        api.updateStats(updatedStats)
      ]);
    } catch (err) {
      console.warn('API log new call error:', err);
    }
  };

  const submitLeaveRequest = async (data: {
    leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned / Paid Leave';
    fromDate: string;
    toDate: string;
    totalDays: number;
    reason: string;
  }) => {
    const newLeave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: 'PENDING',
      appliedOn: 'Today, 28 May 2025',
    };

    setLeaveRequests((prev) => [newLeave, ...prev]);
    const updatedProfile: EmployeeProfile = {
      ...profile,
      totalLeaveBalance: Math.max(0, profile.totalLeaveBalance - data.totalDays),
    };
    setProfile(updatedProfile);

    triggerToast(`✓ Leave request submitted to Team Leader (${data.totalDays} Days)`);

    try {
      await Promise.all([
        api.createLeave(newLeave),
        api.updateProfile(updatedProfile)
      ]);
    } catch (err) {
      console.warn('API leave submit error:', err);
    }
  };

  const simulateFaceIdCheckIn = () => {
    verifyFaceAttendance();
    triggerToast(`✓ Face ID Biometric Verified! Check-in recorded.`);
  };

  const simulateFaceIdCheckOut = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedProfile: EmployeeProfile = {
      ...profile,
      faceIdStatus: 'ON_BREAK',
    };
    setProfile(updatedProfile);

    triggerToast(`✓ Biometric Check-out recorded at ${timeStr}`);

    try {
      await api.updateProfile(updatedProfile);
    } catch (err) {
      console.warn('API checkout error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        deviceMode,
        setDeviceMode,
        profile,
        stats,
        callLogs,
        clients,
        attendanceLogs,
        leaveRequests,
        payslips,
        assignedLeads,
        leadBatches,
        importAndAssignLeads,
        updateAssignedLeadStatus,
        faceProfiles,
        registerFaceBiometric,
        verifyFaceAttendance,
        offerLetters,
        selectedOfferLetter,
        setSelectedOfferLetter,
        isOfferLetterModalOpen,
        setIsOfferLetterModalOpen,
        createNewEmployee,
        generateOfferLetter,
        teamMembers,
        teamGroups,
        teamTasks,
        teamMeetings,
        candidates,
        onboardingList,
        exitList,
        paymentVerifications,
        approveLeaveRequest,
        rejectLeaveRequest,
        reassignLead,
        createTeamGroup,
        assignTeamLeaderToGroup,
        createTeamTask,
        toggleTaskStatus,
        scheduleTeamMeeting,
        scheduleInterview,
        updateCandidateStatus,
        toggleOnboardingChecklist,
        toggleExitChecklist,
        verifyPayment,
        generateBulkPayslips,
        authStep,
        setAuthStep,
        logout,
        isFaceIdModalOpen,
        setIsFaceIdModalOpen,
        isFaceRegistrationModalOpen,
        setIsFaceRegistrationModalOpen,
        faceRegistrationEmployee,
        setFaceRegistrationEmployee,
        isExcelUploadModalOpen,
        setIsExcelUploadModalOpen,
        isQuickCallModalOpen,
        setIsQuickCallModalOpen,
        isLeaveModalOpen,
        setIsLeaveModalOpen,
        isIdCardModalOpen,
        setIsIdCardModalOpen,
        selectedPayslip,
        setSelectedPayslip,
        activeToast,
        triggerToast,
        logNewCall,
        submitLeaveRequest,
        simulateFaceIdCheckIn,
        simulateFaceIdCheckOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
