import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/payments
router.get('/', (req: Request, res: Response) => {
  try {
    const payments = db.prepare('SELECT * FROM payment_verifications ORDER BY createdAt DESC').all();
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/payments
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, leadName, companyName, telecallerName, dealAmount, utrNumber, paymentMode, timestamp, status, receiptUrl } = req.body;
    const payId = id || `pay-${Date.now()}`;

    db.prepare(`
      INSERT INTO payment_verifications (id, leadName, companyName, telecallerName, dealAmount, utrNumber, paymentMode, timestamp, status, receiptUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payId, leadName || 'Client', companyName || 'Company', telecallerName || 'Telecaller',
      dealAmount ? Number(dealAmount) : 0, utrNumber || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      paymentMode || 'Online Bank Transfer', timestamp || 'Just now',
      status || 'PENDING_HR_AUDIT', receiptUrl || null
    );

    const created = db.prepare('SELECT * FROM payment_verifications WHERE id = ?').get(payId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/payments/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM payment_verifications WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Payment verification not found' });
    }

    const merged = { ...existing, ...req.body };
    db.prepare(`
      UPDATE payment_verifications 
      SET leadName = ?, companyName = ?, telecallerName = ?, dealAmount = ?, 
          utrNumber = ?, paymentMode = ?, timestamp = ?, status = ?, receiptUrl = ?
      WHERE id = ?
    `).run(
      merged.leadName, merged.companyName, merged.telecallerName, merged.dealAmount,
      merged.utrNumber, merged.paymentMode, merged.timestamp, merged.status,
      merged.receiptUrl, id
    );

    const updated = db.prepare('SELECT * FROM payment_verifications WHERE id = ?').get(id);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
