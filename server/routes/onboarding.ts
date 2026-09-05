import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

function formatOnboarding(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    empCode: row.empCode,
    name: row.name,
    role: row.role,
    department: row.department,
    joiningDate: row.joiningDate,
    probationEnd: row.probationEnd,
    status: row.status,
    checklist: {
      documentsVerified: Boolean(row.documentsVerified),
      workstationAllocated: Boolean(row.workstationAllocated),
      biometricEnrolled: Boolean(row.biometricEnrolled),
      trainingScheduled: Boolean(row.trainingScheduled)
    }
  };
}

// GET /api/onboarding
router.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM onboarding_employees ORDER BY createdAt DESC').all();
    return res.status(200).json(rows.map(formatOnboarding));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/onboarding
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, empCode, name, role, department, joiningDate, probationEnd, status, checklist } = req.body;
    const onbId = id || `onb-${Date.now()}`;

    db.prepare(`
      INSERT INTO onboarding_employees (id, empCode, name, role, department, joiningDate, probationEnd, status, documentsVerified, workstationAllocated, biometricEnrolled, trainingScheduled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      onbId, empCode || `TNX-${Math.floor(8000 + Math.random() * 999)}`, name || 'Employee',
      role || 'Sales Executive', department || 'Sales & Client Acquisition',
      joiningDate || 'Today', probationEnd || '6 Months', status || 'IN_PROGRESS',
      checklist?.documentsVerified ? 1 : 0, checklist?.workstationAllocated ? 1 : 0,
      checklist?.biometricEnrolled ? 1 : 0, checklist?.trainingScheduled ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM onboarding_employees WHERE id = ?').get(onbId);
    return res.status(201).json(formatOnboarding(created));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/onboarding/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM onboarding_employees WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Onboarding employee not found' });
    }

    const { empCode, name, role, department, joiningDate, probationEnd, status, checklist } = req.body;
    
    const docs = checklist?.documentsVerified !== undefined ? (checklist.documentsVerified ? 1 : 0) : existing.documentsVerified;
    const ws = checklist?.workstationAllocated !== undefined ? (checklist.workstationAllocated ? 1 : 0) : existing.workstationAllocated;
    const bio = checklist?.biometricEnrolled !== undefined ? (checklist.biometricEnrolled ? 1 : 0) : existing.biometricEnrolled;
    const train = checklist?.trainingScheduled !== undefined ? (checklist.trainingScheduled ? 1 : 0) : existing.trainingScheduled;

    const allChecked = (docs === 1 && ws === 1 && bio === 1 && train === 1);
    const newStatus = status || (allChecked ? 'COMPLETED' : 'IN_PROGRESS');

    db.prepare(`
      UPDATE onboarding_employees 
      SET empCode = ?, name = ?, role = ?, department = ?, joiningDate = ?, 
          probationEnd = ?, status = ?, documentsVerified = ?, workstationAllocated = ?, 
          biometricEnrolled = ?, trainingScheduled = ?
      WHERE id = ?
    `).run(
      empCode || existing.empCode, name || existing.name, role || existing.role,
      department || existing.department, joiningDate || existing.joiningDate,
      probationEnd || existing.probationEnd, newStatus, docs, ws, bio, train, id
    );

    const updated = db.prepare('SELECT * FROM onboarding_employees WHERE id = ?').get(id);
    return res.status(200).json(formatOnboarding(updated));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
