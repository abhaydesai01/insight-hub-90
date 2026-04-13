import mongoose from "mongoose";

/**
 * Live policy session (FE: Session without polls — polls live in `polls` collection).
 * Collection: sessions
 */
const SessionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    /** Denormalized join count (incremented on each /join). */
    participantCount: { type: Number, default: 0 },
    createdAt: { type: Number, required: true },
    /** Admin who created the session (JWT `sub`). */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
  },
  { collection: "sessions" }
);

/** Plain session document (from `.lean()` / `.toObject()`). */
export type SessionLean = {
  _id: mongoose.Types.ObjectId;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  participantCount: number;
  createdAt: number;
  createdBy?: mongoose.Types.ObjectId | null;
};

export const SessionModel = mongoose.model("Session", SessionSchema);
