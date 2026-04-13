import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { clearAdminAuth, getAdminProfile, getAdminToken, setAdminAuth } from "@/lib/auth-storage";
import type { AdminProfile } from "@/types/polling";

type AdminAuthContextValue = {
  ready: boolean;
  token: string | null;
  profile: AdminProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [profile, setProfile] = useState<AdminProfile | null>(() => getAdminProfile());

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      setReady(true);
      return;
    }
    void api
      .authMe(t)
      .then((me) => {
        setProfile(me.admin);
        setAdminAuth(t, me.admin);
        setToken(t);
      })
      .catch(() => {
        clearAdminAuth();
        setToken(null);
        setProfile(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.authLogin(email, password);
    setAdminAuth(res.token, res.admin);
    setToken(res.token);
    setProfile(res.admin);
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ ready, token, profile, login, logout }),
    [ready, token, profile, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
