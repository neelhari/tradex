import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/team-members
router.get('/', (req: Request, res: Response) => {
  try {
    const members = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email, active, deactivatedOn FROM team_members').all();
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/team-members/floor-pulse
router.get('/floor-pulse', (req: Request, res: Response) => {
  try {
    // 1. Live Floor Attendance: Top active telecallers with dynamic punctuality and metrics
    const activeMembers = db.prepare(`
      SELECT id, empCode, name, avatar, role, groupName as "group", phone, 
             attendanceStatus, checkInTime, dialsToday, goalCalls, connected, 
             interested, salesAchieved, salesTarget
      FROM team_members 
      WHERE active = 1
      ORDER BY 
        (CASE WHEN attendanceStatus = 'PRESENT' THEN 1 WHEN attendanceStatus = 'LATE' THEN 2 ELSE 3 END),
        salesAchieved DESC,
        dialsToday DESC
      LIMIT 6
    `).all() as any[];

    // 2. Live Working Leads Pulse: Most recent active lead touchpoints across the floor
    const recentLeads = db.prepare(`
      SELECT 
        al.id, 
        al.name as contactName, 
        al.company, 
        al.assignedToEmployeeName as repName, 
        al.status, 
        al.dealValue, 
        al.notes, 
        al.lastCallTimestamp,
        al.updatedAt,
        al.createdAt
      FROM assigned_leads al
      ORDER BY al.updatedAt DESC, al.createdAt DESC
      LIMIT 8
    `).all() as any[];

    const pulseLeads = recentLeads.map((lead, idx) => {
      let type = 'CONNECTED';
      const statusUpper = (lead.status || '').toUpperCase();
      if (statusUpper.includes('CONVERT') || statusUpper.includes('WON') || lead.dealValue >= 75000) {
        type = 'WON_DEAL';
      } else if (statusUpper.includes('INTEREST')) {
        type = 'INTERESTED';
      } else if (statusUpper.includes('CALLBACK') || statusUpper.includes('CALL_BACK')) {
        type = 'CALLBACK';
      }

      const formattedAmount = lead.dealValue > 0
        ? (lead.dealValue >= 100000 ? `₹${(lead.dealValue / 100000).toFixed(2).replace(/\\.00$/, '')} L` : `₹${Number(lead.dealValue).toLocaleString('en-IN')}`)
        : '—';

      const relativeTimes = ['12m ago', '26m ago', '42m ago', '1h ago', '2h ago', '3h ago'];

      return {
        id: lead.id,
        rep: lead.repName || 'Employee',
        client: lead.company || 'Enterprise Client',
        contact: lead.contactName || 'Key Decision Maker',
        type,
        amount: formattedAmount,
        time: lead.lastCallTimestamp || relativeTimes[idx % relativeTimes.length],
        note: lead.notes || 'Spoke with client, follow-up scheduled.'
      };
    });

    return res.status(200).json({
      activeMembers,
      pulseLeads,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/team-members
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, empCode, name, avatar, role, group, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email } = req.body;
    const memberId = id || `tm-${Date.now()}`;

    db.prepare(`
      INSERT INTO team_members (id, empCode, name, avatar, role, groupName, phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memberId, empCode || `TNX-${Math.floor(8000 + Math.random() * 999)}`, name || 'Team Member',
      avatar || 'TM', role || 'Sales Executive', group || 'Alpha Growth Team',
      phone || '', attendanceStatus || 'PRESENT', checkInTime || '09:00 AM', checkInMethod || 'Face ID Biometric',
      dialsToday ? Number(dialsToday) : 0, goalCalls ? Number(goalCalls) : 100,
      connected ? Number(connected) : 0, interested ? Number(interested) : 0,
      salesAchieved ? Number(salesAchieved) : 0, salesTarget ? Number(salesTarget) : 200000,
      conversionRate ? Number(conversionRate) : 0,
      portal || 'telecaller', email || null
    );

    const created = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email, active, deactivatedOn FROM team_members WHERE id = ?').get(memberId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/team-members/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email, active, deactivatedOn FROM team_members WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE team_members 
      SET empCode = ?, name = ?, avatar = ?, role = ?, groupName = ?, phone = ?, 
          attendanceStatus = ?, checkInTime = ?, checkInMethod = ?, dialsToday = ?, 
          goalCalls = ?, connected = ?, interested = ?, salesAchieved = ?, 
          salesTarget = ?, conversionRate = ?, portal = ?, email = ?,
          active = ?, deactivatedOn = ?
      WHERE id = ?
    `).run(
      merged.empCode, merged.name, merged.avatar, merged.role, merged.group, merged.phone,
      merged.attendanceStatus, merged.checkInTime, merged.checkInMethod, merged.dialsToday,
      merged.goalCalls, merged.connected, merged.interested, merged.salesAchieved,
      merged.salesTarget, merged.conversionRate,
      merged.portal || 'telecaller', merged.email ?? null,
      merged.active === 0 ? 0 : 1, merged.deactivatedOn ?? null,
      id
    );

    const updated = db.prepare('SELECT id, empCode, name, avatar, role, groupName as "group", phone, attendanceStatus, checkInTime, checkInMethod, dialsToday, goalCalls, connected, interested, salesAchieved, salesTarget, conversionRate, portal, email, active, deactivatedOn FROM team_members WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
