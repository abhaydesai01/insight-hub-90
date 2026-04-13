import type {
  AdminProfile,
  LiveSessionResponse,
  Session,
  SessionListResponse,
} from "@/types/polling";

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

async function request<T>(path: string, init?: RequestInit & { token?: string | null }): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = init?.token;
  const { token: _t, ...rest } = init || {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, { ...rest, headers });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  authLogin(email: string, password: string) {
    return request<{ token: string; admin: AdminProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  authMe(token: string) {
    return request<{ admin: AdminProfile }>("/auth/me", { method: "GET", token });
  },

  listSessions(token: string) {
    return request<SessionListResponse>("/sessions/", { method: "GET", token });
  },

  createSession(token: string, title: string, description: string) {
    return request<{ session: Session }>("/sessions/", {
      method: "POST",
      token,
      body: JSON.stringify({ title, description }),
    });
  },

  getSessionAdmin(token: string, code: string) {
    return request<{ session: Session }>(`/sessions/${encodeURIComponent(code)}/admin`, {
      method: "GET",
      token,
    });
  },

  getSessionLive(code: string, participantToken?: string | null) {
    return request<LiveSessionResponse>(`/sessions/${encodeURIComponent(code)}/live`, {
      method: "GET",
      token: participantToken || undefined,
    });
  },

  joinSession(code: string) {
    return request<{ participantToken: string; participantId: string; code: string }>(
      `/sessions/${encodeURIComponent(code)}/join`,
      { method: "POST", body: JSON.stringify({}) }
    );
  },

  launchPoll(token: string, code: string, pollId: string) {
    return request<{ session: Session }>(
      `/sessions/${encodeURIComponent(code)}/polls/${encodeURIComponent(pollId)}/launch`,
      { method: "POST", token, body: JSON.stringify({}) }
    );
  },

  closePoll(token: string, code: string, pollId: string) {
    return request<{ session: Session }>(
      `/sessions/${encodeURIComponent(code)}/polls/${encodeURIComponent(pollId)}/close`,
      { method: "POST", token, body: JSON.stringify({}) }
    );
  },

  resetPoll(token: string, code: string, pollId: string) {
    return request<{ session: Session }>(
      `/sessions/${encodeURIComponent(code)}/polls/${encodeURIComponent(pollId)}/reset`,
      { method: "POST", token, body: JSON.stringify({}) }
    );
  },

  endSession(token: string, code: string) {
    return request<{ session: Session }>(`/sessions/${encodeURIComponent(code)}/end`, {
      method: "POST",
      token,
      body: JSON.stringify({}),
    });
  },

  restartSession(token: string, code: string) {
    return request<{ session: Session }>(`/sessions/${encodeURIComponent(code)}/restart`, {
      method: "POST",
      token,
      body: JSON.stringify({}),
    });
  },

  submitVote(participantToken: string, code: string, pollId: string, response: string) {
    return request<{ ok: boolean }>(`/sessions/${encodeURIComponent(code)}/vote`, {
      method: "POST",
      token: participantToken,
      body: JSON.stringify({ pollId, response }),
    });
  },
};
