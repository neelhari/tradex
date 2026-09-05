import db from './connection.js';
import { hashPassword } from './authUtils.js';

export function seedUsersIfEmpty() {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    if (userCount > 0) return;

    console.log('[SQLite DB] Seeding default auth user credentials...');
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, passwordHash, name, role, empCode, employeeId, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      { id: 'usr-1', email: 'arjun@tradenexus.com', password: 'telecaller123', name: 'Arjun Kumar', role: 'telecaller', empCode: 'TNX-8492', employeeId: 'emp-101' },
      { id: 'usr-2', email: 'nikhil@tradenexus.com', password: 'leader123', name: 'Nikhil Pareshan', role: 'team_leader', empCode: 'TNX-TL01', employeeId: 'emp-tl-1' },
      { id: 'usr-3', email: 'hr@tradenexus.com', password: 'hr123', name: 'Pooja Sharma', role: 'hr', empCode: 'TNX-HR01', employeeId: 'emp-hr-1' },
      { id: 'usr-4', email: 'admin@tradenexus.com', password: 'admin123', name: 'Super Admin', role: 'admin', empCode: 'TNX-AD01', employeeId: 'emp-ad-1' }
    ];

    for (const u of users) {
      const hash = hashPassword(u.password);
      insertUser.run(u.id, u.email, hash, u.name, u.role, u.empCode, u.employeeId, 1);
    }
    console.log('[SQLite DB] 4 default user accounts seeded.');
  } catch (err) {
    console.error('[SQLite DB] Error seeding users:', err);
  }
}

