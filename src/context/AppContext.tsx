import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
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
import { api } from '../services/api';
import {
  ALL_RESOURCE_KEYS,
  EMPTY_PROFILE,
  EMPTY_STATS,
  RESOURCE_FETCHERS,
  ResourceKey,
  ResourceStatus,
} from '../data/resources';

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
  /** The signed-in employee's own assigned leads, in the shape the pipeline screens expect. */
  myLeads: ClientLead[];
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
  activeCallingLead: AssignedLead | null;
  setActiveCallingLead: (lead: AssignedLead | null) => void;
  openCallModalForLead: (lead: AssignedLead) => void;

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
  /** Change an employee's details, role or team. */
  updateEmployee: (id: string, changes: Partial<TeamMember>) => Promise<void>;
  /** Switch an employee off without deleting their history, or switch them back on. */
  setEmployeeActive: (id: string, active: boolean) => Promise<void>;
  generateOfferLetter: (data: Omit<OfferLetterData, 'id' | 'issuedDate'>) => void;

  // Team Leader Module State
  teamMembers: TeamMember[];
  teamGroups: TeamGroup[];
  teamTasks: TeamTask[];
  teamMeetings: TeamMeeting[];
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;
  reassignLead: (leadId: string, newAssigneeName: string) => void;
  /** Move a telecaller's leads to someone else, optionally limited to a count. */
  reassignLeadsBetween: (fromEmployeeId: string, toEmployeeId: string, limit?: number) => Promise<void>;
  createTeamGroup: (data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string }, memberIds?: string[]) => void;
  assignTeamLeaderToGroup: (groupId: string, leaderName: string) => void;
  createTeamTask: (data: { title: string; assignedTo: string; group?: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'NORMAL' }) => void;
  toggleTaskStatus: (taskId: string) => void;
  scheduleTeamMeeting: (data: { 
    title: string; 
    dateTime: string; 
    type: string; 
    location?: string; 
    agenda: string; 
    status?: 'LIVE' | 'UPCOMING' | 'COMPLETED'; 
    meetingLink?: string; 
    invitedMemberName?: string;
    attendeesCount?: number;
  }) => void;
  updateTeamMeeting: (id: string, updates: Partial<TeamMeeting>) => void;
  deleteTeamMeeting: (id: string) => void;
  isLiveRoomOpen: boolean;
  setIsLiveRoomOpen: (open: boolean) => void;
  activeMeetingRoom: TeamMeeting | null;
  setActiveMeetingRoom: (meeting: TeamMeeting | null) => void;
  joinMeeting: (meeting: TeamMeeting) => void;
  leaveMeeting: () => void;
  
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
  faceIdModalMode: 'CHECK_IN' | 'CHECK_OUT';
  setFaceIdModalMode: (mode: 'CHECK_IN' | 'CHECK_OUT') => void;
  openPunchIn: () => void;
  openPunchOut: () => void;
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
  isPayslipModalOpen: boolean;
  setIsPayslipModalOpen: (open: boolean) => void;
  isRecentPayslipsModalOpen: boolean;
  setIsRecentPayslipsModalOpen: (open: boolean) => void;
  openPayslipModal: (payslip: PayslipItem) => void;
  openOfferLetterModal: () => void;
  
  // Backend connection status & on-demand loading
  isDataLoading: boolean;
  backendError: string | null;
  resourceStatus: Record<ResourceKey, ResourceStatus>;
  loadResources: (keys: readonly ResourceKey[], options?: { force?: boolean }) => Promise<void>;
  refreshResources: (keys: readonly ResourceKey[]) => Promise<void>;
  invalidateAll: () => void;

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
  /** Records a real check-in with the photo and position captured on the device. */
  recordCheckIn: (data: {
    photo: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => Promise<void>;
  /** Records the end of the day, with the same proof as check-in. */
  recordCheckOut: (data: {
    photo: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    // Browsers with site data blocked throw on access rather than returning null
    try {
      return (localStorage.getItem('tnx_currentRole') as UserRole) || 'telecaller';
    } catch {
      return 'telecaller';
    }
  });
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      return (localStorage.getItem('tnx_activeTab') as NavTab) || 'home';
    } catch {
      return 'home';
    }
  });
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop');
  const [authStep, setAuthStep] = useState<AuthStep>(() => {
    try {
      return (localStorage.getItem('tnx_authStep') as AuthStep) || 'AUTHENTICATED';
    } catch {
      return 'AUTHENTICATED';
    }
  });

  // All domain data comes from the SQLite backend. Lists start empty and are
  // filled on demand by the resource loader below, so an unreachable API shows
  // as empty screens rather than silently falling back to mock records.
  // profile/stats keep their shape as a blank skeleton because the whole UI
  // reads their fields directly; both are replaced by the API response.
  const [profile, setProfile] = useState<EmployeeProfile>(EMPTY_PROFILE);
  const [stats, setStats] = useState<TelecallerStats>(EMPTY_STATS);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [clients, setClients] = useState<ClientLead[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);

  // Dynamic Lead Management State
  const [assignedLeads, setAssignedLeads] = useState<AssignedLead[]>([]);
  const [leadBatches, setLeadBatches] = useState<LeadBatch[]>([]);

  // Face Biometric State
  const [faceProfiles, setFaceProfiles] = useState<FaceBiometricProfile[]>([]);

  // Offer Letters State
  const [offerLetters, setOfferLetters] = useState<OfferLetterData[]>([]);
  const [selectedOfferLetter, setSelectedOfferLetter] = useState<OfferLetterData | null>(null);
  const [isOfferLetterModalOpen, setIsOfferLetterModalOpen] = useState(false);

  // Team Leader Module State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [teamMeetings, setTeamMeetings] = useState<TeamMeeting[]>([]);
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<TeamMeeting | null>(null);

  // HR Module State
  const [candidates, setCandidates] = useState<CandidateInterview[]>([]);
  const [onboardingList, setOnboardingList] = useState<OnboardingEmployee[]>([]);
  const [exitList, setExitList] = useState<ExitEmployee[]>([]);
  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerificationItem[]>([]);

  // Backend connection state, surfaced in the UI so a failed load is visible.
  const [backendError, setBackendError] = useState<string | null>(null);

  // Modals & UI State
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [faceIdModalMode, setFaceIdModalMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');

  const openPunchIn = () => {
    setFaceIdModalMode('CHECK_IN');
    setIsFaceIdModalOpen(true);
  };

  const openPunchOut = () => {
    setFaceIdModalMode('CHECK_OUT');
    setIsFaceIdModalOpen(true);
  };
  const [isFaceRegistrationModalOpen, setIsFaceRegistrationModalOpen] = useState<boolean>(false);
  const [faceRegistrationEmployee, setFaceRegistrationEmployee] = useState<{ id: string; name: string } | null>(null);
  const [activeCallingLead, setActiveCallingLead] = useState<AssignedLead | null>(null);

  const openCallModalForLead = (lead: AssignedLead) => {
    setActiveCallingLead(lead);
    setIsQuickCallModalOpen(true);
  };
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isRecentPayslipsModalOpen, setIsRecentPayslipsModalOpen] = useState(false);

  const openPayslipModal = (payslip: PayslipItem) => {
    setSelectedPayslip(payslip);
    setIsPayslipModalOpen(true);
  };

  const openOfferLetterModal = () => {
    const matched = offerLetters.find(o => o.candidateName.toLowerCase() === profile.name.toLowerCase()) || {
      id: `off-${profile.empCode}`,
      candidateName: profile.name,
      candidateEmail: profile.email || `${profile.name.toLowerCase().replace(' ', '.')}@tradenexus.com`,
      candidatePhone: profile.phone || '+91 98765 43210',
      roleTitle: profile.roleTitle || 'Telecaller Executive',
      department: profile.department || 'Client Acquisition',
      annualCtc: 360000,
      monthlyGross: 30000,
      joiningDate: profile.joinDate || '12 Jan 2024',
      reportingManager: profile.teamLeaderName || 'Ramesh Sharma (Team Leader)',
      location: 'Bengaluru Corporate HQ',
      issuedDate: profile.joinDate || '12 Jan 2024',
    };
    setSelectedOfferLetter(matched);
    setIsOfferLetterModalOpen(true);
  };
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // --- On-demand resource loading -----------------------------------------
  // Nothing is fetched on mount. Screens declare what they need via
  // useScreenData(), and each resource is fetched at most once per session
  // (until something invalidates it). Concurrent requests for the same
  // resource share one in-flight promise.

  const setters = useRef<Record<ResourceKey, (value: any) => void>>({
    profile: setProfile,
    stats: setStats,
    callLogs: setCallLogs,
    clients: setClients,
    attendanceLogs: setAttendanceLogs,
    leaveRequests: setLeaveRequests,
    payslips: setPayslips,
    teamMembers: setTeamMembers,
    teamGroups: setTeamGroups,
    teamTasks: setTeamTasks,
    teamMeetings: setTeamMeetings,
    candidates: setCandidates,
    onboardingList: setOnboardingList,
    exitList: setExitList,
    assignedLeads: setAssignedLeads,
    leadBatches: setLeadBatches,
    faceProfiles: setFaceProfiles,
    offerLetters: setOfferLetters,
    paymentVerifications: setPaymentVerifications,
  });

  const [resourceStatus, setResourceStatus] = useState<Record<ResourceKey, ResourceStatus>>(
    () => Object.fromEntries(ALL_RESOURCE_KEYS.map((k) => [k, 'idle'])) as Record<ResourceKey, ResourceStatus>
  );

  // Mirrors resourceStatus so load decisions never depend on a stale closure.
  const statusRef = useRef(resourceStatus);
  const inFlight = useRef(new Map<ResourceKey, Promise<void>>());

  const markStatus = useCallback((key: ResourceKey, status: ResourceStatus) => {
    statusRef.current = { ...statusRef.current, [key]: status };
    setResourceStatus((prev) => (prev[key] === status ? prev : { ...prev, [key]: status }));
  }, []);

  const fetchResource = useCallback(
    (key: ResourceKey): Promise<void> => {
      const existing = inFlight.current.get(key);
      if (existing) return existing;

      markStatus(key, 'loading');

      const request = RESOURCE_FETCHERS[key]()
        .then((value) => {
          if (value !== undefined && value !== null) setters.current[key](value);
          markStatus(key, 'loaded');
          setBackendError(null);
        })
        .catch((err) => {
          markStatus(key, 'loaded');
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            setBackendError(
              `Could not load "${key}" from the API on port 5001. Start it with: npm run server (${String(err)})`
            );
          }
        })
        .finally(() => {
          inFlight.current.delete(key);
        });

      inFlight.current.set(key, request);
      return request;
    },
    [markStatus]
  );

  /** Fetch the given resources unless they are already loaded or in flight. */
  const loadResources = useCallback(
    (keys: readonly ResourceKey[], options?: { force?: boolean }) => {
      const pending = keys.filter((key) =>
        options?.force ? true : statusRef.current[key] === 'idle' || statusRef.current[key] === 'error'
      );
      if (!pending.length) return Promise.resolve();
      if (options?.force) pending.forEach((key) => inFlight.current.delete(key));
      return Promise.all(pending.map(fetchResource)).then(() => undefined);
    },
    [fetchResource]
  );

  /** Re-fetch resources that have already been loaded (used after mutations). */
  const refreshResources = useCallback(
    (keys: readonly ResourceKey[]) => loadResources(keys, { force: true }),
    [loadResources]
  );

  const isDataLoading = ALL_RESOURCE_KEYS.some((k) => resourceStatus[k] === 'loading');

  // Only the selected portal is remembered locally; domain data is never cached
  // so the screens always reflect what is actually in SQLite.
  useEffect(() => {
    try {
      localStorage.setItem('tnx_currentRole', currentRole);
    } catch {
      // Ignore storage errors (private windows, blocked site data)
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem('tnx_authStep', authStep);
    } catch {}
  }, [authStep]);

  useEffect(() => {
    try {
      localStorage.setItem('tnx_activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  /** Drop every cached resource so the next screen re-fetches from the API. */
  const invalidateAll = useCallback(() => {
    inFlight.current.clear();
    const reset = Object.fromEntries(
      ALL_RESOURCE_KEYS.map((k) => [k, 'idle'])
    ) as Record<ResourceKey, ResourceStatus>;
    statusRef.current = reset;
    setResourceStatus(reset);
  }, []);

  const logout = () => {
    invalidateAll();
    try {
      localStorage.setItem('tnx_authStep', 'LOGIN');
    } catch {}
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
        if (m.name.toLowerCase() === (targetLead?.assignedToEmployeeName ?? '').toLowerCase() || m.id === targetLead?.assignedToEmployeeId) {
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
        const updated = { ...m, attendanceStatus: 'PRESENT' as const, checkInTime: timeStr, checkInMethod: 'Face ID Biometric' as const };
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
  const updateEmployee = async (id: string, changes: Partial<TeamMember>) => {
    let updated: TeamMember | undefined;
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        updated = { ...m, ...changes };
        return updated;
      })
    );

    if (!updated) return;
    triggerToast(`\u2713 ${updated.name} updated`);

    try {
      await api.updateTeamMember(id, updated);
    } catch (err) {
      console.warn('Employee update failed:', err);
      triggerToast('\u2717 Could not save those changes');
    }
  };

  const setEmployeeActive = async (id: string, active: boolean) => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    const changes: Partial<TeamMember> = {
      active: active ? 1 : 0,
      deactivatedOn: active ? undefined : today,
    };

    let name = '';
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        name = m.name;
        return { ...m, ...changes };
      })
    );

    triggerToast(active ? `\u2713 ${name} reactivated` : `\u2713 ${name} deactivated`);

    try {
      await api.updateTeamMember(id, changes as Partial<TeamMember>);
    } catch (err) {
      console.warn('Employee status change failed:', err);
    }
  };

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
      portal: data.role,
      email: data.email,
      active: 1,
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

  // Leads that Admin allocated to this employee. Admin writes them to
  // assigned_leads; the pipeline screens were built around ClientLead, so they
  // are mapped across rather than duplicating the screens.
  const todayIso = new Date().toISOString().split('T')[0];
  const myLeads: ClientLead[] = assignedLeads
    .filter((l) => l.assignedToEmployeeId === profile.id || l.assignedToEmployeeName === profile.name)
    .map((l) => {
      const dueToday = !!l.followUpDate && l.followUpDate.slice(0, 10) === todayIso;
      return {
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        email: l.email || '',
        temperature:
          l.status === 'CONVERTED' ? 'CONVERTED'
          : l.status === 'INTERESTED' ? 'HOT'
          : l.status === 'CALLBACK' ? 'WARM'
          : l.status === 'NOT_INTERESTED' ? 'COLD'
          : 'WARM',
        status:
          l.status === 'CONVERTED' ? 'Converted'
          : dueToday ? 'Due Today'
          : l.status === 'CALLBACK' ? 'Follow-up'
          : 'Pending',
        dueTime: l.followUpDate,
        dealValue: l.dealValue ?? 0,
        requirement: l.notes || `Assigned ${l.assignedDate}`,
        lastContacted: l.lastCallTimestamp || 'Not called yet',
      };
    });

  const reassignLeadsBetween = async (fromEmployeeId: string, toEmployeeId: string, limit?: number) => {
    const fromMember = teamMembers.find((m) => m.id === fromEmployeeId);
    const target = teamMembers.find((m) => m.id === toEmployeeId);
    if (!target) return;

    let moving = assignedLeads.filter((l) => 
      l.assignedToEmployeeId === fromEmployeeId ||
      (fromMember && l.assignedToEmployeeName && l.assignedToEmployeeName.toLowerCase() === fromMember.name.toLowerCase())
    );
    if (!moving.length) {
      triggerToast('That telecaller has no leads to move.');
      return;
    }

    if (limit && limit > 0 && limit < moving.length) {
      moving = moving.slice(0, limit);
    }

    const movingIds = new Set(moving.map((l) => l.id));

    setAssignedLeads((prev) =>
      prev.map((l) => {
        const isMoving = movingIds.has(l.id);
        return isMoving
          ? { ...l, assignedToEmployeeId: target.id, assignedToEmployeeName: target.name }
          : l;
      })
    );

    triggerToast(`✓ ${moving.length} lead${moving.length === 1 ? '' : 's'} moved to ${target.name}`);

    try {
      await Promise.all(
        moving.map((l) =>
          api.updateAssignedLead(l.id, {
            ...l,
            assignedToEmployeeId: target.id,
            assignedToEmployeeName: target.name,
          })
        )
      );
    } catch (err) {
      console.warn('Lead reassignment failed:', err);
      triggerToast('✗ Some leads could not be moved');
    }
  };

  const createTeamGroup = async (
    data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string },
    memberIds?: string[]
  ) => {
    const newGroup: TeamGroup = {
      id: `grp-${Date.now()}`,
      name: data.name,
      description: data.description,
      leaderName: data.leaderName,
      memberCount: memberIds?.length || 0,
      monthlyTarget: data.monthlyTarget,
      achieved: 0,
      color: data.color || '#00C9A7',
    };
    setTeamGroups(prev => [...prev, newGroup]);

    if (memberIds && memberIds.length > 0) {
      setTeamMembers(prev =>
        prev.map(m => memberIds.includes(m.id) ? { ...m, group: data.name } : m)
      );
      for (const mId of memberIds) {
        const mem = teamMembers.find(m => m.id === mId);
        if (mem) {
          api.updateTeamMember(mId, { ...mem, group: data.name }).catch(console.warn);
        }
      }
    }

    triggerToast(`✓ Team squad "${data.name}" created with ${memberIds?.length || 0} members`);

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

  const scheduleTeamMeeting = async (data: { 
    title: string; 
    dateTime: string; 
    type: string; 
    location?: string; 
    agenda: string; 
    status?: 'LIVE' | 'UPCOMING' | 'COMPLETED'; 
    meetingLink?: string; 
    invitedMemberName?: string;
    attendeesCount?: number;
  }) => {
    const meetingId = `mtg-${Date.now()}`;
    const newMtg: TeamMeeting = {
      id: meetingId,
      title: data.title,
      dateTime: data.dateTime || 'Today',
      type: data.type || 'Team Discussion',
      location: data.location || 'In-App Video Room',
      attendeesCount: data.attendeesCount ?? (data.invitedMemberName ? 2 : teamMembers.length),
      agenda: data.agenda || '',
      status: data.status || 'UPCOMING',
      meetingLink: data.meetingLink || `https://meet.tradenexus.io/room/${meetingId}`,
      invitedMemberName: data.invitedMemberName,
    };
    setTeamMeetings(prev => [newMtg, ...prev]);
    triggerToast(`✓ Meeting "${data.title}" scheduled`);

    try {
      await api.createTeamMeeting(newMtg);
    } catch (err) {
      console.warn('API create meeting error:', err);
    }
  };

  const updateTeamMeeting = async (id: string, updates: Partial<TeamMeeting>) => {
    setTeamMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    try {
      await api.updateTeamMeeting(id, updates);
    } catch (err) {
      console.warn('API update meeting error:', err);
    }
  };

  const deleteTeamMeeting = async (id: string) => {
    setTeamMeetings(prev => prev.filter(m => m.id !== id));
    triggerToast('✓ Meeting cancelled');
    try {
      await api.deleteTeamMeeting(id);
    } catch (err) {
      console.warn('API delete meeting error:', err);
    }
  };

  const joinMeeting = (mtg: TeamMeeting) => {
    setActiveMeetingRoom(mtg);
    setIsLiveRoomOpen(true);
    if (mtg.status !== 'LIVE' && currentRole === 'team_leader') {
      updateTeamMeeting(mtg.id, { status: 'LIVE' });
    }
  };

  const leaveMeeting = () => {
    if (currentRole === 'team_leader' && activeMeetingRoom) {
      updateTeamMeeting(activeMeetingRoom.id, { status: 'COMPLETED' });
      triggerToast('✓ Meeting concluded and saved');
    } else {
      triggerToast('Left video meeting room');
    }
    setIsLiveRoomOpen(false);
    setActiveMeetingRoom(null);
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
    const monthOrder: Record<string, number> = {
      january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
      april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
      august: 8, aug: 8, september: 9, sep: 9, october: 10, oct: 10,
      november: 11, nov: 11, december: 12, dec: 12
    };
    setPayslips(prev => {
      const filtered = prev.filter(p => !(p.month.toLowerCase() === month.toLowerCase() && p.year === (parseInt(year, 10) || 2025)));
      const combined = [newPayslip, ...filtered];
      combined.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        const aM = monthOrder[a.month.toLowerCase()] || 0;
        const bM = monthOrder[b.month.toLowerCase()] || 0;
        return bM - aM;
      });
      return combined;
    });
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
      employeeName: profile.name,
      employeeCode: profile.empCode,
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

  const recordCheckIn = async (data: {
    photo: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];

    const updatedProfile: EmployeeProfile = {
      ...profile,
      faceIdStatus: 'VERIFIED_PRESENT',
      checkInTime: timeStr,
    };
    setProfile(updatedProfile);

    setAttendanceLogs((prev) => [
      {
        id: `att-${today}-${profile.id}`,
        employeeId: profile.id,
        employeeName: profile.name,
        date: today,
        dayNumber: now.getDate(),
        status: 'PRESENT',
        checkIn: timeStr,
        workHours: 'In Progress',
        method: 'Face ID Biometric',
        checkInPhoto: data.photo ?? undefined,
        checkInLat: data.latitude ?? undefined,
        checkInLng: data.longitude ?? undefined,
        locationStatus: data.latitude == null ? 'NOT_SHARED' : undefined,
      },
      ...prev.filter((item) => item.dayNumber !== now.getDate()),
    ]);

    triggerToast(`\u2713 Checked in at ${timeStr}`);

    try {
      await api.recordAttendance({
        id: `att-${today}-${profile.id}`,
        employeeId: profile.id,
        employeeName: profile.name,
        date: today,
        dayNumber: now.getDate(),
        status: 'PRESENT',
        checkIn: timeStr,
        workHours: 'In Progress',
        method: 'Face ID Biometric',
        checkInPhoto: data.photo,
        latitude: data.latitude,
        longitude: data.longitude,
      } as any);
      await api.updateProfile(updatedProfile);
    } catch (err) {
      console.warn('Check-in save failed:', err);
    }
  };

  const recordCheckOut = async (data: {
    photo: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];
    const recordId = `att-${today}-${profile.id}`;

    const updatedProfile: EmployeeProfile = { 
      ...profile, 
      faceIdStatus: 'ON_BREAK',
      checkOutTime: timeStr 
    };
    setProfile(updatedProfile);

    setAttendanceLogs((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, checkOut: timeStr } : a))
    );

    triggerToast(`\u2713 Checked out at ${timeStr}`);

    try {
      await api.updateAttendance2(recordId, {
        checkOut: timeStr,
        checkOutPhoto: data.photo,
        latitude: data.latitude,
        longitude: data.longitude,
      } as any);
      await api.updateProfile(updatedProfile);
    } catch (err) {
      console.warn('Check-out save failed:', err);
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
        myLeads,
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
        updateEmployee,
        setEmployeeActive,
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
        reassignLeadsBetween,
        createTeamGroup,
        assignTeamLeaderToGroup,
        createTeamTask,
        toggleTaskStatus,
        scheduleTeamMeeting,
        updateTeamMeeting,
        deleteTeamMeeting,
        isLiveRoomOpen,
        setIsLiveRoomOpen,
        activeMeetingRoom,
        setActiveMeetingRoom,
        joinMeeting,
        leaveMeeting,
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
        faceIdModalMode,
        setFaceIdModalMode,
        openPunchIn,
        openPunchOut,
        isFaceRegistrationModalOpen,
        setIsFaceRegistrationModalOpen,
        faceRegistrationEmployee,
        setFaceRegistrationEmployee,
        isExcelUploadModalOpen,
        setIsExcelUploadModalOpen,
        isQuickCallModalOpen,
        setIsQuickCallModalOpen,
        activeCallingLead,
        setActiveCallingLead,
        openCallModalForLead,
        isLeaveModalOpen,
        setIsLeaveModalOpen,
        isIdCardModalOpen,
        setIsIdCardModalOpen,
        selectedPayslip,
        setSelectedPayslip,
        isPayslipModalOpen,
        setIsPayslipModalOpen,
        isRecentPayslipsModalOpen,
        setIsRecentPayslipsModalOpen,
        openPayslipModal,
        openOfferLetterModal,
        isDataLoading,
        backendError,
        resourceStatus,
        loadResources,
        refreshResources,
        invalidateAll,
        activeToast,
        triggerToast,
        logNewCall,
        submitLeaveRequest,
        simulateFaceIdCheckIn,
        simulateFaceIdCheckOut,
        recordCheckIn,
        recordCheckOut,
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
