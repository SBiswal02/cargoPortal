// Task 2: POST /api/upload (Admin) and GET /api/cargo (authenticated)

const fs = require("fs");
const path = require("path");
const { Router } = require("express");
const multer = require("multer");
const Cargo = require("../models/Cargo");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { parseManifest } = require("../utils/parser");

const router = Router();
const uploadsDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.get("/cargo", authenticate, async (_req, res) => {
  const rows = await Cargo.findAll({
    attributes: ["id", "cargo_code", "manifest_date", "weight_kg", "destination", "created_at"],
    order: [["weight_kg", "DESC"]],
    raw: true,
  });

  res.json({ cargo: rows });
});

router.post("/upload", authenticate, requireAdmin, upload.single("manifest"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "manifest file is required (field name: manifest)." });
  }

  const content = fs.readFileSync(req.file.path, "utf-8");
  const { saved, skipped } = parseManifest(content);

  await Cargo.bulkCreate(
    saved.map((record) => ({
      cargo_code: record.cargoCode,
      manifest_date: record.manifestDate,
      weight_kg: record.weightKg,
      destination: record.destination,
    }))
  );

  res.status(201).json({
    imported: saved.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  });
});

module.exports = router;
