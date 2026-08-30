import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/team-groups
router.get('/', (req: Request, res: Response) => {
  try {
    const groups = db.prepare('SELECT * FROM team_groups').all();
    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/team-groups
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, name, description, leaderName, memberCount, monthlyTarget, achieved, color } = req.body;
    const groupId = id || `grp-${Date.now()}`;

    db.prepare(`
      INSERT INTO team_groups (id, name, description, leaderName, memberCount, monthlyTarget, achieved, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      groupId, name || 'Group Name', description || '', leaderName || '',
      memberCount ? Number(memberCount) : 1, monthlyTarget ? Number(monthlyTarget) : 0,
      achieved ? Number(achieved) : 0, color || '#00C9A7'
    );

    const created = db.prepare('SELECT * FROM team_groups WHERE id = ?').get(groupId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/team-groups/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM team_groups WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Team group not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE team_groups 
      SET name = ?, description = ?, leaderName = ?, memberCount = ?, 
          monthlyTarget = ?, achieved = ?, color = ?
      WHERE id = ?
    `).run(
      merged.name, merged.description, merged.leaderName, merged.memberCount,
      merged.monthlyTarget, merged.achieved, merged.color, id
    );

    const updated = db.prepare('SELECT * FROM team_groups WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
