import { Router, Request, Response } from 'express';
import db from '../db/connection.js';

const router = Router();

/**
 * Individual employee documents — ID proofs, certificates, contracts (scope §11).
 * Files are held as data URLs alongside the record, which keeps the whole system
 * in one SQLite file with no separate storage to configure.
 */

// GET /api/employee-documents?employeeId=...
// The file content is deliberately left out of the list so a long list stays light.
router.get('/', (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    const sql = `
      SELECT id, employeeId, title, category, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt
      FROM employee_documents
      ${employeeId ? 'WHERE employeeId = ?' : ''}
      ORDER BY uploadedAt DESC
    `;
    const rows = employeeId
      ? db.prepare(sql).all(employeeId)
      : db.prepare(sql).all();
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/employee-documents/:id — the full document, including its content
router.get('/:id', (req: Request, res: Response) => {
  try {
    const doc = db.prepare('SELECT * FROM employee_documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    return res.status(200).json(doc);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/employee-documents
router.post('/', (req: Request, res: Response) => {
  try {
    const { employeeId, title, category, fileName, mimeType, sizeBytes, content, uploadedBy } = req.body;

    if (!employeeId || !fileName || !content) {
      return res.status(400).json({ error: 'employeeId, fileName and content are required' });
    }

    // Roughly 8 MB of base64, which is about 6 MB of actual file
    if (typeof content === 'string' && content.length > 8_000_000) {
      return res.status(413).json({ error: 'That file is too large. Please keep documents under 5 MB.' });
    }

    const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    db.prepare(`
      INSERT INTO employee_documents
        (id, employeeId, title, category, fileName, mimeType, sizeBytes, content, uploadedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, employeeId, title || fileName, category || 'Other', fileName,
      mimeType || null, sizeBytes || null, content, uploadedBy || 'Admin'
    );

    const { content: _omit, ...saved } = db
      .prepare('SELECT * FROM employee_documents WHERE id = ?')
      .get(id) as any;
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/employee-documents/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM employee_documents WHERE id = ?').run(req.params.id);
    if (!result.changes) return res.status(404).json({ error: 'Document not found' });
    return res.status(200).json({ deleted: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
