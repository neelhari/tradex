import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/call-logs
router.get('/', (req: Request, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM call_logs ORDER BY createdAt DESC').all();
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/call-logs
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, clientName, companyName, phoneNumber, timestamp, durationSec, outcome, notes, followUpDate } = req.body;
    const logId = id || `call-${Date.now()}`;
    const duration = durationSec !== undefined ? Number(durationSec) : 0;
    const time = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare(`
      INSERT INTO call_logs (id, clientName, companyName, phoneNumber, timestamp, durationSec, outcome, notes, followUpDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId, clientName || 'Unknown Client', companyName || 'Company', phoneNumber || '',
      time, duration, outcome || 'CONNECTED', notes || '', followUpDate || null
    );

    const created = db.prepare('SELECT * FROM call_logs WHERE id = ?').get(logId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/call-logs/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM call_logs WHERE id = ?').run(id);
    return res.status(200).json({ success: true, message: 'Call log deleted' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
