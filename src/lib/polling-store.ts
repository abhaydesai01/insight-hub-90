// In-memory polling store with localStorage persistence (prototype)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  responses: Record<string, string>;
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

export interface AdminProfile {
  name: string;
  email: string;
  department: string;
  designation: string;
}

interface PollingStore {
  sessions: Record<string, Session>;
  currentSessionCode: string | null;
  participantId: string | null;
  isAdmin: boolean;
  adminLoggedIn: boolean;
  adminProfile: AdminProfile | null;

  // Admin auth
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;

  // Admin actions
  createSession: (title: string, description: string) => string;
  addPoll: (sessionCode: string, question: string, type: QuestionType, options: PollOption[]) => void;
  launchPoll: (sessionCode: string, pollId: string) => void;
  closePoll: (sessionCode: string, pollId: string) => void;
  endSession: (sessionCode: string) => void;
  restartSession: (sessionCode: string) => void;
  resetPoll: (sessionCode: string, pollId: string) => void;
  resetAllPolls: (sessionCode: string) => void;

  // Participant actions
  joinSession: (code: string) => boolean;
  submitResponse: (sessionCode: string, pollId: string, response: string) => void;
  changeResponse: (sessionCode: string, pollId: string, response: string) => void;

  // Navigation
  setCurrentSession: (code: string | null) => void;
  setIsAdmin: (val: boolean) => void;

  // Stats
  getTotalSessions: () => number;
  getTotalResponses: () => number;
  getActiveSessions: () => number;
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const generateId = () => Math.random().toString(36).substring(2, 10);

// Demo admin credentials (prototype only)
const DEMO_ADMIN_EMAIL = 'admin@karnataka.gov.in';
const DEMO_ADMIN_PASSWORD = 'admin123';
const DEMO_ADMIN_PROFILE: AdminProfile = {
  name: 'Administrator',
  email: DEMO_ADMIN_EMAIL,
  department: 'Policy & Planning',
  designation: 'Senior Administrator',
};

export const usePollingStore = create<PollingStore>()(persist((set, get) => ({
  sessions: {},
  currentSessionCode: null,
  participantId: null,
  isAdmin: false,
  adminLoggedIn: false,
  adminProfile: null,

  adminLogin: (email, password) => {
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      set({ adminLoggedIn: true, isAdmin: true, adminProfile: DEMO_ADMIN_PROFILE });
      return true;
    }
    return false;
  },

  adminLogout: () => {
    set({ adminLoggedIn: false, isAdmin: false, adminProfile: null });
  },

  createSession: (title, description) => {
    const code = generateCode();
    // Auto-create a single Yes/No poll with the session
    const poll: Poll = {
      id: generateId(),
      question: '',
      type: 'binary',
      options: [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' },
      ],
      isActive: false,
      responses: {},
      createdAt: Date.now(),
    };
    const session: Session = {
      id: generateId(),
      code,
      title,
      description,
      polls: [poll],
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

  restartSession: (sessionCode) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            isActive: true,
          },
        },
      };
    });
  },

  resetPoll: (sessionCode, pollId) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            polls: session.polls.map((p) =>
              p.id === pollId ? { ...p, responses: {}, isActive: false } : p
            ),
          },
        },
      };
    });
  },

  resetAllPolls: (sessionCode) => {
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      return {
        sessions: {
          ...s.sessions,
          [sessionCode]: {
            ...session,
            polls: session.polls.map((p) => ({ ...p, responses: {}, isActive: false })),
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

  changeResponse: (sessionCode, pollId, response) => {
    const pid = get().participantId;
    if (!pid) return;
    set((s) => {
      const session = s.sessions[sessionCode];
      if (!session) return s;
      const poll = session.polls.find((p) => p.id === pollId);
      if (!poll || !poll.isActive) return s;
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

  getTotalSessions: () => Object.keys(get().sessions).length,
  getTotalResponses: () => {
    let total = 0;
    Object.values(get().sessions).forEach((s) => {
      s.polls.forEach((p) => {
        total += Object.keys(p.responses).length;
      });
    });
    return total;
  },
  getActiveSessions: () =>
    Object.values(get().sessions).filter((s) => s.isActive).length,
}), {
  name: 'policypoll-store',
}));
