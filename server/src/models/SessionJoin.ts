import mongoose from "mongoose";

/**
 * Audit trail for anonymous joins (each /join creates a new anonymous id).
 * Collection: session_joins
 */
const SessionJoinSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    participantId: { type: String, required: true },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { collection: "session_joins" }
);

SessionJoinSchema.index({ sessionId: 1, joinedAt: -1 });

export const SessionJoinModel = mongoose.model("SessionJoin", SessionJoinSchema);
