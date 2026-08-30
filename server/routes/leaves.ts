import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/leaves
router.get('/', (req: Request, res: Response) => {
  try {
    const leaves = db.prepare('SELECT * FROM leave_requests ORDER BY createdAt DESC').all();
    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/leaves
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, leaveType, fromDate, toDate, totalDays, reason, status, appliedOn, approvedBy } = req.body;
    const leaveId = id || `leave-${Date.now()}`;
    const days = totalDays ? Number(totalDays) : 1;

    db.prepare(`
      INSERT INTO leave_requests (id, leaveType, fromDate, toDate, totalDays, reason, status, appliedOn, approvedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      leaveId, leaveType || 'Casual Leave', fromDate, toDate, days,
      reason || '', status || 'PENDING', appliedOn || 'Today', approvedBy || null
    );

    // Deduct leave balance from profile
    db.prepare(`
      UPDATE employee_profiles
      SET totalLeaveBalance = MAX(0, totalLeaveBalance - ?)
    `).run(days);

    const created = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/leaves/:id (Approve/Reject)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE leave_requests 
      SET leaveType = ?, fromDate = ?, toDate = ?, totalDays = ?, reason = ?, 
          status = ?, appliedOn = ?, approvedBy = ?
      WHERE id = ?
    `).run(
      merged.leaveType, merged.fromDate, merged.toDate, merged.totalDays,
      merged.reason, merged.status, merged.appliedOn, merged.approvedBy, id
    );

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
