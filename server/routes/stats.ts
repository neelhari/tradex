import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/stats
// Targets belong to Admin, so the daily call goal and monthly sales target are
// taken from the employee's roster row rather than a separate copy that would
// never hear about an Admin edit.
router.get('/', (_req: Request, res: Response) => {
  try {
    const stats = db.prepare('SELECT * FROM telecaller_stats LIMIT 1').get() as any;
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const profile = db.prepare('SELECT empCode FROM employee_profiles LIMIT 1').get() as any;
    const roster = profile
      ? (db.prepare('SELECT * FROM team_members WHERE empCode = ?').get(profile.empCode) as any)
      : null;

    return res.status(200).json({
      ...stats,
      dialsToday: stats.dialsMade,
      dailyTarget: roster?.goalCalls ?? stats.todayGoalCalls,
      todayGoalCalls: roster?.goalCalls ?? stats.todayGoalCalls,
      monthlySalesTarget: roster?.salesTarget ?? stats.monthlySalesTarget,
      monthlySalesAchieved: roster?.salesAchieved ?? stats.monthlySalesAchieved,
    });
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
    if (data.dialsToday !== undefined && data.dialsMade === undefined) {
      merged.dialsMade = Number(data.dialsToday);
    }
    if (data.dailyTarget !== undefined && data.todayGoalCalls === undefined) {
      merged.todayGoalCalls = Number(data.dailyTarget);
    }

    db.prepare(`
      UPDATE telecaller_stats 
      SET todayGoalCalls = ?, dialsMade = ?, connected = ?, interested = ?, rejected = ?, 
          averageCallDurationSec = ?, monthlySalesTarget = ?, monthlySalesAchieved = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      merged.todayGoalCalls, merged.dialsMade, merged.connected, merged.interested, merged.rejected,
      merged.averageCallDurationSec, merged.monthlySalesTarget, merged.monthlySalesAchieved, current.id
    );

    const updated = db.prepare('SELECT * FROM telecaller_stats WHERE id = ?').get(current.id) as any;
    return res.status(200).json({
      ...updated,
      dialsToday: updated.dialsMade,
      dailyTarget: updated.todayGoalCalls
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
