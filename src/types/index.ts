export type UserRole = 'telecaller' | 'team_leader' | 'hr' | 'admin';

export type AuthStep = 'LOGIN' | 'FACE_SCAN' | 'ATTENDANCE_SUCCESS' | 'AUTHENTICATED';

export type NavTab = 'home' | 'calling' | 'clients' | 'leaves' | 'profile' | 'menu';

export type CallOutcome = 'CONNECTED' | 'BUSY' | 'CALLBACK' | 'INTERESTED' | 'NOT_INTERESTED' | 'DEAL_CLOSED';

export type LeadTemperature = 'HOT' | 'WARM' | 'COLD' | 'CONVERTED';

export interface TelecallerStats {
  todayGoalCalls: number;
  dialsMade: number;
  connected: number;
  interested: number;
  rejected: number;
  averageCallDurationSec: number;
  monthlySalesTarget: number;
  monthlySalesAchieved: number;
}

export interface CallLogItem {
  id: string;
  clientName: string;
  phoneNumber: string;
  companyName: string;
  timestamp: string;
  durationSec: number;
  outcome: CallOutcome;
  notes: string;
  followUpDate?: string;
}

export interface ClientLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  temperature: LeadTemperature;
  status: 'Due Today' | 'Pending' | 'Follow-up' | 'Converted';
  dueTime?: string;
  dealValue: number;
  requirement: string;
  lastContacted: string;
}

export interface AttendanceRecord {
  date: string;
  dayNumber: number;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'HALF_DAY';
  checkIn?: string;
  checkOut?: string;
  workHours?: string;
  method?: 'Face ID Biometric' | 'Geo-tagged';
}

export interface LeaveRequest {
  id: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned / Paid Leave';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  approvedBy?: string;
}

export interface PayslipItem {
  id: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  incentives: number;
  pfDeduction: number;
  taxDeduction: number;
  netPay: number;
  generatedDate: string;
  status: 'PAID';
}

export interface EmployeeProfile {
  id: string;
  empCode: string;
  name: string;
  roleTitle: string;
  department: string;
  teamName: string;
  teamLeaderName: string;
  email: string;
  phone: string;
  joinDate: string;
  bloodGroup: string;
  faceIdStatus: 'VERIFIED_PRESENT' | 'ON_BREAK' | 'NOT_CHECKED_IN';
  checkInTime: string;
  totalLeaveBalance: number;
}

export interface TeamMember {
  id: string;
  empCode: string;
  name: string;
  avatar: string;
  role: string;
  group: string;
  phone: string;
  attendanceStatus: 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'ABSENT';
  checkInTime?: string;
  checkInMethod?: 'Face ID Biometric' | 'Geo-tagged';
  dialsToday: number;
  goalCalls: number;
  connected: number;
  interested: number;
  salesAchieved: number;
  salesTarget: number;
  conversionRate: number;
}

export interface TeamGroup {
  id: string;
  name: string;
  description: string;
  leaderName: string;
  memberCount: number;
  monthlyTarget: number;
  achieved: number;
  color: string;
}

export interface TeamTask {
  id: string;
  title: string;
  assignedTo: string;
  group?: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TeamMeeting {
  id: string;
  title: string;
  dateTime: string;
  type: 'Team Standup' | 'Sales Pipeline Review' | 'Product Training' | '1-on-1 Coaching';
  location: string;
  attendeesCount: number;
  agenda: string;
}

