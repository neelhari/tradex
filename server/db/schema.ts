import db from './connection.js';

export function initializeDatabaseSchema() {
  db.exec(`
    -- 1. Employee Profiles
    CREATE TABLE IF NOT EXISTS employee_profiles (
      id TEXT PRIMARY KEY,
      empCode TEXT NOT NULL,
      name TEXT NOT NULL,
      roleTitle TEXT NOT NULL,
      department TEXT NOT NULL,
      teamName TEXT NOT NULL,
      teamLeaderName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      joinDate TEXT NOT NULL,
      bloodGroup TEXT NOT NULL,
      faceIdStatus TEXT NOT NULL DEFAULT 'NOT_CHECKED_IN',
      checkInTime TEXT DEFAULT '',
      totalLeaveBalance REAL NOT NULL DEFAULT 14,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Telecaller Stats
    CREATE TABLE IF NOT EXISTS telecaller_stats (
      id TEXT PRIMARY KEY,
      todayGoalCalls INTEGER NOT NULL DEFAULT 100,
      dialsMade INTEGER NOT NULL DEFAULT 0,
      connected INTEGER NOT NULL DEFAULT 0,
      interested INTEGER NOT NULL DEFAULT 0,
      rejected INTEGER NOT NULL DEFAULT 0,
      averageCallDurationSec INTEGER NOT NULL DEFAULT 0,
      monthlySalesTarget REAL NOT NULL DEFAULT 200000,
      monthlySalesAchieved REAL NOT NULL DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Call Logs
    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      clientName TEXT NOT NULL,
      companyName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      durationSec INTEGER NOT NULL DEFAULT 0,
      outcome TEXT NOT NULL,
      notes TEXT DEFAULT '',
      followUpDate TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Client Leads
    CREATE TABLE IF NOT EXISTS client_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      temperature TEXT NOT NULL DEFAULT 'WARM',
      status TEXT NOT NULL DEFAULT 'Pending',
      dueTime TEXT,
      dealValue REAL NOT NULL DEFAULT 0,
      requirement TEXT DEFAULT '',
      lastContacted TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Attendance Records
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      dayNumber INTEGER NOT NULL,
      status TEXT NOT NULL,
      checkIn TEXT,
      checkOut TEXT,
      workHours TEXT,
      method TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Leave Requests
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employeeName TEXT,
      employeeCode TEXT,
      leaveType TEXT NOT NULL,
      fromDate TEXT NOT NULL,
      toDate TEXT NOT NULL,
      totalDays REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      appliedOn TEXT NOT NULL,
      approvedBy TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Payslips
    CREATE TABLE IF NOT EXISTS payslips (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      basicSalary REAL NOT NULL,
      hra REAL NOT NULL,
      specialAllowance REAL NOT NULL,
      incentives REAL NOT NULL DEFAULT 0,
      pfDeduction REAL NOT NULL DEFAULT 0,
      taxDeduction REAL NOT NULL DEFAULT 0,
      netPay REAL NOT NULL,
      generatedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PAID',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Team Members
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      empCode TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      role TEXT NOT NULL,
      groupName TEXT NOT NULL,
      phone TEXT NOT NULL,
      attendanceStatus TEXT NOT NULL DEFAULT 'PRESENT',
      checkInTime TEXT,
      checkInMethod TEXT,
      dialsToday INTEGER NOT NULL DEFAULT 0,
      goalCalls INTEGER NOT NULL DEFAULT 100,
      connected INTEGER NOT NULL DEFAULT 0,
      interested INTEGER NOT NULL DEFAULT 0,
      salesAchieved REAL NOT NULL DEFAULT 0,
      salesTarget REAL NOT NULL DEFAULT 200000,
      conversionRate REAL NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Team Groups
    CREATE TABLE IF NOT EXISTS team_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      leaderName TEXT NOT NULL,
      memberCount INTEGER NOT NULL DEFAULT 0,
      monthlyTarget REAL NOT NULL DEFAULT 0,
      achieved REAL NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#00C9A7',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Team Tasks
    CREATE TABLE IF NOT EXISTS team_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      assignedTo TEXT NOT NULL,
      groupName TEXT,
      dueDate TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'NORMAL',
      status TEXT NOT NULL DEFAULT 'PENDING',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. Team Meetings
    CREATE TABLE IF NOT EXISTS team_meetings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      dateTime TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      attendeesCount INTEGER NOT NULL DEFAULT 0,
      agenda TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. Candidate Interviews
    CREATE TABLE IF NOT EXISTS candidate_interviews (
      id TEXT PRIMARY KEY,
      candidateName TEXT NOT NULL,
      roleApplied TEXT NOT NULL,
      experience TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'APPLIED',
      interviewTime TEXT,
      interviewer TEXT,
      rating REAL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. Onboarding Employees
    CREATE TABLE IF NOT EXISTS onboarding_employees (
      id TEXT PRIMARY KEY,
      empCode TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      joiningDate TEXT NOT NULL,
      probationEnd TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
      documentsVerified INTEGER NOT NULL DEFAULT 0,
      workstationAllocated INTEGER NOT NULL DEFAULT 0,
      biometricEnrolled INTEGER NOT NULL DEFAULT 0,
      trainingScheduled INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Exit Employees
    CREATE TABLE IF NOT EXISTS exit_employees (
      id TEXT PRIMARY KEY,
      empCode TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      resignationDate TEXT NOT NULL,
      lastWorkingDay TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CLEARANCE_PENDING',
      assetsReturned INTEGER NOT NULL DEFAULT 0,
      accountsSettled INTEGER NOT NULL DEFAULT 0,
      knowledgeTransfer INTEGER NOT NULL DEFAULT 0,
      relievingLetterIssued INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. Assigned Leads
    CREATE TABLE IF NOT EXISTS assigned_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      company TEXT NOT NULL,
      city TEXT DEFAULT '',
      assignedToEmployeeId TEXT NOT NULL,
      assignedToEmployeeName TEXT NOT NULL,
      batchId TEXT NOT NULL,
      assignedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT DEFAULT '',
      callCount INTEGER NOT NULL DEFAULT 0,
      lastCallTimestamp TEXT,
      dealValue REAL DEFAULT 0,
      followUpDate TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. Lead Batches
    CREATE TABLE IF NOT EXISTS lead_batches (
      id TEXT PRIMARY KEY,
      fileName TEXT NOT NULL,
      uploadedAt TEXT NOT NULL,
      totalLeads INTEGER NOT NULL,
      assignedToEmployeeName TEXT NOT NULL,
      assignedToEmployeeId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 17. Face Biometric Profiles
    CREATE TABLE IF NOT EXISTS face_biometric_profiles (
      employeeId TEXT PRIMARY KEY,
      employeeName TEXT NOT NULL,
      registeredPhoto TEXT,
      registeredAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'REGISTERED',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 18. Offer Letters
    CREATE TABLE IF NOT EXISTS offer_letters (
      id TEXT PRIMARY KEY,
      candidateName TEXT NOT NULL,
      candidateEmail TEXT NOT NULL,
      candidatePhone TEXT NOT NULL,
      roleTitle TEXT NOT NULL,
      department TEXT NOT NULL,
      annualCtc REAL NOT NULL,
      monthlyGross REAL NOT NULL,
      joiningDate TEXT NOT NULL,
      reportingManager TEXT NOT NULL,
      location TEXT NOT NULL,
      issuedDate TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 19. Payment Verifications
    CREATE TABLE IF NOT EXISTS payment_verifications (
      id TEXT PRIMARY KEY,
      leadName TEXT NOT NULL,
      companyName TEXT NOT NULL,
      telecallerName TEXT NOT NULL,
      dealAmount REAL NOT NULL,
      utrNumber TEXT NOT NULL,
      paymentMode TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_HR_AUDIT',
      receiptUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indices for optimal lookup speeds
    CREATE INDEX IF NOT EXISTS idx_call_logs_timestamp ON call_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_client_leads_status ON client_leads(status);
    CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
    CREATE INDEX IF NOT EXISTS idx_assigned_leads_emp ON assigned_leads(assignedToEmployeeId);
    CREATE INDEX IF NOT EXISTS idx_team_members_group ON team_members(groupName);
  `);

  runMigrations();
  console.log('[SQLite DB] All 19 database tables initialized successfully.');
}

