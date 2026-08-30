import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/attendance
router.get('/', (req: Request, res: Response) => {
  try {
    const records = db.prepare('SELECT * FROM attendance_records ORDER BY date DESC').all();
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/attendance (Check-in / Add record)
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, date, dayNumber, status, checkIn, checkOut, workHours, method } = req.body;
    const recDate = date || new Date().toISOString().split('T')[0];
    const recDay = dayNumber || new Date(recDate).getDate();
    const recId = id || `att-${recDate}`;

    db.prepare(`
      INSERT INTO attendance_records (id, date, dayNumber, status, checkIn, checkOut, workHours, method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        checkIn = coalesce(excluded.checkIn, attendance_records.checkIn),
        checkOut = coalesce(excluded.checkOut, attendance_records.checkOut),
        workHours = coalesce(excluded.workHours, attendance_records.workHours),
        method = coalesce(excluded.method, attendance_records.method)
    `).run(
      recId, recDate, recDay, status || 'PRESENT', checkIn || null, checkOut || null,
      workHours || 'In Progress', method || 'Face ID Biometric'
    );

    const record = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recId);
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/attendance/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE attendance_records 
      SET date = ?, dayNumber = ?, status = ?, checkIn = ?, checkOut = ?, workHours = ?, method = ?
      WHERE id = ?
    `).run(
      merged.date, merged.dayNumber, merged.status, merged.checkIn, merged.checkOut,
      merged.workHours, merged.method, id
    );

    const updated = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
