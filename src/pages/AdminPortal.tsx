import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import {
  Plus,
  BarChart3,
  Users,
  Activity,
  ArrowRight,
  RotateCcw,
  Clock,
} from "lucide-react";

const AdminPortal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ready, token, profile } = useAdminAuth();

  useEffect(() => {
    if (ready && !token) {
      navigate("/admin/login");
    }
  }, [ready, token, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", "list", token],
    queryFn: () => api.listSessions(token!),
    enabled: !!token && ready,
  });

  if (!ready || !token) {
    return null;
  }

  const sessionList = data?.sessions ?? [];
  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">
              Welcome, {profile?.name} — {profile?.department}
            </p>
          </div>
          <Button variant="hero" onClick={() => navigate("/admin/create")}>
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : stats?.totalSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : stats?.activeSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : stats?.totalResponses ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold">All Sessions</h2>

        {sessionList.length === 0 && !isLoading && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
            No sessions created yet. Click &quot;New Session&quot; to start.
          </div>
        )}

        <div className="space-y-4">
          {sessionList.map((session) => {
            const poll = session.polls[0];
            const totalResponses = poll ? Object.keys(poll.responses).length : 0;
            const yesCount = poll ? Object.values(poll.responses).filter((r) => r === "yes").length : 0;
            const noCount = poll ? Object.values(poll.responses).filter((r) => r === "no").length : 0;
            const createdDate = new Date(session.createdAt).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" }
            );

            return (
              <div
                key={session.id}
                className="rounded-xl border bg-card p-5 card-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{session.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.isActive
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!session.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await api.restartSession(token, session.code);
                          await queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restart
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/${session.code}`)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Manage
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>
                    Code:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {session.code}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {createdDate}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <p className="text-lg font-bold">{totalResponses}</p>
                    <p className="text-xs text-muted-foreground">Total Votes</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-3 text-center">
                    <p className="text-lg font-bold text-success">{yesCount}</p>
                    <p className="text-xs text-muted-foreground">Yes</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-3 text-center">
                    <p className="text-lg font-bold text-destructive">{noCount}</p>
                    <p className="text-xs text-muted-foreground">No</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  {session.participantCount} participants joined
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
