import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

const MONTH_ORDER: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

// GET /api/payslips - Sorted chronologically (newest first)
router.get('/', (req: Request, res: Response) => {
  try {
    const payslips = db.prepare('SELECT * FROM payslips').all() as any[];
    
    // Sort strictly chronologically: Year DESC, Month Number DESC
    payslips.sort((a, b) => {
      const yearDiff = (Number(b.year) || 0) - (Number(a.year) || 0);
      if (yearDiff !== 0) return yearDiff;
      const aMonth = MONTH_ORDER[a.month?.toLowerCase()?.trim()] || 0;
      const bMonth = MONTH_ORDER[b.month?.toLowerCase()?.trim()] || 0;
      return bMonth - aMonth;
    });

    // Support optional ?limit=3 (rolling N months window)
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = limit && !isNaN(limit) ? payslips.slice(0, limit) : payslips;

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/payslips
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, month, year, basicSalary, hra, specialAllowance, incentives, pfDeduction, taxDeduction, netPay, generatedDate, status } = req.body;
    const payId = id || `pay-${Date.now()}`;

    db.prepare(`
      INSERT INTO payslips (id, month, year, basicSalary, hra, specialAllowance, incentives, pfDeduction, taxDeduction, netPay, generatedDate, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payId, month, Number(year) || 2025, Number(basicSalary) || 0, Number(hra) || 0,
      Number(specialAllowance) || 0, Number(incentives) || 0, Number(pfDeduction) || 0,
      Number(taxDeduction) || 0, Number(netPay) || 0, generatedDate || 'Today', status || 'PAID'
    );

    const created = db.prepare('SELECT * FROM payslips WHERE id = ?').get(payId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/payslips/bulk
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const payId = `pay-${year}-${month.toLowerCase()}-${Date.now()}`;
    const basic = 38000;
    const hra = 14000;
    const specialAllowance = 6500;
    const incentives = 22500;
    const pfDeduction = 2400;
    const taxDeduction = 2600;
    const netPay = (basic + hra + specialAllowance + incentives) - (pfDeduction + taxDeduction);

    db.prepare(`
      INSERT INTO payslips (id, month, year, basicSalary, hra, specialAllowance, incentives, pfDeduction, taxDeduction, netPay, generatedDate, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payId, month, Number(year) || 2025, basic, hra, specialAllowance,
      incentives, pfDeduction, taxDeduction, netPay, `01 ${month} ${year}`, 'PAID'
    );

    const created = db.prepare('SELECT * FROM payslips WHERE id = ?').get(payId);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
