import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/profile
router.get('/', (req: Request, res: Response) => {
  try {
    const profile = db.prepare('SELECT * FROM employee_profiles LIMIT 1').get();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/profile
router.put('/', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const current = db.prepare('SELECT * FROM employee_profiles LIMIT 1').get() as any;
    if (!current) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const merged = { ...current, ...data };
    db.prepare(`
      UPDATE employee_profiles 
      SET empCode = ?, name = ?, roleTitle = ?, department = ?, teamName = ?, 
          teamLeaderName = ?, email = ?, phone = ?, joinDate = ?, bloodGroup = ?, 
          faceIdStatus = ?, checkInTime = ?, totalLeaveBalance = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      merged.empCode, merged.name, merged.roleTitle, merged.department, merged.teamName,
      merged.teamLeaderName, merged.email, merged.phone, merged.joinDate, merged.bloodGroup,
      merged.faceIdStatus, merged.checkInTime, merged.totalLeaveBalance, current.id
    );

    const updated = db.prepare('SELECT * FROM employee_profiles WHERE id = ?').get(current.id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
