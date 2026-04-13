import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { requireAdmin, type AdminJwtPayload } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const payload: AdminJwtPayload = {
    typ: "admin",
    sub: String(admin._id),
    email: admin.email,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    admin: {
      name: admin.name,
      email: admin.email,
      department: admin.department,
      designation: admin.designation,
    },
  });
});

router.get("/me", requireAdmin, async (req, res) => {
  const { adminPayload } = req as typeof req & { adminPayload: AdminJwtPayload };
  const admin = await Admin.findById(adminPayload.sub).lean();
  if (!admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({
    admin: {
      name: admin.name,
      email: admin.email,
      department: admin.department,
      designation: admin.designation,
    },
  });
});

export default router;
