function requireAdmin(req, res, next) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ error: "Clearance level inadequate." });
  }
  next();
}

module.exports = { requireAdmin };
