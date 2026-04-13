export type QuestionType = "binary" | "mcq" | "text";

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

export type SessionPublicPoll = Omit<Poll, "responses">;

export interface SessionPublic {
  id: string;
  code: string;
  title: string;
  description: string;
  polls: SessionPublicPoll[];
  isActive: boolean;
  createdAt: number;
  participantCount: number;
}

export interface LiveSessionResponse {
  session: SessionPublic;
  participant: {
    id: string;
    activePollId: string | null;
    myVote: string | null;
  } | null;
}

export interface SessionListResponse {
  sessions: Session[];
  stats: {
    totalSessions: number;
    activeSessions: number;
    totalResponses: number;
  };
}
