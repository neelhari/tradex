process.env.NODE_ENV = 'test';

import http from 'http';
import app from '../server.js';

interface TestResult {
  name: string;
  method: string;
  endpoint: string;
  status: number;
  expectedStatus: number[];
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function makeRequest(
  port: number,
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(jsonBody ? { 'Content-Length': Buffer.byteLength(jsonBody) } : {}),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const data = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode || 500, data });
          } catch {
            resolve({ status: res.statusCode || 500, data: responseData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

async function runTest(
  port: number,
  name: string,
  method: string,
  endpoint: string,
  expectedStatus: number[],
  body?: any
): Promise<any> {
  try {
    const res = await makeRequest(port, method, endpoint, body);
    const passed = expectedStatus.includes(res.status);
    results.push({
      name,
      method,
      endpoint,
      status: res.status,
      expectedStatus,
      passed,
      error: passed ? undefined : `Expected ${expectedStatus.join('/')} got ${res.status}: ${JSON.stringify(res.data)}`,
    });
    return res.data;
  } catch (err: any) {
    results.push({
      name,
      method,
      endpoint,
      status: 0,
      expectedStatus,
      passed: false,
      error: err.message,
    });
    return null;
  }
}

async function startTestSuite() {
  const server = app.listen(0);
  const address = server.address();
  const TEST_PORT = typeof address === 'object' && address ? address.port : 5099;
  const uid = Date.now();

  console.log('\n========================================================');
  console.log(`🧪 RUNNING COMPREHENSIVE SQLITE & API UNIT TEST SUITE (Port: ${TEST_PORT})`);
  console.log('========================================================\n');

  try {
    // 1. Health Check
    await runTest(TEST_PORT, 'Health Check Endpoint', 'GET', '/api/health', [200]);

    // 2. Profile GET & PUT
    await runTest(TEST_PORT, 'GET Profile', 'GET', '/api/profile', [200]);
    await runTest(TEST_PORT, 'PUT Profile', 'PUT', '/api/profile', [200], {
      name: 'Arjun Kumar (Verified)',
      checkInTime: '09:15 AM',
    });

    // 3. Stats GET & PUT
    await runTest(TEST_PORT, 'GET Stats', 'GET', '/api/stats', [200]);
    await runTest(TEST_PORT, 'PUT Stats', 'PUT', '/api/stats', [200], {
      dialsMade: 75,
      connected: 50,
    });

    // 4. Call Logs GET & POST
    await runTest(TEST_PORT, 'GET Call Logs', 'GET', '/api/call-logs', [200]);
    await runTest(TEST_PORT, 'POST Call Log (Add)', 'POST', '/api/call-logs', [201], {
      clientName: 'Sunil Gavaskar',
      companyName: 'Gavaskar Sports Corp',
      phoneNumber: '+91 98999 12345',
      outcome: 'INTERESTED',
      durationSec: 190,
      notes: 'Test call log from test suite',
    });

    // 5. Client Leads GET, POST, PUT
    await runTest(TEST_PORT, 'GET Client Leads', 'GET', '/api/clients', [200]);
    const createdClient = await runTest(TEST_PORT, 'POST Client Lead (Add)', 'POST', '/api/clients', [201], {
      id: `lead-test-${uid}`,
      name: 'Test Client Enterprise',
      company: 'Test Logistics Global',
      phone: '+91 98888 77777',
      dealValue: 60000,
      temperature: 'HOT',
    });
    await runTest(TEST_PORT, 'PUT Client Lead (Update)', 'PUT', `/api/clients/${createdClient?.id || `lead-test-${uid}`}`, [200], {
      status: 'Due Today',
      dealValue: 65000,
    });

    // 6. Attendance GET, POST, PUT
    await runTest(TEST_PORT, 'GET Attendance Records', 'GET', '/api/attendance', [200]);
    await runTest(TEST_PORT, 'POST Attendance (Check-in)', 'POST', '/api/attendance', [201, 200], {
      id: `att-test-${uid}`,
      date: '2025-05-29',
      dayNumber: 29,
      status: 'PRESENT',
      checkIn: '09:00 AM',
      method: 'Face ID Biometric',
    });
    await runTest(TEST_PORT, 'PUT Attendance (Update)', 'PUT', `/api/attendance/att-test-${uid}`, [200], {
      checkOut: '06:00 PM',
      workHours: '9h 00m',
    });

    // 7. Leaves GET, POST, PUT
    await runTest(TEST_PORT, 'GET Leave Requests', 'GET', '/api/leaves', [200]);
    const createdLeave = await runTest(TEST_PORT, 'POST Leave Request (Add)', 'POST', '/api/leaves', [201], {
      id: `leave-test-${uid}`,
      leaveType: 'Sick Leave',
      fromDate: '10 Jun 2025',
      toDate: '11 Jun 2025',
      totalDays: 2,
      reason: 'Medical checkup test',
    });
    await runTest(TEST_PORT, 'PUT Leave Request (Approve)', 'PUT', `/api/leaves/${createdLeave?.id || `leave-test-${uid}`}`, [200], {
      status: 'APPROVED',
      approvedBy: 'Ramesh Sharma (Team Leader)',
    });

    // 8. Payslips GET, POST, POST Bulk
    await runTest(TEST_PORT, 'GET Payslips', 'GET', '/api/payslips', [200]);
    await runTest(TEST_PORT, 'POST Payslip (Add)', 'POST', '/api/payslips', [201], {
      id: `pay-test-${uid}`,
      month: 'May',
      year: 2025,
      basicSalary: 30000,
      hra: 12000,
      specialAllowance: 6000,
      netPay: 48000,
      generatedDate: '01 Jun 2025',
    });
    await runTest(TEST_PORT, 'POST Bulk Payslips (Generate)', 'POST', '/api/payslips/bulk', [201], {
      month: 'June',
      year: '2025',
    });

    // 9. Team Members GET, POST, PUT
    await runTest(TEST_PORT, 'GET Team Members', 'GET', '/api/team-members', [200]);
    const createdMember = await runTest(TEST_PORT, 'POST Team Member (Add)', 'POST', '/api/team-members', [201], {
      id: `tm-test-${uid}`,
      empCode: `TNX-${Math.floor(1000 + Math.random() * 8999)}`,
      name: 'Ravi Teja',
      role: 'Telecaller Executive',
      group: 'HNI Closers',
      phone: '+91 99887 66554',
    });
    await runTest(TEST_PORT, 'PUT Team Member (Update)', 'PUT', `/api/team-members/${createdMember?.id || `tm-test-${uid}`}`, [200], {
      dialsToday: 45,
      connected: 30,
    });

    // 10. Team Groups GET, POST, PUT
    await runTest(TEST_PORT, 'GET Team Groups', 'GET', '/api/team-groups', [200]);
    const createdGroup = await runTest(TEST_PORT, 'POST Team Group (Add)', 'POST', '/api/team-groups', [201], {
      id: `grp-test-${uid}`,
      name: `Corporate Pioneers ${uid}`,
      description: 'Handling Fortune 500 Enterprise accounts',
      leaderName: 'Arjun Kumar',
      monthlyTarget: 500000,
    });
    await runTest(TEST_PORT, 'PUT Team Group (Update)', 'PUT', `/api/team-groups/${createdGroup?.id || `grp-test-${uid}`}`, [200], {
      monthlyTarget: 550000,
      achieved: 120000,
    });

    // 11. Team Tasks GET, POST, PUT
    await runTest(TEST_PORT, 'GET Team Tasks', 'GET', '/api/team-tasks', [200]);
    const createdTask = await runTest(TEST_PORT, 'POST Team Task (Add)', 'POST', '/api/team-tasks', [201], {
      id: `task-test-${uid}`,
      title: 'Follow up with 10 hot enterprise leads',
      assignedTo: 'Arjun Kumar',
      dueDate: 'Today, 06:00 PM',
      priority: 'HIGH',
    });
    await runTest(TEST_PORT, 'PUT Team Task (Toggle Status)', 'PUT', `/api/team-tasks/${createdTask?.id || `task-test-${uid}`}`, [200], {
      status: 'COMPLETED',
    });

    // 12. Team Meetings GET, POST
    await runTest(TEST_PORT, 'GET Team Meetings', 'GET', '/api/team-meetings', [200]);
    await runTest(TEST_PORT, 'POST Team Meeting (Add)', 'POST', '/api/team-meetings', [201], {
      id: `mtg-test-${uid}`,
      title: 'Weekly Target Review',
      dateTime: 'Friday • 10:00 AM',
      type: 'Team Standup',
      location: 'Conference Room 1',
      agenda: 'Review sprint deliverables',
    });

    // 13. Candidate Interviews GET, POST, PUT
    await runTest(TEST_PORT, 'GET Candidate Interviews', 'GET', '/api/interviews', [200]);
    const createdCand = await runTest(TEST_PORT, 'POST Candidate Interview (Add)', 'POST', '/api/interviews', [201], {
      id: `cand-test-${uid}`,
      candidateName: 'Akash Deep',
      roleApplied: 'Telecaller Executive',
      experience: '2 Yrs B2B Sales',
      email: 'akash.d@gmail.com',
      phone: '+91 97777 66666',
    });
    await runTest(TEST_PORT, 'PUT Candidate Interview (Update Status)', 'PUT', `/api/interviews/${createdCand?.id || `cand-test-${uid}`}`, [200], {
      status: 'OFFER_EXTENDED',
      rating: 4.9,
    });

    // 14. Onboarding Employees GET, POST, PUT
    await runTest(TEST_PORT, 'GET Onboarding Employees', 'GET', '/api/onboarding', [200]);
    const createdOnb = await runTest(TEST_PORT, 'POST Onboarding Employee (Add)', 'POST', '/api/onboarding', [201], {
      id: `onb-test-${uid}`,
      empCode: `TNX-${Math.floor(1000 + Math.random() * 8999)}`,
      name: 'Simran Kaur',
      role: 'Sales Associate',
      department: 'Alpha Growth Team',
      joiningDate: '01 June 2025',
      probationEnd: '01 Dec 2025',
    });
    await runTest(TEST_PORT, 'PUT Onboarding Employee (Checklist)', 'PUT', `/api/onboarding/${createdOnb?.id || `onb-test-${uid}`}`, [200], {
      checklist: {
        documentsVerified: true,
        workstationAllocated: true,
        biometricEnrolled: true,
        trainingScheduled: true,
      },
    });

    // 15. Exit Employees GET, POST, PUT
    await runTest(TEST_PORT, 'GET Exit Employees', 'GET', '/api/exit-employees', [200]);
    const createdExit = await runTest(TEST_PORT, 'POST Exit Employee (Add)', 'POST', '/api/exit-employees', [201], {
      id: `exit-test-${uid}`,
      empCode: `TNX-${Math.floor(1000 + Math.random() * 8999)}`,
      name: 'Vikas Shah',
      role: 'Junior Telecaller',
      department: 'Retention Squad',
      resignationDate: '01 May 2025',
      lastWorkingDay: '31 May 2025',
    });
    await runTest(TEST_PORT, 'PUT Exit Employee (Clearance)', 'PUT', `/api/exit-employees/${createdExit?.id || `exit-test-${uid}`}`, [200], {
      checklist: {
        assetsReturned: true,
        accountsSettled: true,
        knowledgeTransfer: true,
        relievingLetterIssued: true,
      },
    });

    // 16. Assigned Leads & Batches GET, POST, POST Bulk, PUT
    await runTest(TEST_PORT, 'GET Assigned Leads', 'GET', '/api/assigned-leads', [200]);
    await runTest(TEST_PORT, 'GET Lead Batches', 'GET', '/api/lead-batches', [200]);
    const createdAsg = await runTest(TEST_PORT, 'POST Assigned Lead (Add)', 'POST', '/api/assigned-leads', [201], {
      id: `asg-test-${uid}`,
      name: 'Harsh Vardhan',
      phone: '+91 96666 55555',
      company: 'Vardhan Logistics',
      assignedToEmployeeId: 'emp-101',
      assignedToEmployeeName: 'Arjun Kumar',
    });
    await runTest(TEST_PORT, 'PUT Assigned Lead (Update Status & Deal)', 'PUT', `/api/assigned-leads/${createdAsg?.id || `asg-test-${uid}`}`, [200], {
      status: 'CONVERTED',
      dealValue: 95000,
      notes: 'Deal closed during test suite run',
    });
    await runTest(TEST_PORT, 'POST Assigned Leads (Bulk Excel Import)', 'POST', '/api/assigned-leads/bulk', [201], {
      fileName: 'Automated_Test_Import.xlsx',
      targetEmployeeId: 'emp-101',
      targetEmployeeName: 'Arjun Kumar',
      leads: [
        { name: 'Bulk Client 1', phone: '+91 91111 22222', company: 'Corp One' },
        { name: 'Bulk Client 2', phone: '+91 93333 44444', company: 'Corp Two' },
      ],
    });

    // 17. Biometrics GET, POST, POST Verify
    await runTest(TEST_PORT, 'GET Biometric Profiles', 'GET', '/api/biometrics', [200]);
    await runTest(TEST_PORT, 'POST Register Face Biometric', 'POST', '/api/biometrics', [201], {
      employeeId: `emp-test-bio-${uid}`,
      employeeName: 'Biometric Test User',
      registeredPhoto: 'data:image/jpeg;base64,mockFaceDataString',
      registeredAt: 'Just now',
    });
    await runTest(TEST_PORT, 'POST Verify Face Biometric', 'POST', '/api/biometrics/verify', [200], {
      employeeId: `emp-test-bio-${uid}`,
    });

    // 18. Offer Letters GET, POST
    await runTest(TEST_PORT, 'GET Offer Letters', 'GET', '/api/offer-letters', [200]);
    await runTest(TEST_PORT, 'POST Offer Letter (Generate)', 'POST', '/api/offer-letters', [201], {
      id: `off-test-${uid}`,
      candidateName: 'Kishore Kumar',
      candidateEmail: 'kishore@gmail.com',
      candidatePhone: '+91 94444 33333',
      roleTitle: 'Senior SDR Specialist',
      department: 'Sales & Client Acquisition',
      annualCtc: 480000,
      monthlyGross: 40000,
      joiningDate: '15 June 2025',
      reportingManager: 'Ramesh Sharma',
      location: 'Bengaluru Corporate HQ',
    });

    // 19. Payment Verifications GET, POST, PUT
    await runTest(TEST_PORT, 'GET Payment Verifications', 'GET', '/api/payments', [200]);
    const createdPay = await runTest(TEST_PORT, 'POST Payment Verification (Add)', 'POST', '/api/payments', [201], {
      id: `pay-test-${uid}`,
      leadName: 'Gaurav Gill',
      companyName: 'Gill Logistics',
      telecallerName: 'Arjun Kumar',
      dealAmount: 110000,
      utrNumber: 'HDFC123456789012',
      paymentMode: 'NEFT',
    });
    await runTest(TEST_PORT, 'PUT Payment Verification (HR Approve)', 'PUT', `/api/payments/${createdPay?.id || `pay-test-${uid}`}`, [200], {
      status: 'VERIFIED',
    });

  } finally {
    server.close();
  }

  // Print Summary
  console.log('\n========================================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    const symbol = r.passed ? '✅' : '❌';
    console.log(`${symbol} [${r.method.padEnd(6)}] ${r.endpoint.padEnd(35)} -> HTTP ${r.status} (${r.name})`);
    if (r.passed) {
      passedCount++;
    } else {
      failedCount++;
      console.error(`   ⚠️ Failure: ${r.error}`);
    }
  }

  console.log('\n--------------------------------------------------------');
  console.log(`TOTAL TESTS : ${results.length}`);
  console.log(`PASSED      : ${passedCount}`);
  console.log(`FAILED      : ${failedCount}`);
  console.log('--------------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED WITH 200/201 SUCCESS CODES!\n');
    process.exit(0);
  }
}

startTestSuite();
