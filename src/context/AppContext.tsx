import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  TeamMeeting
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
  INITIAL_TEAM_MEETINGS
} from '../data/mockData';

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
  
  // Team Leader Module State
  teamMembers: TeamMember[];
  teamGroups: TeamGroup[];
  teamTasks: TeamTask[];
  teamMeetings: TeamMeeting[];
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;
  reassignLead: (leadId: string, newAssigneeName: string) => void;
  createTeamGroup: (data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string }) => void;
  createTeamTask: (data: { title: string; assignedTo: string; group?: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'NORMAL' }) => void;
  toggleTaskStatus: (taskId: string) => void;
  scheduleTeamMeeting: (data: { title: string; dateTime: string; type: TeamMeeting['type']; location: string; agenda: string }) => void;
  
  // Authentication Flow
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  logout: () => void;
  
  // Modals & Drawers
  isFaceIdModalOpen: boolean;
  setIsFaceIdModalOpen: (open: boolean) => void;
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
  const [currentRole, setCurrentRole] = useState<UserRole>('telecaller');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [authStep, setAuthStep] = useState<AuthStep>('LOGIN');

  const [profile, setProfile] = useState<EmployeeProfile>(INITIAL_PROFILE);
  const [stats, setStats] = useState<TelecallerStats>(INITIAL_TELECALLER_STATS);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(INITIAL_CALL_LOGS);
  const [clients, setClients] = useState<ClientLead[]>(INITIAL_CLIENT_LEADS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payslips] = useState<PayslipItem[]>(INITIAL_PAYSLIPS);

  // Team Leader Module State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(INITIAL_TEAM_GROUPS);
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>(INITIAL_TEAM_TASKS);
  const [teamMeetings, setTeamMeetings] = useState<TeamMeeting[]>(INITIAL_TEAM_MEETINGS);

  // Modals
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const logout = () => {
    setAuthStep('LOGIN');
    triggerToast('Logged out. Please login to continue.');
  };

  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Team Leader Actions
  const approveLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: 'APPROVED', approvedBy: 'Ramesh Sharma (Team Leader)' };
      }
      return req;
    }));
    triggerToast('✓ Leave request APPROVED by Team Leader');
  };

  const rejectLeaveRequest = (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: 'REJECTED', approvedBy: `Rejected: ${reason || 'Operational requirements'}` };
      }
      return req;
    }));
    triggerToast('✗ Leave request REJECTED with feedback');
  };

  const reassignLead = (leadId: string, newAssigneeName: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === leadId) {
        return { ...c, requirement: `${c.requirement} (Reassigned to ${newAssigneeName})` };
      }
      return c;
    }));
    triggerToast(`✓ Lead successfully reassigned to ${newAssigneeName}`);
  };

  const createTeamGroup = (data: { name: string; description: string; leaderName: string; monthlyTarget: number; color: string }) => {
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
  };

  const createTeamTask = (data: { title: string; assignedTo: string; group?: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'NORMAL' }) => {
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
  };

  const toggleTaskStatus = (taskId: string) => {
    setTeamTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'PENDING' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    triggerToast('✓ Task status updated');
  };

  const scheduleTeamMeeting = (data: { title: string; dateTime: string; type: TeamMeeting['type']; location: string; agenda: string }) => {
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
  };

  const logNewCall = (data: {
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

    setStats((prev) => {
      const isConnected = data.outcome !== 'BUSY';
      const isInterested = data.outcome === 'INTERESTED' || data.outcome === 'DEAL_CLOSED';
      const isRejected = data.outcome === 'NOT_INTERESTED';

      return {
        ...prev,
        dialsMade: prev.dialsMade + 1,
        connected: isConnected ? prev.connected + 1 : prev.connected,
        interested: isInterested ? prev.interested + 1 : prev.interested,
        rejected: isRejected ? prev.rejected + 1 : prev.rejected,
      };
    });

    triggerToast(`✓ Call logged for ${data.clientName} (${data.outcome.replace('_', ' ')})`);
  };

  const submitLeaveRequest = (data: {
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
    setProfile((prev) => ({
      ...prev,
      totalLeaveBalance: Math.max(0, prev.totalLeaveBalance - data.totalDays),
    }));

    triggerToast(`✓ Leave request submitted to Team Leader (${data.totalDays} Days)`);
  };

  const simulateFaceIdCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setProfile((prev) => ({
      ...prev,
      faceIdStatus: 'VERIFIED_PRESENT',
      checkInTime: timeStr,
    }));

    setAttendanceLogs((prev) => [
      {
        date: '2025-05-28',
        dayNumber: 28,
        status: 'PRESENT',
        checkIn: timeStr,
        workHours: 'In Progress',
        method: 'Face ID Biometric',
      },
      ...prev.filter((item) => item.dayNumber !== 28),
    ]);

    triggerToast(`✓ Face ID Biometric Verified! Check-in: ${timeStr}`);
  };

  const simulateFaceIdCheckOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setProfile((prev) => ({
      ...prev,
      faceIdStatus: 'ON_BREAK',
    }));

    triggerToast(`✓ Biometric Check-out recorded at ${timeStr}`);
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
        teamMembers,
        teamGroups,
        teamTasks,
        teamMeetings,
        approveLeaveRequest,
        rejectLeaveRequest,
        reassignLead,
        createTeamGroup,
        createTeamTask,
        toggleTaskStatus,
        scheduleTeamMeeting,
        authStep,
        setAuthStep,
        logout,
        isFaceIdModalOpen,
        setIsFaceIdModalOpen,
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
