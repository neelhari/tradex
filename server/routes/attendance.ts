import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

interface OfficeRow {
  label: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
}

/** Straight-line distance between two coordinates, in metres. */
function metresBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Attendance rows carry a photo and coordinates, which only Admin may see.
 * Everyone else gets the same row with those three fields stripped out on the
 * server — hiding them in the browser would still send them over the wire.
 */
function forViewer(row: any, isAdmin: boolean) {
  if (isAdmin) return row;
  const { checkInPhoto, checkInLat, checkInLng, checkOutPhoto, checkOutLat, checkOutLng, ...rest } = row;
  return rest;
}

// GET /api/attendance?role=admin
router.get('/', (req: Request, res: Response) => {
  try {
    const isAdmin = String(req.query.role || '').toLowerCase() === 'admin';
    const records = db
      .prepare('SELECT * FROM attendance_records ORDER BY date DESC, checkIn DESC')
      .all();
    return res.status(200).json(records.map((r) => forViewer(r, isAdmin)));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/attendance/office — where the office is
router.get('/office', (_req: Request, res: Response) => {
  try {
    const office = db.prepare('SELECT * FROM office_settings LIMIT 1').get();
    return res.status(200).json(office);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/attendance/office — set the office address and how far counts as "at office"
router.put('/office', (req: Request, res: Response) => {
  try {
    const { label, latitude, longitude, radiusMeters } = req.body;
    const current = db.prepare('SELECT * FROM office_settings LIMIT 1').get() as any;
    db.prepare(
      `UPDATE office_settings
         SET label = ?, latitude = ?, longitude = ?, radiusMeters = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      label ?? current.label,
      latitude ?? current.latitude,
      longitude ?? current.longitude,
      radiusMeters ?? current.radiusMeters,
      current.id
    );
    return res.status(200).json(db.prepare('SELECT * FROM office_settings LIMIT 1').get());
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/attendance — check in (optionally with photo and location)
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id, date, dayNumber, status, checkIn, checkOut, workHours, method,
      employeeId, employeeName, checkInPhoto, latitude, longitude,
    } = req.body;

    const recDate = date || new Date().toISOString().split('T')[0];
    const recDay = dayNumber || new Date(recDate).getDate();
    // One record per employee per day
    const recId = id || `att-${recDate}-${employeeId || 'self'}`;

    // Judge the location against the office, if both are known
    let distance: number | null = null;
    let locationStatus = 'NOT_SHARED';

    if (latitude != null && longitude != null) {
      const office = db.prepare('SELECT * FROM office_settings LIMIT 1').get() as OfficeRow | undefined;
      if (office?.latitude != null && office?.longitude != null) {
        distance = metresBetween(latitude, longitude, office.latitude, office.longitude);
        locationStatus = distance <= office.radiusMeters ? 'AT_OFFICE' : 'AWAY';
      } else {
        locationStatus = 'OFFICE_NOT_SET';
      }
    }

    db.prepare(`
      INSERT INTO attendance_records
        (id, date, dayNumber, status, checkIn, checkOut, workHours, method,
         employeeId, employeeName, checkInPhoto, checkInLat, checkInLng,
         checkInDistanceM, locationStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        checkIn = coalesce(attendance_records.checkIn, excluded.checkIn),
        checkOut = coalesce(excluded.checkOut, attendance_records.checkOut),
        workHours = coalesce(excluded.workHours, attendance_records.workHours),
        method = coalesce(excluded.method, attendance_records.method),
        employeeName = coalesce(excluded.employeeName, attendance_records.employeeName),
        checkInPhoto = coalesce(attendance_records.checkInPhoto, excluded.checkInPhoto),
        checkInLat = coalesce(attendance_records.checkInLat, excluded.checkInLat),
        checkInLng = coalesce(attendance_records.checkInLng, excluded.checkInLng),
        checkInDistanceM = coalesce(attendance_records.checkInDistanceM, excluded.checkInDistanceM),
        locationStatus = coalesce(attendance_records.locationStatus, excluded.locationStatus)
    `).run(
      recId, recDate, recDay, status || 'PRESENT', checkIn || null, checkOut || null,
      workHours || 'In Progress', method || 'Face ID Biometric',
      employeeId || null, employeeName || null, checkInPhoto || null,
      latitude ?? null, longitude ?? null, distance, locationStatus
    );

    // Keep the roster in step so Admin's register shows today's status
    if (employeeId) {
      db.prepare(
        `UPDATE team_members SET attendanceStatus = ?, checkInTime = ?, checkInMethod = ? WHERE id = ?`
      ).run(status || 'PRESENT', checkIn || null, method || 'Face ID Biometric', employeeId);
    }

    const record = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recId);
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

/** "09:05 AM" -> minutes since midnight, or null if unparseable. */
function minutesOfDay(t?: string | null): number | null {
  if (!t) return null;
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  if (m[3]) {
    hours %= 12;
    if (m[3].toUpperCase() === 'PM') hours += 12;
  }
  return hours * 60 + parseInt(m[2], 10);
}

// PUT /api/attendance/:id — check out, or correct a record
router.put('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'Attendance record not found' });

    const { checkOutPhoto, latitude, longitude } = req.body;
    const merged = { ...existing, ...req.body };

    // Judge the check-out position the same way as the check-in
    let outDistance: number | null = existing.checkOutDistanceM ?? null;
    let outStatus: string | null = existing.checkOutLocationStatus ?? null;

    if (latitude != null && longitude != null) {
      const office = db.prepare('SELECT * FROM office_settings LIMIT 1').get() as OfficeRow | undefined;
      if (office?.latitude != null && office?.longitude != null) {
        outDistance = metresBetween(latitude, longitude, office.latitude, office.longitude);
        outStatus = outDistance <= office.radiusMeters ? 'AT_OFFICE' : 'AWAY';
      } else {
        outStatus = 'OFFICE_NOT_SET';
      }
    } else if (merged.checkOut && !outStatus) {
      outStatus = 'NOT_SHARED';
    }

    // Hours worked, once both ends of the day are known
    let workHours = merged.workHours;
    const start = minutesOfDay(merged.checkIn);
    const end = minutesOfDay(merged.checkOut);
    if (start != null && end != null && end >= start) {
      const mins = end - start;
      workHours = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
    }

    db.prepare(
      `UPDATE attendance_records
         SET status = ?, checkIn = ?, checkOut = ?, workHours = ?, method = ?,
             checkOutPhoto = coalesce(?, checkOutPhoto),
             checkOutLat = coalesce(?, checkOutLat),
             checkOutLng = coalesce(?, checkOutLng),
             checkOutDistanceM = ?, checkOutLocationStatus = ?
       WHERE id = ?`
    ).run(
      merged.status, merged.checkIn, merged.checkOut, workHours, merged.method,
      checkOutPhoto ?? null, latitude ?? null, longitude ?? null,
      outDistance, outStatus, req.params.id
    );

    return res.status(200).json(db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(req.params.id));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
