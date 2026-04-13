import mongoose from "mongoose";

/**
 * One anonymous vote (participantId comes from participant JWT, not PII).
 * Collection: votes
 */
const VoteSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    pollId: { type: String, required: true, index: true },
    participantId: { type: String, required: true, index: true },
    value: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "votes" }
);

VoteSchema.index({ sessionId: 1, pollId: 1, participantId: 1 }, { unique: true });
VoteSchema.index({ sessionId: 1, pollId: 1 });

export type VoteLean = {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  pollId: string;
  participantId: string;
  value: string;
  createdAt: number;
  updatedAt: number;
};

export const VoteModel = mongoose.model("Vote", VoteSchema);