export function seedInitialDataIfEmpty() {
  seedUsersIfEmpty();

  const profileCount = (db.prepare('SELECT COUNT(*) as count FROM employee_profiles').get() as { count: number }).count;
  
  if (profileCount > 0) {
    console.log('[SQLite DB] Tables already contain data, skipping initial seeding.');
    return;
  }

  console.log('[SQLite DB] Initializing clean database state (0 dummy leads, 0 fake calls, 0 fake money)...');

  // 1. Employee Profile (Clean slate: Not punched in)
  const insertProfile = db.prepare(`
    INSERT INTO employee_profiles (id, empCode, name, roleTitle, department, teamName, teamLeaderName, email, phone, joinDate, bloodGroup, faceIdStatus, checkInTime, totalLeaveBalance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run(
    'emp-101', 'TNX-8492', 'Arjun Kumar', 'Sales Executive', 
    'Sales & Client Acquisition', 'Alpha Growth Team', 'Ramesh Sharma',
    'arjun@tradenexus.com', '+91 98450 12345', '12 Jan 2024',
    'O+ Positive', 'NOT_CHECKED_IN', '', 14
  );

  // 2. Telecaller Stats (Clean 0s)
  const insertStats = db.prepare(`
    INSERT INTO telecaller_stats (id, todayGoalCalls, dialsMade, connected, interested, rejected, averageCallDurationSec, monthlySalesTarget, monthlySalesAchieved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStats.run('stats-default', 100, 0, 0, 0, 0, 0, 200000, 0);

  // 3. Team Members (Clean initial roster: Absent until punched in, 0 dials, 0 sales)
  const insertTeamMember = db.prepare(`
    INSERT INTO team_members (id, empCode, name, avatar, role, groupName, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const members = [
    { id: 'tm-1', empCode: 'TNX-8492', name: 'Arjun Kumar', avatar: 'AK', role: 'Sales Executive', groupName: 'HNI Closers', phone: '+91 98450 12345', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 100, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 200000, conversionRate: 0 },
    { id: 'tm-2', empCode: 'TNX-8493', name: 'Priya Nair', avatar: 'PN', role: 'Inside Sales Specialist', groupName: 'HNI Closers', phone: '+91 98450 67890', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 100, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 200000, conversionRate: 0 },
    { id: 'tm-3', empCode: 'TNX-8495', name: 'Rahul Varma', avatar: 'RV', role: 'Sales Executive', groupName: 'Inbound Qualifiers', phone: '+91 98450 44556', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 100, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 180000, conversionRate: 0 },
    { id: 'tm-4', empCode: 'TNX-8498', name: 'Sneha Patil', avatar: 'SP', role: 'Sales Executive', groupName: 'Inbound Qualifiers', phone: '+91 98450 77889', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 100, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 180000, conversionRate: 0 },
    { id: 'tm-5', empCode: 'TNX-8501', name: 'Rohan Joshi', avatar: 'RJ', role: 'Associate Sales Executive', groupName: 'Retention Squad', phone: '+91 98450 99001', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 80, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 150000, conversionRate: 0 },
    { id: 'tm-6', empCode: 'TNX-8504', name: 'Kavita Menon', avatar: 'KM', role: 'Inside Sales Specialist', groupName: 'Retention Squad', phone: '+91 98450 22334', attendanceStatus: 'ABSENT', checkInTime: '', checkInMethod: '', dialsToday: 0, goalCalls: 100, connected: 0, interested: 0, salesAchieved: 0, salesTarget: 200000, conversionRate: 0 }
  ];
  for (const m of members) {
    insertTeamMember.run(m.id, m.empCode, m.name, m.avatar, m.role, m.groupName, m.phone, m.attendanceStatus, m.checkInTime, m.checkInMethod, m.dialsToday, m.goalCalls, m.connected, m.interested, m.salesAchieved, m.salesTarget, m.conversionRate);
  }

  // 4. Team Groups (Clean structure: 0 achieved)
  const insertGroup = db.prepare(`
    INSERT INTO team_groups (id, name, description, leaderName, memberCount, monthlyTarget, achieved, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const groups = [
    { id: 'grp-1', name: 'HNI Closers', description: 'High-ticket corporate clients & enterprise accounts', leaderName: 'Priya Nair', memberCount: 2, monthlyTarget: 400000, achieved: 0, color: '#00C9A7' },
    { id: 'grp-2', name: 'Inbound Qualifiers', description: 'Fresh web leads, Google Ads, and campaign inquiries', leaderName: 'Rahul Varma', memberCount: 2, monthlyTarget: 360000, achieved: 0, color: '#00B4D8' },
    { id: 'grp-3', name: 'Retention Squad', description: 'Account renewals, upsells & feedback calls', leaderName: 'Kavita Menon', memberCount: 2, monthlyTarget: 350000, achieved: 0, color: '#F59E0B' }
  ];
  for (const g of groups) {
    insertGroup.run(g.id, g.name, g.description, g.leaderName, g.memberCount, g.monthlyTarget, g.achieved, g.color);
  }

  console.log('[SQLite DB] Clean database initialization complete. 0 fake leads, 0 fake calls, 0 fake deals.');
}

export function resetDatabaseToClean() {
  console.log('[SQLite DB] Purging stale data and resetting to pristine clean state...');
  try {
    const tables = [
      'assigned_leads',
      'call_logs',
      'client_leads',
      'lead_batches',
      'payment_verifications',
      'attendance_records',
      'leave_requests',
      'employee_profiles',
      'telecaller_stats',
      'team_members',
      'team_groups',
      'team_tasks',
      'team_meetings',
      'candidate_interviews',
      'onboarding_employees',
      'exit_employees',
      'face_biometric_profiles',
      'offer_letters',
    ];

    for (const table of tables) {
      try {
        db.exec(`DELETE FROM ${table};`);
      } catch (err) {
        // table might not exist yet, ignore
      }
    }

    seedUsersIfEmpty();
    seedInitialDataIfEmpty();
    return { success: true, message: 'Database reset to clean state.' };
  } catch (err: any) {
    console.error('[SQLite DB] Error resetting database:', err);
    return { success: false, error: err.message };
  }
}


