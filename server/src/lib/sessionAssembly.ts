import type { Types } from "mongoose";
import { PollModel, type PollLean } from "../models/Poll.js";
import { SessionModel, type SessionLean } from "../models/Session.js";
import { VoteModel, type VoteLean } from "../models/Vote.js";

/** Wire shape expected by the React app (`src/types/polling.ts`). */
export type PollJson = {
  id: string;
  question: string;
  type: "binary" | "mcq" | "text";
  options: { id: string; label: string }[];
  isActive: boolean;
  createdAt: number;
  responses: Record<string, string>;
};

export type SessionJson = {
  id: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  participantCount: number;
  createdAt: number;
  polls: PollJson[];
};

function pollToBase(p: PollLean): Omit<PollJson, "responses"> {
  return {
    id: p.pollId,
    question: p.question,
    type: p.type as PollJson["type"],
    options: (p.options ?? []).map((o) => ({ id: o.id, label: o.label })),
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

async function loadPollsForSession(
  sessionId: Types.ObjectId,
  includeResponses: boolean
): Promise<PollJson[]> {
  const polls = (await PollModel.find({ sessionId }).sort({ createdAt: 1 }).lean()) as PollLean[];
  if (polls.length === 0) return [];
  if (!includeResponses) {
    return polls.map((p) => ({ ...pollToBase(p), responses: {} }));
  }
  const pollIds = polls.map((p) => p.pollId);
  const votes = (await VoteModel.find({
    sessionId,
    pollId: { $in: pollIds },
  }).lean()) as VoteLean[];
  const byPoll = new Map<string, Record<string, string>>();
  for (const pid of pollIds) {
    byPoll.set(pid, {});
  }
  for (const v of votes) {
    const bucket = byPoll.get(v.pollId);
    if (bucket) bucket[v.participantId] = v.value;
  }
  return polls.map((p) => ({
    ...pollToBase(p),
    responses: byPoll.get(p.pollId) ?? {},
  }));
}

export async function sessionToAdminJson(session: SessionLean): Promise<SessionJson> {
  const polls = await loadPollsForSession(session._id, true);
  return {
    id: String(session._id),
    code: session.code,
    title: session.title,
    description: session.description,
    isActive: session.isActive,
    participantCount: session.participantCount,
    createdAt: session.createdAt,
    polls,
  };
}

export async function sessionToPublicJson(session: SessionLean): Promise<SessionJson> {
  const polls = await loadPollsForSession(session._id, false);
  return {
    id: String(session._id),
    code: session.code,
    title: session.title,
    description: session.description,
    isActive: session.isActive,
    participantCount: session.participantCount,
    createdAt: session.createdAt,
    polls,
  };
}

export async function getParticipantLiveView(
  session: SessionLean,
  participantId: string | null
): Promise<{
  session: SessionJson;
  participant: { id: string; activePollId: string | null; myVote: string | null } | null;
}> {
  const sessionJson = await sessionToPublicJson(session);
  const active = (await PollModel.findOne({ sessionId: session._id, isActive: true }).lean()) as PollLean | null;
  if (!participantId) {
    return { session: sessionJson, participant: null };
  }
  let myVote: string | null = null;
  if (active) {
    const v = await VoteModel.findOne({
      sessionId: session._id,
      pollId: active.pollId,
      participantId,
    }).lean();
    myVote = v?.value ?? null;
  }
  return {
    session: sessionJson,
    participant: {
      id: participantId,
      activePollId: active ? active.pollId : null,
      myVote,
    },
  };
}

export async function findSessionByCode(code: string) {
  return SessionModel.findOne({ code: code.toUpperCase() });
}
