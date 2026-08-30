import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/stats
router.get('/', (req: Request, res: Response) => {
  try {
    const stats = db.prepare('SELECT * FROM telecaller_stats LIMIT 1').get();
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/stats
router.put('/', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const current = db.prepare('SELECT * FROM telecaller_stats LIMIT 1').get() as any;
    if (!current) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const merged = { ...current, ...data };
    db.prepare(`
      UPDATE telecaller_stats 
      SET todayGoalCalls = ?, dialsMade = ?, connected = ?, interested = ?, rejected = ?, 
          averageCallDurationSec = ?, monthlySalesTarget = ?, monthlySalesAchieved = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      merged.todayGoalCalls, merged.dialsMade, merged.connected, merged.interested, merged.rejected,
      merged.averageCallDurationSec, merged.monthlySalesTarget, merged.monthlySalesAchieved, current.id
    );

    const updated = db.prepare('SELECT * FROM telecaller_stats WHERE id = ?').get(current.id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
