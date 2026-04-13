import bcrypt from "bcryptjs";
import { Admin } from "./models/Admin.js";

export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@karnataka.gov.in").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrator";
  const department = process.env.ADMIN_DEPARTMENT || "Policy & Planning";
  const designation = process.env.ADMIN_DESIGNATION || "Senior Administrator";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({
    email,
    passwordHash,
    name,
    department,
    designation,
  });
  console.log("Seeded admin user:", email);
}
