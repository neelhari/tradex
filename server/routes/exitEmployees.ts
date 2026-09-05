import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

function formatExitEmployee(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    empCode: row.empCode,
    name: row.name,
    role: row.role,
    department: row.department,
    resignationDate: row.resignationDate,
    lastWorkingDay: row.lastWorkingDay,
    status: row.status,
    checklist: {
      assetsReturned: Boolean(row.assetsReturned),
      accountsSettled: Boolean(row.accountsSettled),
      knowledgeTransfer: Boolean(row.knowledgeTransfer),
      relievingLetterIssued: Boolean(row.relievingLetterIssued)
    }
  };
}

// GET /api/exit-employees
router.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM exit_employees ORDER BY createdAt DESC').all();
    return res.status(200).json(rows.map(formatExitEmployee));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/exit-employees
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, empCode, name, role, department, resignationDate, lastWorkingDay, status, checklist } = req.body;
    const exitId = id || `exit-${Date.now()}`;

    db.prepare(`
      INSERT INTO exit_employees (id, empCode, name, role, department, resignationDate, lastWorkingDay, status, assetsReturned, accountsSettled, knowledgeTransfer, relievingLetterIssued)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      exitId, empCode || `TNX-${Math.floor(8000 + Math.random() * 999)}`, name || 'Employee',
      role || 'Junior Sales Executive', department || 'Sales & Client Acquisition',
      resignationDate || 'Today', lastWorkingDay || 'End of Month', status || 'CLEARANCE_PENDING',
      checklist?.assetsReturned ? 1 : 0, checklist?.accountsSettled ? 1 : 0,
      checklist?.knowledgeTransfer ? 1 : 0, checklist?.relievingLetterIssued ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM exit_employees WHERE id = ?').get(exitId);
    return res.status(201).json(formatExitEmployee(created));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/exit-employees/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM exit_employees WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Exit employee not found' });
    }

    const { empCode, name, role, department, resignationDate, lastWorkingDay, status, checklist } = req.body;

    const assets = checklist?.assetsReturned !== undefined ? (checklist.assetsReturned ? 1 : 0) : existing.assetsReturned;
    const accounts = checklist?.accountsSettled !== undefined ? (checklist.accountsSettled ? 1 : 0) : existing.accountsSettled;
    const kt = checklist?.knowledgeTransfer !== undefined ? (checklist.knowledgeTransfer ? 1 : 0) : existing.knowledgeTransfer;
    const relieving = checklist?.relievingLetterIssued !== undefined ? (checklist.relievingLetterIssued ? 1 : 0) : existing.relievingLetterIssued;

    const allChecked = (assets === 1 && accounts === 1 && kt === 1 && relieving === 1);
    const newStatus = status || (allChecked ? 'RELIEVED' : 'CLEARANCE_PENDING');

    db.prepare(`
      UPDATE exit_employees 
      SET empCode = ?, name = ?, role = ?, department = ?, resignationDate = ?, 
          lastWorkingDay = ?, status = ?, assetsReturned = ?, accountsSettled = ?, 
          knowledgeTransfer = ?, relievingLetterIssued = ?
      WHERE id = ?
    `).run(
      empCode || existing.empCode, name || existing.name, role || existing.role,
      department || existing.department, resignationDate || existing.resignationDate,
      lastWorkingDay || existing.lastWorkingDay, newStatus, assets, accounts, kt, relieving, id
    );

    const updated = db.prepare('SELECT * FROM exit_employees WHERE id = ?').get(id);
    return res.status(200).json(formatExitEmployee(updated));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
