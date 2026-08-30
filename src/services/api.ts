import {
  EmployeeProfile,
  TelecallerStats,
  CallLogItem,
  ClientLead,
  AttendanceRecord,
  LeaveRequest,
  PayslipItem,
  TeamMember,
  TeamGroup,
  TeamTask,
  TeamMeeting,
  CandidateInterview,
  OnboardingEmployee,
  ExitEmployee,
  AssignedLead,
  LeadBatch,
  FaceBiometricProfile,
  OfferLetterData,
  PaymentVerificationItem
} from '../types';

const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
  ? 'http://localhost:5001/api' 
  : '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[API Call ${endpoint} Warning]:`, error);
    throw error;
  }
}

export const api = {
  // Profile
  getProfile: () => request<EmployeeProfile>('/profile'),
  updateProfile: (data: Partial<EmployeeProfile>) => 
    request<EmployeeProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Stats
  getStats: () => request<TelecallerStats>('/stats'),
  updateStats: (data: Partial<TelecallerStats>) => 
    request<TelecallerStats>('/stats', { method: 'PUT', body: JSON.stringify(data) }),

  // Call Logs
  getCallLogs: () => request<CallLogItem[]>('/call-logs'),
  createCallLog: (data: Omit<CallLogItem, 'id'> & { id?: string }) => 
    request<CallLogItem>('/call-logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteCallLog: (id: string) => 
    request<{ success: boolean }>('/call-logs/' + id, { method: 'DELETE' }),

  // Clients
  getClients: () => request<ClientLead[]>('/clients'),
  createClient: (data: Omit<ClientLead, 'id'> & { id?: string }) => 
    request<ClientLead>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: Partial<ClientLead>) => 
    request<ClientLead>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => 
    request<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: () => request<AttendanceRecord[]>('/attendance'),
  recordAttendance: (data: AttendanceRecord) => 
    request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id: string, data: Partial<AttendanceRecord>) => 
    request<AttendanceRecord>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Leaves
  getLeaves: () => request<LeaveRequest[]>('/leaves'),
  createLeave: (data: Omit<LeaveRequest, 'id'> & { id?: string }) => 
    request<LeaveRequest>('/leaves', { method: 'POST', body: JSON.stringify(data) }),
  updateLeave: (id: string, data: Partial<LeaveRequest>) => 
    request<LeaveRequest>(`/leaves/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Payslips
  getPayslips: () => request<PayslipItem[]>('/payslips'),
  createPayslip: (data: Omit<PayslipItem, 'id'> & { id?: string }) => 
    request<PayslipItem>('/payslips', { method: 'POST', body: JSON.stringify(data) }),
  generateBulkPayslips: (month: string, year: string) => 
    request<PayslipItem>('/payslips/bulk', { method: 'POST', body: JSON.stringify({ month, year }) }),

  // Team Members
  getTeamMembers: () => request<TeamMember[]>('/team-members'),
  createTeamMember: (data: Omit<TeamMember, 'id'> & { id?: string }) => 
    request<TeamMember>('/team-members', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id: string, data: Partial<TeamMember>) => 
    request<TeamMember>(`/team-members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Team Groups
  getTeamGroups: () => request<TeamGroup[]>('/team-groups'),
  createTeamGroup: (data: Omit<TeamGroup, 'id'> & { id?: string }) => 
    request<TeamGroup>('/team-groups', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamGroup: (id: string, data: Partial<TeamGroup>) => 
    request<TeamGroup>(`/team-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Team Tasks
  getTeamTasks: () => request<TeamTask[]>('/team-tasks'),
  createTeamTask: (data: Omit<TeamTask, 'id'> & { id?: string }) => 
    request<TeamTask>('/team-tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamTask: (id: string, data: Partial<TeamTask>) => 
    request<TeamTask>(`/team-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Team Meetings
  getTeamMeetings: () => request<TeamMeeting[]>('/team-meetings'),
  createTeamMeeting: (data: Omit<TeamMeeting, 'id'> & { id?: string }) => 
    request<TeamMeeting>('/team-meetings', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeamMeeting: (id: string) => 
    request<{ success: boolean }>(`/team-meetings/${id}`, { method: 'DELETE' }),

  // Candidates / Interviews
  getInterviews: () => request<CandidateInterview[]>('/interviews'),
  createInterview: (data: Omit<CandidateInterview, 'id'> & { id?: string }) => 
    request<CandidateInterview>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  updateInterview: (id: string, data: Partial<CandidateInterview>) => 
    request<CandidateInterview>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Onboarding
  getOnboarding: () => request<OnboardingEmployee[]>('/onboarding'),
  createOnboarding: (data: OnboardingEmployee) => 
    request<OnboardingEmployee>('/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  updateOnboarding: (id: string, data: Partial<OnboardingEmployee>) => 
    request<OnboardingEmployee>(`/onboarding/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Exit Employees
  getExitEmployees: () => request<ExitEmployee[]>('/exit-employees'),
  createExitEmployee: (data: ExitEmployee) => 
    request<ExitEmployee>('/exit-employees', { method: 'POST', body: JSON.stringify(data) }),
  updateExitEmployee: (id: string, data: Partial<ExitEmployee>) => 
    request<ExitEmployee>(`/exit-employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Assigned Leads
  getAssignedLeads: () => request<AssignedLead[]>('/assigned-leads'),
  createAssignedLead: (data: Omit<AssignedLead, 'id'> & { id?: string }) => 
    request<AssignedLead>('/assigned-leads', { method: 'POST', body: JSON.stringify(data) }),
  bulkImportAssignedLeads: (fileName: string, targetEmployeeId: string, targetEmployeeName: string, leads: any[]) => 
    request<{ batch: LeadBatch; leads: AssignedLead[] }>('/assigned-leads/bulk', {
      method: 'POST',
      body: JSON.stringify({ fileName, targetEmployeeId, targetEmployeeName, leads }),
    }),
  updateAssignedLead: (id: string, data: Partial<AssignedLead>) => 
    request<AssignedLead>(`/assigned-leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Lead Batches
  getLeadBatches: () => request<LeadBatch[]>('/lead-batches'),
  createLeadBatch: (data: Omit<LeadBatch, 'id'> & { id?: string }) => 
    request<LeadBatch>('/lead-batches', { method: 'POST', body: JSON.stringify(data) }),

  // Biometrics
  getBiometrics: () => request<FaceBiometricProfile[]>('/biometrics'),
  registerBiometric: (data: FaceBiometricProfile) => 
    request<FaceBiometricProfile>('/biometrics', { method: 'POST', body: JSON.stringify(data) }),
  verifyBiometric: (employeeId?: string) => 
    request<{ verified: boolean; checkInTime: string; status: string }>('/biometrics/verify', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),

  // Offer Letters
  getOfferLetters: () => request<OfferLetterData[]>('/offer-letters'),
  createOfferLetter: (data: Omit<OfferLetterData, 'id'> & { id?: string }) => 
    request<OfferLetterData>('/offer-letters', { method: 'POST', body: JSON.stringify(data) }),

  // Payments
  getPayments: () => request<PaymentVerificationItem[]>('/payments'),
  createPayment: (data: Omit<PaymentVerificationItem, 'id'> & { id?: string }) => 
    request<PaymentVerificationItem>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id: string, data: Partial<PaymentVerificationItem>) => 
    request<PaymentVerificationItem>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
