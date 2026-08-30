import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/payslips
router.get('/', (req: Request, res: Response) => {
  try {
    const payslips = db.prepare('SELECT * FROM payslips ORDER BY year DESC, createdAt DESC').all();
    return res.status(200).json(payslips);
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
