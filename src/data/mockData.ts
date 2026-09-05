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
  PaymentVerificationItem, 
  AssignedLead, 
  LeadBatch, 
  FaceBiometricProfile, 
  OfferLetterData, 
  CompanyHoliday 
} from '../types';

export const INITIAL_COMPANY_HOLIDAYS: CompanyHoliday[] = [
  { id: 'hol-1', name: 'Republic Day', date: '2026-01-26', type: 'NATIONAL' },
  { id: 'hol-2', name: 'Maha Shivratri', date: '2026-02-15', type: 'FESTIVAL' },
  { id: 'hol-3', name: 'Holi Festival', date: '2026-03-03', type: 'FESTIVAL' },
  { id: 'hol-4', name: 'Eid-ul-Fitr', date: '2026-03-20', type: 'FESTIVAL' },
  { id: 'hol-5', name: 'Dr. Ambedkar Jayanti', date: '2026-04-14', type: 'NATIONAL' },
  { id: 'hol-6', name: 'May Day', date: '2026-05-01', type: 'COMPANY' },
  { id: 'hol-7', name: 'Bakrid / Eid al-Adha', date: '2026-05-27', type: 'FESTIVAL' },
  { id: 'hol-8', name: 'Muharram', date: '2026-06-26', type: 'FESTIVAL' },
  { id: 'hol-9', name: 'Independence Day', date: '2026-08-15', type: 'NATIONAL' },
  { id: 'hol-10', name: 'Ganesh Chaturthi', date: '2026-09-14', type: 'FESTIVAL' },
  { id: 'hol-11', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', type: 'NATIONAL' },
  { id: 'hol-12', name: 'Dussehra / Vijayadashami', date: '2026-10-20', type: 'FESTIVAL' },
  { id: 'hol-13', name: 'Diwali Festival', date: '2026-11-08', type: 'FESTIVAL' },
  { id: 'hol-14', name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'FESTIVAL' },
  { id: 'hol-15', name: 'Christmas Day', date: '2026-12-25', type: 'FESTIVAL' },
];

export const INITIAL_PROFILE: EmployeeProfile = {
  id: 'emp-101',
  empCode: 'TNX-8492',
  name: 'Arjun Kumar',
  roleTitle: 'Sales Executive',
  department: 'Sales & Client Acquisition',
  teamName: 'Alpha Growth Team',
  teamLeaderName: 'Ramesh Sharma',
  email: 'arjun@tradenexus.com',
  phone: '+91 98450 12345',
  joinDate: '12 Jan 2024',
  bloodGroup: 'O+ Positive',
  faceIdStatus: 'NOT_CHECKED_IN',
  checkInTime: '',
  totalLeaveBalance: 14,
};

export const INITIAL_TELECALLER_STATS: TelecallerStats = {
  todayGoalCalls: 100,
  dialsMade: 0,
  connected: 0,
  interested: 0,
  rejected: 0,
  averageCallDurationSec: 0,
  monthlySalesTarget: 200000,
  monthlySalesAchieved: 0,
};

export const INITIAL_CALL_LOGS: CallLogItem[] = [];

export const INITIAL_CLIENT_LEADS: ClientLead[] = [];

export const INITIAL_ATTENDANCE_LOGS: AttendanceRecord[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_PAYSLIPS: PayslipItem[] = [];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    empCode: 'TNX-8492',
    name: 'Arjun Kumar',
    avatar: 'AK',
    role: 'Sales Executive',
    group: 'HNI Closers',
    phone: '+91 98450 12345',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 100,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 200000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'arjun@tradenexus.com',
  },
  {
    id: 'tm-2',
    empCode: 'TNX-8493',
    name: 'Priya Nair',
    avatar: 'PN',
    role: 'Inside Sales Specialist',
    group: 'HNI Closers',
    phone: '+91 98450 67890',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 100,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 200000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'priya@tradenexus.com',
  },
  {
    id: 'tm-3',
    empCode: 'TNX-8495',
    name: 'Rahul Varma',
    avatar: 'RV',
    role: 'Sales Executive',
    group: 'Inbound Qualifiers',
    phone: '+91 98450 44556',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 100,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 180000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'rahul@tradenexus.com',
  },
  {
    id: 'tm-4',
    empCode: 'TNX-8498',
    name: 'Sneha Patil',
    avatar: 'SP',
    role: 'Sales Executive',
    group: 'Inbound Qualifiers',
    phone: '+91 98450 77889',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 100,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 180000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'sneha@tradenexus.com',
  },
  {
    id: 'tm-5',
    empCode: 'TNX-8501',
    name: 'Rohan Joshi',
    avatar: 'RJ',
    role: 'Associate Sales Executive',
    group: 'Retention Squad',
    phone: '+91 98450 99001',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 80,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 150000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'rohan@tradenexus.com',
  },
  {
    id: 'tm-6',
    empCode: 'TNX-8504',
    name: 'Kavita Menon',
    avatar: 'KM',
    role: 'Inside Sales Specialist',
    group: 'Retention Squad',
    phone: '+91 98450 22334',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 100,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 200000,
    conversionRate: 0,
    portal: 'telecaller',
    email: 'kavita@tradenexus.com',
  },
  {
    id: 'tm-7',
    empCode: 'TNX-TL01',
    name: 'Nikhil Pareshan',
    avatar: 'NP',
    role: 'Sales Team Leader',
    group: 'Leadership',
    phone: '+91 98450 33445',
    attendanceStatus: 'ABSENT',
    checkInTime: '',
    checkInMethod: '',
    dialsToday: 0,
    goalCalls: 50,
    connected: 0,
    interested: 0,
    salesAchieved: 0,
    salesTarget: 500000,
    conversionRate: 0,
    portal: 'team_leader',
    email: 'nikhil@tradenexus.com',
  }
];

export const INITIAL_TEAM_GROUPS: TeamGroup[] = [
  {
    id: 'grp-1',
    name: 'HNI Closers',
    description: 'High-ticket corporate clients & enterprise accounts',
    leaderName: 'Priya Nair',
    memberCount: 2,
    monthlyTarget: 400000,
    achieved: 0,
    color: '#00C9A7',
  },
  {
    id: 'grp-2',
    name: 'Inbound Qualifiers',
    description: 'Fresh web leads, campaign inquiries and fast qualification',
    leaderName: 'Rahul Varma',
    memberCount: 2,
    monthlyTarget: 360000,
    achieved: 0,
    color: '#00B4D8',
  },
  {
    id: 'grp-3',
    name: 'Retention Squad',
    description: 'Account renewals, upsells & client success calls',
    leaderName: 'Kavita Menon',
    memberCount: 2,
    monthlyTarget: 350000,
    achieved: 0,
    color: '#F59E0B',
  }
];

export const INITIAL_TEAM_TASKS: TeamTask[] = [];

export const INITIAL_TEAM_MEETINGS: TeamMeeting[] = [];

export const INITIAL_CANDIDATES: CandidateInterview[] = [];

export const INITIAL_ONBOARDING: OnboardingEmployee[] = [];

export const INITIAL_EXIT_LIST: ExitEmployee[] = [];

export const INITIAL_PAYMENTS: PaymentVerificationItem[] = [];

export const INITIAL_ASSIGNED_LEADS: AssignedLead[] = [];

export const INITIAL_LEAD_BATCHES: LeadBatch[] = [];

export const INITIAL_FACE_PROFILES: FaceBiometricProfile[] = [];

export const INITIAL_OFFER_LETTERS: OfferLetterData[] = [];

export const INITIAL_PAYMENT_VERIFICATIONS: PaymentVerificationItem[] = [];
