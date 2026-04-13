import { Router, type Request } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { SessionModel, type SessionLean } from "../models/Session.js";
import { PollModel } from "../models/Poll.js";
import { VoteModel } from "../models/Vote.js";
import { SessionJoinModel } from "../models/SessionJoin.js";
import { requireAdmin, readParticipantToken, type AdminJwtPayload } from "../middleware/auth.js";
import { generateSessionCode } from "../lib/code.js";
import {
  findSessionByCode,
  getParticipantLiveView,
  sessionToAdminJson,
} from "../lib/sessionAssembly.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

function participantBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

async function allocateCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = generateSessionCode();
    const exists = await SessionModel.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Could not allocate session code");
}

router.post("/", requireAdmin, async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Title required" });
  }
  const { adminPayload } = req as Request & { adminPayload: AdminJwtPayload };
  const adminId = new mongoose.Types.ObjectId(adminPayload.sub);

  const code = await allocateCode();
  const now = Date.now();
  const pollId = nanoid(10);

  const session = await SessionModel.create({
    code,
    title,
    description,
    isActive: true,
    participantCount: 0,
    createdAt: now,
    createdBy: adminId,
  });

  await PollModel.create({
    sessionId: session._id,
    pollId,
    question: "",
    type: "binary",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    isActive: false,
    createdAt: now,
  });

  const json = await sessionToAdminJson(session.toObject() as SessionLean);
  return res.status(201).json({ session: json });
});

router.get("/", requireAdmin, async (_req, res) => {
  const rows = await SessionModel.find().sort({ createdAt: -1 }).lean();
  const sessions = await Promise.all(rows.map((r) => sessionToAdminJson(r)));
  const totalResponses = await VoteModel.countDocuments();
  const activeSessions = await SessionModel.countDocuments({ isActive: true });
  return res.json({
    sessions,
    stats: {
      totalSessions: sessions.length,
      activeSessions,
      totalResponses,
    },
  });
});

router.get("/:code/admin", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const doc = await findSessionByCode(code);
  if (!doc) {
    return res.status(404).json({ error: "Session not found" });
  }
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.get("/:code/live", async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const doc = await findSessionByCode(code);
  if (!doc) {
    return res.status(404).json({ error: "Session not found" });
  }
  const token = participantBearer(req);
  let participantId: string | null = null;
  if (token) {
    const payload = readParticipantToken(token);
    if (payload && payload.code === code) {
      participantId = payload.sub;
    }
  }
  const live = await getParticipantLiveView(doc.toObject() as SessionLean, participantId);
  return res.json(live);
});

router.post("/:code/join", async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const doc = await findSessionByCode(code);
  if (!doc || !doc.isActive) {
    return res.status(400).json({ error: "Invalid or inactive session" });
  }
  const participantId = nanoid(12);
  const payload = { typ: "participant" as const, sub: participantId, code };
  const participantToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" });

  await SessionJoinModel.create({
    sessionId: doc._id,
    participantId,
  });
  doc.participantCount += 1;
  await doc.save();

  return res.json({ participantToken, participantId, code: doc.code });
});

router.post("/:code/polls/:pollId/launch", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const pollId = String(req.params.pollId || "");
  const doc = await findSessionByCode(code);
  if (!doc) return res.status(404).json({ error: "Session not found" });
  if (!doc.isActive) return res.status(400).json({ error: "Session is not active" });

  await PollModel.updateMany({ sessionId: doc._id }, { $set: { isActive: false } });
  const updated = await PollModel.findOneAndUpdate(
    { sessionId: doc._id, pollId },
    { $set: { isActive: true } },
    { new: true }
  );
  if (!updated) {
    return res.status(404).json({ error: "Poll not found" });
  }
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.post("/:code/polls/:pollId/close", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const pollId = String(req.params.pollId || "");
  const doc = await findSessionByCode(code);
  if (!doc) return res.status(404).json({ error: "Session not found" });
  await PollModel.updateOne({ sessionId: doc._id, pollId }, { $set: { isActive: false } });
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.post("/:code/polls/:pollId/reset", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const pollId = String(req.params.pollId || "");
  const doc = await findSessionByCode(code);
  if (!doc) return res.status(404).json({ error: "Session not found" });
  await PollModel.updateOne({ sessionId: doc._id, pollId }, { $set: { isActive: false } });
  await VoteModel.deleteMany({ sessionId: doc._id, pollId });
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.post("/:code/end", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const doc = await findSessionByCode(code);
  if (!doc) return res.status(404).json({ error: "Session not found" });
  doc.isActive = false;
  await doc.save();
  await PollModel.updateMany({ sessionId: doc._id }, { $set: { isActive: false } });
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.post("/:code/restart", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const doc = await findSessionByCode(code);
  if (!doc) return res.status(404).json({ error: "Session not found" });
  doc.isActive = true;
  await doc.save();
  const session = await sessionToAdminJson(doc.toObject() as SessionLean);
  return res.json({ session });
});

router.post("/:code/vote", async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const token = participantBearer(req);
  if (!token) return res.status(401).json({ error: "Participant token required" });
  const payload = readParticipantToken(token);
  if (!payload || payload.code !== code) {
    return res.status(401).json({ error: "Invalid participant token" });
  }
  const pollId = String(req.body?.pollId || "");
  const response = String(req.body?.response || "");
  if (!pollId || !response) {
    return res.status(400).json({ error: "pollId and response required" });
  }
  const doc = await findSessionByCode(code);
  if (!doc || !doc.isActive) {
    return res.status(400).json({ error: "Session not available" });
  }
  const poll = await PollModel.findOne({ sessionId: doc._id, pollId }).lean();
  if (!poll || !poll.isActive) {
    return res.status(400).json({ error: "Poll is not active" });
  }
  const allowed = poll.type === "text" || poll.options.some((o) => o.id === response);
  if (!allowed) {
    return res.status(400).json({ error: "Invalid option" });
  }

  const now = Date.now();
  await VoteModel.findOneAndUpdate(
    { sessionId: doc._id, pollId, participantId: payload.sub },
    {
      $set: { value: response, updatedAt: now },
      $setOnInsert: {
        sessionId: doc._id,
        pollId,
        participantId: payload.sub,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  return res.json({ ok: true });
});

export default router;
