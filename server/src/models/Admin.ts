import mongoose from "mongoose";

/**
 * Dashboard operators (FE: admin login / portal).
 * Collection: admins
 */
const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    /** Reserved for future RBAC; FE ignores today. */
    role: { type: String, enum: ["admin", "moderator"], default: "admin" },
  },
  { timestamps: true, collection: "admins" }
);

export const Admin = mongoose.model("Admin", AdminSchema);
