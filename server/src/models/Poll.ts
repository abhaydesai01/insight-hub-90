import mongoose from "mongoose";

const PollOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

/**
 * One poll belonging to a session (no votes here — see `votes` collection).
 * Collection: polls
 */
const PollSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    /** Stable id sent to the FE as `poll.id` */
    pollId: { type: String, required: true },
    question: { type: String, default: "" },
    type: { type: String, enum: ["binary", "mcq", "text"], required: true },
    options: { type: [PollOptionSchema], default: [] },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Number, required: true },
  },
  { collection: "polls" }
);

PollSchema.index({ sessionId: 1, pollId: 1 }, { unique: true });
PollSchema.index({ sessionId: 1, createdAt: 1 });

export type PollLean = {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  pollId: string;
  question: string;
  type: "binary" | "mcq" | "text";
  options: { id: string; label: string }[];
  isActive: boolean;
  createdAt: number;
};

export const PollModel = mongoose.model("Poll", PollSchema);
