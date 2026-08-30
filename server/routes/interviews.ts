import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/interviews
router.get('/', (req: Request, res: Response) => {
  try {
    const candidates = db.prepare('SELECT * FROM candidate_interviews ORDER BY createdAt DESC').all();
    return res.status(200).json(candidates);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/interviews
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, candidateName, roleApplied, experience, email, phone, status, interviewTime, interviewer, rating, notes } = req.body;
    const candId = id || `cand-${Date.now()}`;

    db.prepare(`
      INSERT INTO candidate_interviews (id, candidateName, roleApplied, experience, email, phone, status, interviewTime, interviewer, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      candId, candidateName || 'Candidate', roleApplied || 'Role', experience || '',
      email || '', phone || '', status || 'INTERVIEW_SCHEDULED', interviewTime || 'Scheduled',
      interviewer || 'HR', rating ? Number(rating) : null, notes || ''
    );

    const created = db.prepare('SELECT * FROM candidate_interviews WHERE id = ?').get(candId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/interviews/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM candidate_interviews WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Candidate interview not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE candidate_interviews 
      SET candidateName = ?, roleApplied = ?, experience = ?, email = ?, phone = ?, 
          status = ?, interviewTime = ?, interviewer = ?, rating = ?, notes = ?
      WHERE id = ?
    `).run(
      merged.candidateName, merged.roleApplied, merged.experience, merged.email,
      merged.phone, merged.status, merged.interviewTime, merged.interviewer,
      merged.rating ? Number(merged.rating) : null, merged.notes, id
    );

    const updated = db.prepare('SELECT * FROM candidate_interviews WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
