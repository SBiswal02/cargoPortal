const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { resolveRole } = require("../utils/roles");

const router = Router();

function signToken(user) {
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "24h" });
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (typeof normalizedEmail !== "string" || !normalizedEmail.includes("@")) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const role = resolveRole(normalizedEmail);
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const userRecord = await User.create({
      name: name || null,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });
    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
    };
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch {
    res.status(500).json({ error: "Failed to create user." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const row = await User.findOne({ where: { email: normalizedEmail } });
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = signToken(user);
  res.json({ user, token });
});

router.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret");
    res.json({ user: payload });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

module.exports = router;
