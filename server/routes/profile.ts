import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

/**
 * The same employee is held in two places: `team_members` is the roster Admin
 * manages, `employee_profiles` is what the employee sees. They are matched on
 * empCode. Anything Admin controls — name, team, job title, phone, reporting
 * leader — is taken from the roster, so an Admin edit reaches the employee
 * instead of the two records drifting apart.
 */
function mergedProfile() {
  const profile = db.prepare('SELECT * FROM employee_profiles LIMIT 1').get() as any;
  if (!profile) return null;

  const roster = db
    .prepare('SELECT * FROM team_members WHERE empCode = ?')
    .get(profile.empCode) as any;
  if (!roster) return profile;

  // Whoever leads their team is their reporting leader — never typed by hand
  const group = db
    .prepare('SELECT leaderName FROM team_groups WHERE name = ?')
    .get(roster.groupName) as { leaderName?: string } | undefined;

  return {
    ...profile,
    name: roster.name ?? profile.name,
    roleTitle: roster.role ?? profile.roleTitle,
    phone: roster.phone ?? profile.phone,
    email: roster.email ?? profile.email,
    teamName: roster.groupName ?? profile.teamName,
    teamLeaderName: group?.leaderName ?? profile.teamLeaderName,
    active: roster.active ?? 1,
  };
}

// GET /api/profile
router.get('/', (_req: Request, res: Response) => {
  try {
    const profile = mergedProfile();
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
