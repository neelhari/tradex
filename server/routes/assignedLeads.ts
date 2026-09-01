import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/assigned-leads
router.get('/', (req: Request, res: Response) => {
  try {
    const employeeId = String(req.query.employeeId || '').trim();
    const leads = employeeId
      ? db.prepare('SELECT * FROM assigned_leads WHERE assignedToEmployeeId = ? ORDER BY createdAt DESC').all(employeeId)
      : db.prepare('SELECT * FROM assigned_leads ORDER BY createdAt DESC').all();
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/assigned-leads
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, name, phone, email, company, city, assignedToEmployeeId, assignedToEmployeeName, batchId, assignedDate, status, notes, callCount, lastCallTimestamp, dealValue, followUpDate } = req.body;
    const leadId = id || `asg-${Date.now()}`;

    db.prepare(`
      INSERT INTO assigned_leads (id, name, phone, email, company, city, assignedToEmployeeId, assignedToEmployeeName, batchId, assignedDate, status, notes, callCount, lastCallTimestamp, dealValue, followUpDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      leadId, name || 'Lead', phone || '', email || '', company || 'Private Enterprise',
      city || 'Pan-India', assignedToEmployeeId || 'emp-101', assignedToEmployeeName || 'Arjun Kumar',
      batchId || 'batch-default', assignedDate || 'Today', status || 'PENDING',
      notes || '', callCount ? Number(callCount) : 0, lastCallTimestamp || null,
      dealValue ? Number(dealValue) : 0, followUpDate || null
    );

    const created = db.prepare('SELECT * FROM assigned_leads WHERE id = ?').get(leadId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/assigned-leads/bulk (For importing Excel / CSV leads)
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { fileName, targetEmployeeId, targetEmployeeName, leads } = req.body;
    const batchId = `batch-${Date.now()}`;

    // 1. Create batch
    db.prepare(`
      INSERT INTO lead_batches (id, fileName, uploadedAt, totalLeads, assignedToEmployeeName, assignedToEmployeeId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      batchId, fileName || 'imported_leads.xlsx', 'Just now',
      Array.isArray(leads) ? leads.length : 0, targetEmployeeName || 'Employee', targetEmployeeId || 'emp-101'
    );

    // 2. Insert assigned leads in a transaction
    const insertLead = db.prepare(`
      INSERT INTO assigned_leads (id, name, phone, email, company, city, assignedToEmployeeId, assignedToEmployeeName, batchId, assignedDate, status, notes, callCount, dealValue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((leadList: any[]) => {
      for (let i = 0; i < leadList.length; i++) {
        const lead = leadList[i];
        const leadId = `asg-${Date.now()}-${i}`;
        const email = lead.email || `${(lead.name || 'lead').toLowerCase().replace(/\s+/g, '.')}@example.com`;
        insertLead.run(
          leadId, lead.name || 'Lead', lead.phone || '', email,
          lead.company || 'Private Enterprise', lead.city || 'Pan-India',
          targetEmployeeId, targetEmployeeName, batchId, 'Today',
          'PENDING', `Imported via ${fileName}`, 0, 0
        );
      }
    });

    if (Array.isArray(leads) && leads.length > 0) {
      insertMany(leads);
    }

    const createdBatch = db.prepare('SELECT * FROM lead_batches WHERE id = ?').get(batchId);
    const createdLeads = db.prepare('SELECT * FROM assigned_leads WHERE batchId = ?').all(batchId);

    return res.status(201).json({ batch: createdBatch, leads: createdLeads });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/assigned-leads/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM assigned_leads WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Assigned lead not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE assigned_leads 
      SET name = ?, phone = ?, email = ?, company = ?, city = ?, 
          assignedToEmployeeId = ?, assignedToEmployeeName = ?, batchId = ?, 
          assignedDate = ?, status = ?, notes = ?, callCount = ?, 
          lastCallTimestamp = ?, dealValue = ?, followUpDate = ?
      WHERE id = ?
    `).run(
      merged.name, merged.phone, merged.email, merged.company, merged.city,
      merged.assignedToEmployeeId, merged.assignedToEmployeeName, merged.batchId,
      merged.assignedDate, merged.status, merged.notes, merged.callCount,
      merged.lastCallTimestamp, merged.dealValue, merged.followUpDate, id
    );

    const updated = db.prepare('SELECT * FROM assigned_leads WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
