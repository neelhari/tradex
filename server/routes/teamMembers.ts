import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/team-members
router.get('/', (req: Request, res: Response) => {
  try {
    const members = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate FROM team_members').all();
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/team-members
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, empCode, name, avatar, role, group, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate } = req.body;
    const memberId = id || `tm-${Date.now()}`;

    db.prepare(`
      INSERT INTO team_members (id, empCode, name, avatar, role, groupName, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memberId, empCode || `TNX-${Math.floor(8000 + Math.random() * 999)}`, name || 'Team Member',
      avatar || 'TM', role || 'Telecaller Executive', group || 'Alpha Growth Team',
      phone || '', attendanceStatus || 'PRESENT', checkInTime || '09:00 AM', checkInMethod || 'Face ID Biometric',
      dialsToday ? Number(dialsToday) : 0, goalCalls ? Number(goalCalls) : 100,
      connected ? Number(connected) : 0, interested ? Number(interested) : 0,
      salesAchieved ? Number(salesAchieved) : 0, salesTarget ? Number(salesTarget) : 200000,
      conversionRate ? Number(conversionRate) : 0
    );

    const created = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate FROM team_members WHERE id = ?').get(memberId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/team-members/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate FROM team_members WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE team_members 
      SET empCode = ?, name = ?, avatar = ?, role = ?, groupName = ?, phone = ?, 
          attendanceStatus = ?, checkInTime = ?, checkInMethod = ?, dialsToday = ?, 
          goalCalls = ?, connected = ?, interested = ?, salesAchieved = ?, 
          salesTarget = ?, conversionRate = ?
      WHERE id = ?
    `).run(
      merged.empCode, merged.name, merged.avatar, merged.role, merged.group, merged.phone,
      merged.attendanceStatus, merged.checkInTime, merged.checkInMethod, merged.dialsToday,
      merged.goalCalls, merged.connected, merged.interested, merged.salesAchieved,
      merged.salesTarget, merged.conversionRate, id
    );

    const updated = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate FROM team_members WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