// CREATE TABLE IF NOT EXISTS never alters an existing table, so columns added
// after a database already exists have to be applied separately.
function runMigrations() {
  const addColumnIfMissing = (table: string, column: string, definition: string) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!columns.some((c) => c.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`[SQLite DB] Migration: added ${table}.${column}`);
    }
  };

  addColumnIfMissing('leave_requests', 'employeeName', 'TEXT');
  addColumnIfMissing('leave_requests', 'employeeCode', 'TEXT');

  // An employee who has left is deactivated, never deleted — their attendance,
  // calls and payslips must stay on record.
  addColumnIfMissing('team_members', 'active', 'INTEGER NOT NULL DEFAULT 1');
  addColumnIfMissing('team_members', 'email', 'TEXT');
  addColumnIfMissing('team_members', 'deactivatedOn', 'TEXT');

  // Attendance is per employee, and each check-in carries proof of who and where.
  addColumnIfMissing('attendance_records', 'employeeId', 'TEXT');
  addColumnIfMissing('attendance_records', 'employeeName', 'TEXT');
  addColumnIfMissing('attendance_records', 'checkInPhoto', 'TEXT');
  addColumnIfMissing('attendance_records', 'checkInLat', 'REAL');
  addColumnIfMissing('attendance_records', 'checkInLng', 'REAL');
  addColumnIfMissing('attendance_records', 'checkInDistanceM', 'REAL');
  addColumnIfMissing('attendance_records', 'locationStatus', 'TEXT');

  // Which of the four portals a person may enter. `role` is their job title
  // (free text); `portal` is what the system acts on.
  addColumnIfMissing('team_members', 'portal', "TEXT NOT NULL DEFAULT 'telecaller'");

  // Existing rows: infer the portal once, from the job title already recorded.
  const needsPortal = db
    .prepare("SELECT id, role FROM team_members WHERE portal IS NULL OR portal = ''")
    .all() as Array<{ id: string; role: string }>;
  if (needsPortal.length) {
    const setPortal = db.prepare('UPDATE team_members SET portal = ? WHERE id = ?');
    for (const row of needsPortal) {
      const title = (row.role || '').toLowerCase();
      const portal = title.includes('leader') || title.includes('supervisor')
        ? 'team_leader'
        : title.includes('hr') || title.includes('people')
        ? 'hr'
        : title.includes('admin')
        ? 'admin'
        : 'telecaller';
      setPortal.run(portal, row.id);
    }
    console.log(`[SQLite DB] Migration: set portal on ${needsPortal.length} employee(s)`);
  }

  // Check-out carries the same proof as check-in.
  addColumnIfMissing('attendance_records', 'checkOutPhoto', 'TEXT');
  addColumnIfMissing('attendance_records', 'checkOutLat', 'REAL');
  addColumnIfMissing('attendance_records', 'checkOutLng', 'REAL');
  addColumnIfMissing('attendance_records', 'checkOutDistanceM', 'REAL');
  addColumnIfMissing('attendance_records', 'checkOutLocationStatus', 'TEXT');

  // Individual employee documents — ID proofs, certificates, contracts (scope §11).
  db.exec(`
    CREATE TABLE IF NOT EXISTS employee_documents (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      fileName TEXT NOT NULL,
      mimeType TEXT,
      sizeBytes INTEGER,
      content TEXT NOT NULL,
      uploadedBy TEXT,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_employee_documents_emp ON employee_documents(employeeId);
  `);

  // Where the office is, so a check-in can be judged near or far.
  db.exec(`
    CREATE TABLE IF NOT EXISTS office_settings (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      radiusMeters REAL NOT NULL DEFAULT 200,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const hasOffice = db.prepare('SELECT COUNT(*) AS c FROM office_settings').get() as { c: number };
  if (!hasOffice.c) {
    db.prepare(
      'INSERT INTO office_settings (id, label, latitude, longitude, radiusMeters) VALUES (?, ?, ?, ?, ?)'
    ).run('office-main', 'Head Office', null, null, 200);
    console.log('[SQLite DB] Migration: created office_settings (address not set yet)');
  }
}
