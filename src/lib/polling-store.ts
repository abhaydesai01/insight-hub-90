// In-memory polling store (will be replaced with Supabase later)
import { create } from 'zustand';

export type QuestionType = 'binary' | 'mcq' | 'text';

export interface PollOption {
  id: string;
  label: string;
}

export interface Poll {
  id: string;
  question: string;
  type: QuestionType;
  options: PollOption[];
  isActive: boolean;
  responses: Record<string, string>; // sessionId -> optionId or text
  createdAt: number;
}

export interface Session {
  id: string;
  code: string;
  title: string;
  description: string;
  polls: Poll[];
  isActive: boolean;
  createdAt: number;
  participantCount: number;
}

interface PollingStore {
  sessions: Record<string, Session>;
  currentSessionCode: string | null;
  participantId: string | null;
  isAdmin: boolean;

  // Admin actions
  createSession: (title: string, description: string) => string;
  addPoll: (sessionCode: string, question: string, type: QuestionType, options: PollOption[]) => void;
  launchPoll: (sessionCode: string, pollId: string) => void;
  closePoll: (sessionCode: string, pollId: string) => void;
  endSession: (sessionCode: string) => void;

  // Participant actions
  joinSession: (code: string) => boolean;
  submitResponse: (sessionCode: string, pollId: string, response: string) => void;

  // Navigation
  setCurrentSession: (code: string | null) => void;
  setIsAdmin: (val: boolean) => void;
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const generateId = () => Math.random().toString(36).substring(2, 10);

export const usePollingStore = create<PollingStore>((set, get) => ({
  sessions: {},
  currentSessionCode: null,
  participantId: null,
  isAdmin: false,

  createSession: (title, description) => {
    const code = generateCode();
    const session: Session = {
      id: generateId(),
      code,
      title,
      description,
      polls: [],
      isActive: true,
      createdAt: Date.now(),
      participantCount: 0,
    };
    set((s) => ({ sessions: { ...s.sessions, [code]: session } }));
    return code;
  },

  addPoll: (sessionCode, question, type, options) => {
    const poll: Poll = {
      id: generateId(),
      question,
      type,
      options,
      isActive: false,
      responses: {},
      createdAt: Date.now(),
    };
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: { ...session, polls: [...session.polls, poll] },
        },
      };
    });
  },

  launchPoll: (sessionCode, pollId) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            polls: session.polls.map((p) => ({
              ...p,
              isActive: p.id === pollId,
            })),
          },
        },
      };
    });
  },

  closePoll: (sessionCode, pollId) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            polls: session.polls.map((p) =>
              p.id === pollId ? { ...p, isActive: false } : p
            ),
          },
        },
      };
    });
  },

  endSession: (sessionCode) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            isActive: false,
            polls: session.polls.map((p) => ({ ...p, isActive: false })),
          },
        },
      };
    });
  },

  joinSession: (code) => {
    const session = get().sessions[code.toUpperCase()];
    if (!session || !session.isActive) return false;
    const pid = generateId();
    set((s) => ({
      participantId: pid,
      currentSessionCode: code.toUpperCase(),
      sessions: {
        ...s.sessions,
        [code.toUpperCase()]: {
          ...session,
          participantCount: session.participantCount + 1,
        },
      },
    }));
    return true;
  },

  submitResponse: (sessionCode, pollId, response) => {
    const pid = get().participantId;
    if (!pid) return;
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            polls: session.polls.map((p) =>
              p.id === pollId
                ? { ...p, responses: { ...p.responses, [pid]: response } }
                : p
            ),
          },
        },
      };
    });
  },

  setCurrentSession: (code) => set({ currentSessionCode: code }),
  setIsAdmin: (val) => set({ isAdmin: val }),
}));
