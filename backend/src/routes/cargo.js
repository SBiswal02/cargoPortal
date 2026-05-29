import { Router } from 'express';
import multer from 'multer';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { parseManifest } from '../utils/manifest.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/cargo', authenticate, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, cargo_code, manifest_date, weight_kg, destination, created_at
       FROM cargo
       ORDER BY weight_kg DESC`
    )
    .all();

  res.json({ cargo: rows });
});

router.post('/upload', authenticate, requireAdmin, upload.single('manifest'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'manifest file is required (field name: manifest).' });
  }

  const content = req.file.buffer.toString('utf-8');
  const { saved, skipped } = parseManifest(content);

  const insert = db.prepare(
    `INSERT INTO cargo (cargo_code, manifest_date, weight_kg, destination)
     VALUES (?, ?, ?, ?)`
  );

  const insertMany = db.transaction((records) => {
    for (const r of records) {
      insert.run(r.cargoCode, r.manifestDate, r.weightKg, r.destination);
    }
  });

  insertMany(saved);

  res.status(201).json({
    imported: saved.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  });
});

export default router;
