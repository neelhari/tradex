import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  UserRole, 
  NavTab, 
  EmployeeProfile, 
  TelecallerStats, 
  CallLogItem, 
  ClientLead, 
  AttendanceRecord, 
  LeaveRequest, 
  PayslipItem,
  CallOutcome
} from '../types';
import { 
  INITIAL_PROFILE, 
  INITIAL_TELECALLER_STATS, 
  INITIAL_CALL_LOGS, 
  INITIAL_CLIENT_LEADS, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYSLIPS 
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

  const [profile, setProfile] = useState<EmployeeProfile>(INITIAL_PROFILE);
  const [stats, setStats] = useState<TelecallerStats>(INITIAL_TELECALLER_STATS);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(INITIAL_CALL_LOGS);
  const [clients, setClients] = useState<ClientLead[]>(INITIAL_CLIENT_LEADS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payslips] = useState<PayslipItem[]>(INITIAL_PAYSLIPS);

  // Modals
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast(null);
    }, 3000);
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
    const newLog: CallLogItem = {
      id: `call-${Date.now()}`,
      clientName: data.clientName,
      companyName: data.companyName,
      phoneNumber: data.phoneNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSec: data.durationSec,
      outcome: data.outcome,
      notes: data.notes,
      followUpDate: data.followUpDate,
    };

    setCallLogs(prev => [newLog, ...prev]);

    // Increment Telecaller daily stats
    setStats(prev => {
      const isConnected = data.outcome !== 'BUSY';
      const isInterested = data.outcome === 'INTERESTED' || data.outcome === 'DEAL_CLOSED';
      const isRejected = data.outcome === 'NOT_INTERESTED';

      return {
        ...prev,
        dialsMade: prev.dialsMade + 1,
        connected: isConnected ? prev.connected + 1 : prev.connected,
        interested: isInterested ? prev.interested + 1 : prev.interested,
        rejected: isRejected ? prev.rejected + 1 : prev.rejected,
        monthlySalesAchieved: data.outcome === 'DEAL_CLOSED' ? prev.monthlySalesAchieved + 35000 : prev.monthlySalesAchieved
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
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: 'PENDING',
      appliedOn: 'Today',
    };

    setLeaveRequests(prev => [newReq, ...prev]);
    triggerToast(`✓ Leave request submitted to Team Leader`);
  };

  const simulateFaceIdCheckIn = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setProfile(prev => ({
      ...prev,
      faceIdStatus: 'VERIFIED_PRESENT',
      checkInTime: timeNow,
    }));
    triggerToast(`✓ Face ID Verified! Status: ON DUTY (${timeNow})`);
  };

  const simulateFaceIdCheckOut = () => {
    setProfile(prev => ({
      ...prev,
      faceIdStatus: 'NOT_CHECKED_IN',
    }));
    triggerToast(`✓ Day Check-Out completed successfully.`);
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
