import db from './connection.js';

export function seedInitialDataIfEmpty() {
  const profileCount = (db.prepare('SELECT COUNT(*) as count FROM employee_profiles').get() as { count: number }).count;
  
  if (profileCount > 0) {
    console.log('[SQLite DB] Tables already contain data, skipping initial seeding.');
    return;
  }

  console.log('[SQLite DB] Seeding initial data into tables...');

  // 1. Employee Profile
  const insertProfile = db.prepare(`
    INSERT INTO employee_profiles (id, empCode, name, roleTitle, department, teamName, teamLeaderName, email, phone, joinDate, bloodGroup, faceIdStatus, checkInTime, totalLeaveBalance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run(
    'emp-101', 'TNX-8492', 'Arjun Kumar', 'Senior Telecaller / SDR', 
    'Sales & Client Acquisition', 'Alpha Growth Team', 'Ramesh Sharma',
    'arjun.k@tradenexus.io', '+91 98450 12345', '12 Jan 2024',
    'O+ Positive', 'VERIFIED_PRESENT', '09:12 AM', 14
  );

  // 2. Telecaller Stats
  const insertStats = db.prepare(`
    INSERT INTO telecaller_stats (id, todayGoalCalls, dialsMade, connected, interested, rejected, averageCallDurationSec, monthlySalesTarget, monthlySalesAchieved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStats.run('stats-default', 100, 68, 44, 12, 12, 185, 200000, 145000);

  // 3. Call Logs
  const insertCallLog = db.prepare(`
    INSERT INTO call_logs (id, clientName, companyName, phoneNumber, timestamp, durationSec, outcome, notes, followUpDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const callLogs = [
    { id: 'call-1', clientName: 'Vikram Mehta', companyName: 'Apex Global Corp', phoneNumber: '+91 98765 43210', timestamp: '09:45 AM', durationSec: 240, outcome: 'INTERESTED', notes: 'Requested complete product pricing demo. Scheduled callback for 10:00 AM.', followUpDate: 'Today, 10:00 AM' },
    { id: 'call-2', clientName: 'Pooja Agarwal', companyName: 'Zenith Logistics', phoneNumber: '+91 98111 22334', timestamp: '09:32 AM', durationSec: 320, outcome: 'DEAL_CLOSED', notes: 'Agreed on Annual Enterprise Plan. Payment confirmation pending.', followUpDate: null },
    { id: 'call-3', clientName: 'Rahul Verma', companyName: 'Nova FinTech', phoneNumber: '+91 97222 33445', timestamp: '09:20 AM', durationSec: 45, outcome: 'BUSY', notes: 'Line busy. Set reminder to retry in afternoon.', followUpDate: 'Today, 02:30 PM' },
    { id: 'call-4', clientName: 'Sanjay Reddy', companyName: 'Metro Health Systems', phoneNumber: '+91 96333 44556', timestamp: '09:15 AM', durationSec: 150, outcome: 'NOT_INTERESTED', notes: 'Already using another CRM solution. Re-contact in 6 months.', followUpDate: null }
  ];
  for (const item of callLogs) {
    insertCallLog.run(item.id, item.clientName, item.companyName, item.phoneNumber, item.timestamp, item.durationSec, item.outcome, item.notes, item.followUpDate);
  }

  // 4. Client Leads
  const insertClientLead = db.prepare(`
    INSERT INTO client_leads (id, name, company, phone, email, temperature, status, dueTime, dealValue, requirement, lastContacted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const clientLeads = [
    { id: 'lead-1', name: 'Vikram Mehta', company: 'Apex Global Corp', phone: '+91 98765 43210', email: 'vikram@apexglobal.com', temperature: 'HOT', status: 'Due Today', dueTime: '10:00 AM (Due in 15 mins)', dealValue: 45000, requirement: 'Product Demo & Custom Pricing Review', lastContacted: 'Today, 09:45 AM' },
    { id: 'lead-2', name: 'Pooja Agarwal', company: 'Zenith Logistics', phone: '+91 98111 22334', email: 'pooja@zenithlog.in', temperature: 'CONVERTED', status: 'Converted', dueTime: null, dealValue: 80000, requirement: 'Annual Enterprise Plan Sign-off', lastContacted: 'Today, 09:32 AM' },
    { id: 'lead-3', name: 'Deepak Singhal', company: 'Singhal Trading Co.', phone: '+91 99444 55667', email: 'deepak@singhaltrade.com', temperature: 'HOT', status: 'Due Today', dueTime: '11:30 AM', dealValue: 35000, requirement: 'Quote comparison with existing software', lastContacted: 'Yesterday, 04:15 PM' },
    { id: 'lead-4', name: 'Ananya Roy', company: 'Roy Digital Studios', phone: '+91 98222 33119', email: 'ananya@roystudios.io', temperature: 'WARM', status: 'Pending', dueTime: null, dealValue: 20000, requirement: 'Team Management & Attendance tracking', lastContacted: '2 days ago' },
    { id: 'lead-5', name: 'Karan Malhotra', company: 'Karan Exports Ltd', phone: '+91 97111 44558', email: 'karan@karanexports.com', temperature: 'WARM', status: 'Follow-up', dueTime: null, dealValue: 50000, requirement: 'Requested WhatsApp presentation deck', lastContacted: '3 days ago' }
  ];
  for (const lead of clientLeads) {
    insertClientLead.run(lead.id, lead.name, lead.company, lead.phone, lead.email, lead.temperature, lead.status, lead.dueTime, lead.dealValue, lead.requirement, lead.lastContacted);
  }

  // 5. Attendance Records
  const insertAttendance = db.prepare(`
    INSERT INTO attendance_records (id, date, dayNumber, status, checkIn, checkOut, workHours, method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const attendances = [
    { id: 'att-28', date: '2025-05-28', dayNumber: 28, status: 'PRESENT', checkIn: '09:12 AM', checkOut: '06:30 PM', workHours: '9h 18m', method: 'Face ID Biometric' },
    { id: 'att-27', date: '2025-05-27', dayNumber: 27, status: 'PRESENT', checkIn: '09:05 AM', checkOut: '06:15 PM', workHours: '9h 10m', method: 'Face ID Biometric' },
    { id: 'att-26', date: '2025-05-26', dayNumber: 26, status: 'PRESENT', checkIn: '09:14 AM', checkOut: '06:40 PM', workHours: '9h 26m', method: 'Face ID Biometric' },
    { id: 'att-25', date: '2025-05-25', dayNumber: 25, status: 'HOLIDAY', checkIn: null, checkOut: null, workHours: null, method: null },
    { id: 'att-24', date: '2025-05-24', dayNumber: 24, status: 'HOLIDAY', checkIn: null, checkOut: null, workHours: null, method: null },
    { id: 'att-23', date: '2025-05-23', dayNumber: 23, status: 'PRESENT', checkIn: '09:10 AM', checkOut: '06:20 PM', workHours: '9h 10m', method: 'Face ID Biometric' },
    { id: 'att-22', date: '2025-05-22', dayNumber: 22, status: 'LEAVE', checkIn: null, checkOut: null, workHours: '0h 00m', method: null },
    { id: 'att-21', date: '2025-05-21', dayNumber: 21, status: 'PRESENT', checkIn: '09:15 AM', checkOut: '06:05 PM', workHours: '8h 50m', method: 'Face ID Biometric' },
  ];
  for (const a of attendances) {
    insertAttendance.run(a.id, a.date, a.dayNumber, a.status, a.checkIn, a.checkOut, a.workHours, a.method);
  }

  // 6. Leave Requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (id, leaveType, fromDate, toDate, totalDays, reason, status, appliedOn, approvedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLeave.run('leave-1', 'Casual Leave', '22 May 2025', '22 May 2025', 1, 'Family personal commitment in hometown', 'APPROVED', '20 May 2025', 'Ramesh Sharma (Team Leader)');
  insertLeave.run('leave-2', 'Sick Leave', '05 Jun 2025', '06 Jun 2025', 2, 'Scheduled medical health checkup', 'PENDING', 'Today', null);

  // 7. Payslips
  const insertPayslip = db.prepare(`
    INSERT INTO payslips (id, month, year, basicSalary, hra, specialAllowance, incentives, pfDeduction, taxDeduction, netPay, generatedDate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPayslip.run('pay-2025-04', 'April', 2025, 28000, 12000, 6000, 14500, 2400, 1800, 56300, '01 May 2025', 'PAID');
  insertPayslip.run('pay-2025-03', 'March', 2025, 28000, 12000, 6000, 18200, 2400, 2100, 59700, '01 Apr 2025', 'PAID');

  // 8. Team Members
  const insertTeamMember = db.prepare(`
    INSERT INTO team_members (id, empCode, name, avatar, role, groupName, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const members = [
    { id: 'tm-1', empCode: 'TNX-8492', name: 'Arjun Kumar', avatar: 'AK', role: 'Senior Telecaller / SDR', groupName: 'HNI Closers', phone: '+91 98450 12345', attendanceStatus: 'PRESENT', checkInTime: '09:12 AM', checkInMethod: 'Face ID Biometric', dialsToday: 68, goalCalls: 100, connected: 44, interested: 12, salesAchieved: 145000, salesTarget: 200000, conversionRate: 17.6 },
    { id: 'tm-2', empCode: 'TNX-8493', name: 'Priya Nair', avatar: 'PN', role: 'Inside Sales Specialist', groupName: 'HNI Closers', phone: '+91 98450 67890', attendanceStatus: 'PRESENT', checkInTime: '09:05 AM', checkInMethod: 'Face ID Biometric', dialsToday: 82, goalCalls: 100, connected: 58, interested: 16, salesAchieved: 190000, salesTarget: 200000, conversionRate: 19.5 },
    { id: 'tm-3', empCode: 'TNX-8495', name: 'Rahul Varma', avatar: 'RV', role: 'Telecaller Executive', groupName: 'Inbound Qualifiers', phone: '+91 98450 44556', attendanceStatus: 'PRESENT', checkInTime: '09:28 AM', checkInMethod: 'Geo-tagged', dialsToday: 51, goalCalls: 90, connected: 32, interested: 7, salesAchieved: 95000, salesTarget: 180000, conversionRate: 13.7 },
    { id: 'tm-4', empCode: 'TNX-8498', name: 'Sneha Patil', avatar: 'SP', role: 'Telecaller Executive', groupName: 'Inbound Qualifiers', phone: '+91 98450 77889', attendanceStatus: 'LATE', checkInTime: '10:15 AM', checkInMethod: 'Face ID Biometric', dialsToday: 39, goalCalls: 90, connected: 21, interested: 5, salesAchieved: 65000, salesTarget: 180000, conversionRate: 12.8 },
    { id: 'tm-5', empCode: 'TNX-8501', name: 'Rohan Joshi', avatar: 'RJ', role: 'Junior Telecaller', groupName: 'Retention Squad', phone: '+91 98450 99001', attendanceStatus: 'ON_LEAVE', checkInTime: null, checkInMethod: null, dialsToday: 0, goalCalls: 80, connected: 0, interested: 0, salesAchieved: 40000, salesTarget: 150000, conversionRate: 0 },
    { id: 'tm-6', empCode: 'TNX-8504', name: 'Kavita Menon', avatar: 'KM', role: 'Inside Sales Specialist', groupName: 'Retention Squad', phone: '+91 98450 22334', attendanceStatus: 'PRESENT', checkInTime: '08:58 AM', checkInMethod: 'Face ID Biometric', dialsToday: 74, goalCalls: 100, connected: 49, interested: 11, salesAchieved: 160000, salesTarget: 200000, conversionRate: 14.8 }
  ];
  for (const m of members) {
    insertTeamMember.run(m.id, m.empCode, m.name, m.avatar, m.role, m.groupName, m.phone, m.attendanceStatus, m.checkInTime, m.checkInMethod, m.dialsToday, m.goalCalls, m.connected, m.interested, m.salesAchieved, m.salesTarget, m.conversionRate);
  }

  // 9. Team Groups
  const insertGroup = db.prepare(`
    INSERT INTO team_groups (id, name, description, leaderName, memberCount, monthlyTarget, achieved, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const groups = [
    { id: 'grp-1', name: 'HNI Closers', description: 'High-ticket corporate clients & enterprise accounts', leaderName: 'Priya Nair', memberCount: 2, monthlyTarget: 400000, achieved: 335000, color: '#00C9A7' },
    { id: 'grp-2', name: 'Inbound Qualifiers', description: 'Fresh web leads, Google Ads, and campaign inquiries', leaderName: 'Rahul Varma', memberCount: 2, monthlyTarget: 360000, achieved: 160000, color: '#00B4D8' },
    { id: 'grp-3', name: 'Retention Squad', description: 'Account renewals, upsells & feedback calls', leaderName: 'Kavita Menon', memberCount: 2, monthlyTarget: 350000, achieved: 200000, color: '#F59E0B' }
  ];
  for (const g of groups) {
    insertGroup.run(g.id, g.name, g.description, g.leaderName, g.memberCount, g.monthlyTarget, g.achieved, g.color);
  }

  // 10. Team Tasks
  const insertTask = db.prepare(`
    INSERT INTO team_tasks (id, title, assignedTo, groupName, dueDate, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tasks = [
    { id: 'task-101', title: 'Follow up on 15 high-value enterprise leads for month-end close', assignedTo: 'Arjun Kumar', groupName: 'HNI Closers', dueDate: 'Today, 05:00 PM', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'task-102', title: 'Clear pending WhatsApp demo follow-ups from yesterday webinar', assignedTo: 'Priya Nair', groupName: 'HNI Closers', dueDate: 'Today, 06:30 PM', priority: 'HIGH', status: 'PENDING' },
    { id: 'task-103', title: 'Re-dial 25 unanswered inbound leads from Q2 campaign', assignedTo: 'Rahul Varma', groupName: 'Inbound Qualifiers', dueDate: 'Tomorrow, 02:00 PM', priority: 'MEDIUM', status: 'PENDING' }
  ];
  for (const t of tasks) {
    insertTask.run(t.id, t.title, t.assignedTo, t.groupName, t.dueDate, t.priority, t.status);
  }

  // 11. Team Meetings
  const insertMeeting = db.prepare(`
    INSERT INTO team_meetings (id, title, dateTime, type, location, attendeesCount, agenda)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertMeeting.run('mtg-1', 'Daily Morning Huddle & Target Review', 'Today • 09:30 AM - 09:50 AM', 'Team Standup', 'Conference Room 2 & Google Meet', 6, 'Review hourly dial quotas, share objection handling techniques, and address blocked leads.');
  insertMeeting.run('mtg-2', 'High-Ticket Objections & Pricing Coaching', 'Tomorrow • 04:00 PM - 04:45 PM', 'Product Training', 'Main Training Bay', 4, 'Deep dive into handling price objections and closing enterprise annual subscriptions.');

  // 12. Candidate Interviews
  const insertCandidate = db.prepare(`
    INSERT INTO candidate_interviews (id, candidateName, roleApplied, experience, email, phone, status, interviewTime, interviewer, rating, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCandidate.run('cand-1', 'Siddharth Rao', 'Senior Telecaller Specialist', '3.5 Yrs in FinTech Sales', 'siddharth.rao@gmail.com', '+91 98190 22334', 'INTERVIEW_SCHEDULED', 'Today • 03:30 PM', 'Ramesh Sharma (Team Leader)', 4.5, 'Strong telecalling pitch. Scheduled Round 2 technical demo.');
  insertCandidate.run('cand-2', 'Megha Nair', 'SDR Team Lead', '5 Yrs in Enterprise Sales', 'megha.nair@outlook.com', '+91 98765 11223', 'OFFER_EXTENDED', 'Completed (Cleared)', 'Pooja Hegde (HR Head)', 4.8, 'Offer letter dispatched with CTC ₹9.5 LPA. Joining scheduled for 01 June 2025.');
  insertCandidate.run('cand-3', 'Anil Kapoor', 'Inside Sales Representative', '1.5 Yrs in B2B Calling', 'anil.k@gmail.com', '+91 98330 99887', 'SCREENING', 'Tomorrow • 11:00 AM', 'Pooja Hegde (HR)', null, 'Resume screened. Good English & Hindi communication.');

  // 13. Onboarding Employees
  const insertOnboarding = db.prepare(`
    INSERT INTO onboarding_employees (id, empCode, name, role, department, joiningDate, probationEnd, status, documentsVerified, workstationAllocated, biometricEnrolled, trainingScheduled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOnboarding.run('onb-1', 'TNX-8510', 'Vikram Joshi', 'Telecaller Executive', 'Sales & Client Acquisition', '01 May 2025', '01 Nov 2025 (3 Months Remaining)', 'IN_PROGRESS', 1, 1, 1, 0);
  insertOnboarding.run('onb-2', 'TNX-8512', 'Ananya Roy', 'Inside Sales Associate', 'Alpha Growth Team', '15 May 2025', '15 Nov 2025', 'DOCS_PENDING', 0, 1, 0, 0);

  // 14. Exit Employees
  const insertExit = db.prepare(`
    INSERT INTO exit_employees (id, empCode, name, role, department, resignationDate, lastWorkingDay, status, assetsReturned, accountsSettled, knowledgeTransfer, relievingLetterIssued)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExit.run('exit-1', 'TNX-8390', 'Manish Pandey', 'Junior Telecaller', 'Retention Squad', '10 May 2025', '31 May 2025', 'CLEARANCE_PENDING', 1, 0, 1, 0);

  // 15. Assigned Leads
  const insertAssignedLead = db.prepare(`
    INSERT INTO assigned_leads (id, name, phone, email, company, city, assignedToEmployeeId, assignedToEmployeeName, batchId, assignedDate, status, notes, callCount, lastCallTimestamp, dealValue, followUpDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const assignedLeads = [
    { id: 'asg-1', name: 'Suresh Raina', phone: '+91 98451 11223', email: 'suresh.r@primeglobal.com', company: 'Prime Global Logistics', city: 'Mumbai', assignedToEmployeeId: 'emp-101', assignedToEmployeeName: 'Arjun Kumar', batchId: 'batch-1', assignedDate: 'Today', status: 'PENDING', notes: 'Imported from B2B Logistics Database', callCount: 0, lastCallTimestamp: null, dealValue: 0, followUpDate: null },
    { id: 'asg-2', name: 'Meera Nambiar', phone: '+91 97312 33445', email: 'meera@finedge.in', company: 'FinEdge Advisory Corp', city: 'Bengaluru', assignedToEmployeeId: 'emp-101', assignedToEmployeeName: 'Arjun Kumar', batchId: 'batch-1', assignedDate: 'Today', status: 'INTERESTED', notes: 'Interested in Premium SaaS plan. Send quote by 3 PM.', callCount: 1, lastCallTimestamp: '10:45 AM', dealValue: 75000, followUpDate: null },
    { id: 'asg-3', name: 'Kavita Sharma', phone: '+91 99001 88776', email: 'kavita@apexretail.com', company: 'Apex Retailers Hub', city: 'Delhi NCR', assignedToEmployeeId: 'emp-101', assignedToEmployeeName: 'Arjun Kumar', batchId: 'batch-1', assignedDate: 'Today', status: 'CALLBACK', notes: 'Requested callback after 4:00 PM today.', callCount: 1, lastCallTimestamp: '11:15 AM', dealValue: 0, followUpDate: 'Today, 04:00 PM' },
    { id: 'asg-4', name: 'Rohan Deshmukh', phone: '+91 96112 44556', email: 'rohan.d@omnitrade.in', company: 'OmniTrade Solutions', city: 'Pune', assignedToEmployeeId: 'emp-102', assignedToEmployeeName: 'Nikhil Sharma', batchId: 'batch-2', assignedDate: 'Today', status: 'PENDING', notes: 'Allocated batch for Nikhil', callCount: 0, lastCallTimestamp: null, dealValue: 0, followUpDate: null },
    { id: 'asg-5', name: 'Deepak Chawla', phone: '+91 98223 99881', email: 'deepak@zenith.com', company: 'Zenith Logistics Tech', city: 'Hyderabad', assignedToEmployeeId: 'emp-102', assignedToEmployeeName: 'Nikhil Sharma', batchId: 'batch-2', assignedDate: 'Today', status: 'CONNECTED', notes: 'Spoke with CFO. Exploring multi-user license.', callCount: 1, lastCallTimestamp: '09:50 AM', dealValue: 0, followUpDate: null },
    { id: 'asg-6', name: 'Alok Aggarwal', phone: '+91 97441 22334', email: 'alok@bharatexport.com', company: 'Bharat Export Corp', city: 'Surat', assignedToEmployeeId: 'emp-103', assignedToEmployeeName: 'Kailash Verma', batchId: 'batch-3', assignedDate: 'Today', status: 'PENDING', notes: 'Batch for Kailash', callCount: 0, lastCallTimestamp: null, dealValue: 0, followUpDate: null }
  ];
  for (const asg of assignedLeads) {
    insertAssignedLead.run(asg.id, asg.name, asg.phone, asg.email, asg.company, asg.city, asg.assignedToEmployeeId, asg.assignedToEmployeeName, asg.batchId, asg.assignedDate, asg.status, asg.notes, asg.callCount, asg.lastCallTimestamp, asg.dealValue, asg.followUpDate);
  }

  // 16. Lead Batches
  const insertBatch = db.prepare(`
    INSERT INTO lead_batches (id, fileName, uploadedAt, totalLeads, assignedToEmployeeName, assignedToEmployeeId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertBatch.run('batch-1', 'B2B_Q3_HighValue_Leads.xlsx', 'Today, 09:00 AM', 50, 'Arjun Kumar', 'emp-101');
  insertBatch.run('batch-2', 'Tech_Enterprises_South.csv', 'Today, 09:15 AM', 100, 'Nikhil Sharma', 'emp-102');
  insertBatch.run('batch-3', 'Logistics_Manufacturing_Batch4.xlsx', 'Today, 09:30 AM', 75, 'Kailash Verma', 'emp-103');

  // 17. Face Biometrics
  const insertFace = db.prepare(`
    INSERT INTO face_biometric_profiles (employeeId, employeeName, registeredPhoto, registeredAt, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertFace.run('emp-101', 'Arjun Kumar', '', '12 Jan 2024', 'REGISTERED');
  insertFace.run('emp-102', 'Nikhil Sharma', '', '01 Feb 2024', 'REGISTERED');

  // 18. Offer Letters
  const insertOffer = db.prepare(`
    INSERT INTO offer_letters (id, candidateName, candidateEmail, candidatePhone, roleTitle, department, annualCtc, monthlyGross, joiningDate, reportingManager, location, issuedDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOffer.run('off-1', 'Srihari Nair', 'srihari.n@gmail.com', '+91 98450 67890', 'Telecaller Executive', 'Sales & Client Acquisition', 360000, 30000, '01 Jun 2025', 'Ramesh Sharma (Team Leader)', 'Bengaluru Corporate HQ', '28 May 2025');

  // 19. Payment Verifications
  const insertPayment = db.prepare(`
    INSERT INTO payment_verifications (id, leadName, companyName, telecallerName, dealAmount, utrNumber, paymentMode, timestamp, status, receiptUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPayment.run('pay-1', 'Rajesh Singhania', 'Singhania Logistics Ltd', 'Arjun Kumar', 85000, 'HDFC948295820491', 'NEFT / RTGS', 'Today, 11:45 AM', 'PENDING_HR_AUDIT', null);
  insertPayment.run('pay-2', 'Vikram Mehta', 'Mehta Global Logistics', 'Priya Nair', 120000, 'ICIC849204928104', 'Corporate Net Banking', 'Yesterday, 04:15 PM', 'VERIFIED', null);

  console.log('[SQLite DB] Initial data successfully seeded.');
}
