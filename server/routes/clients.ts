import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/clients
router.get('/', (req: Request, res: Response) => {
  try {
    const clients = db.prepare('SELECT * FROM client_leads ORDER BY createdAt DESC').all();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/clients
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, name, company, phone, email, temperature, status, dueTime, dealValue, requirement, lastContacted } = req.body;
    const clientId = id || `lead-${Date.now()}`;

    db.prepare(`
      INSERT INTO client_leads (id, name, company, phone, email, temperature, status, dueTime, dealValue, requirement, lastContacted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      clientId, name || 'Lead', company || '', phone || '', email || '',
      temperature || 'WARM', status || 'Pending', dueTime || null,
      dealValue ? Number(dealValue) : 0, requirement || '', lastContacted || 'Just now'
    );

    const created = db.prepare('SELECT * FROM client_leads WHERE id = ?').get(clientId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/clients/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM client_leads WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE client_leads 
      SET name = ?, company = ?, phone = ?, email = ?, temperature = ?, status = ?, 
          dueTime = ?, dealValue = ?, requirement = ?, lastContacted = ?
      WHERE id = ?
    `).run(
      merged.name, merged.company, merged.phone, merged.email, merged.temperature,
      merged.status, merged.dueTime, merged.dealValue, merged.requirement,
      merged.lastContacted, id
    );

    const updated = db.prepare('SELECT * FROM client_leads WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM client_leads WHERE id = ?').run(id);
    return res.status(200).json({ success: true, message: 'Client deleted' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
