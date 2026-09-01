import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db', 'data', 'tradenexus.sqlite');

try {
  const db = new Database(dbPath);
  const rows = db.prepare('SELECT * FROM attendance_records ORDER BY date DESC, checkIn DESC').all();
  console.log('Total attendance records in DB:', rows.length);
  console.log(JSON.stringify(rows.slice(0, 10), null, 2));
} catch (err) {
  console.log('Error querying attendance_records:', err.message);
}
