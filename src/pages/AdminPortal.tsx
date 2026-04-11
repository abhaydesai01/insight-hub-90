import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePollingStore } from "@/lib/polling-store";
import Header from "@/components/Header";
import {
  Plus,
  BarChart3,
  Users,
  Activity,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

const AdminPortal = () => {
  const navigate = useNavigate();
  const {
    sessions,
    adminLoggedIn,
    adminProfile,
    getTotalSessions,
    getTotalResponses,
    getActiveSessions,
    restartSession,
  } = usePollingStore();

  if (!adminLoggedIn) {
    navigate("/admin/login");
    return null;
  }

  const sessionList = Object.values(sessions).sort(
    (a, b) => b.createdAt - a.createdAt
  );

  const stats = [
    { label: "Total Sessions", value: getTotalSessions(), icon: BarChart3 },
    { label: "Active Sessions", value: getActiveSessions(), icon: Activity },
    { label: "Total Responses", value: getTotalResponses(), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in">
        {/* Welcome */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">
              Welcome, {adminProfile?.name} — {adminProfile?.department}
            </p>
          </div>
          <Button variant="hero" onClick={() => navigate("/admin/create")}>
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-card p-5 card-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold animate-count-up">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sessions list with per-session stats */}
        <h2 className="mb-4 text-lg font-semibold">All Sessions</h2>

        {sessionList.length === 0 && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
            No sessions created yet. Click "New Session" to start.
          </div>
        )}

        <div className="space-y-4">
          {sessionList.map((session) => {
            const totalPolls = session.polls.length;
            const totalResponses = session.polls.reduce(
              (acc, p) => acc + Object.keys(p.responses).length,
              0
            );
            const activePolls = session.polls.filter((p) => p.isActive).length;
            const closedPolls = session.polls.filter(
              (p) => !p.isActive && Object.keys(p.responses).length > 0
            ).length;
            const avgResponses =
              totalPolls > 0 ? Math.round(totalResponses / totalPolls) : 0;
            const createdDate = new Date(session.createdAt).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" }
            );

            return (
              <div
                key={session.id}
                className="rounded-xl border bg-card p-5 card-shadow transition-shadow hover:card-shadow-lg"
              >
                {/* Session header row */}
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
                        onClick={() => restartSession(session.code)}
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

                {/* Session code & date */}
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

                {/* Per-session stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <MessageSquare className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-lg font-bold">{totalPolls}</p>
                    <p className="text-xs text-muted-foreground">Total Polls</p>
                  </div>
                  <div className="rounded-lg bg-success/5 p-3 text-center">
                    <Activity className="mx-auto mb-1 h-4 w-4 text-success" />
                    <p className="text-lg font-bold">{activePolls}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-lg bg-accent/10 p-3 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-accent" />
                    <p className="text-lg font-bold">{closedPolls}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-lg font-bold">{totalResponses}</p>
                    <p className="text-xs text-muted-foreground">Responses</p>
                  </div>
                </div>

                {/* Extra stats row */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{session.participantCount} participants</span>
                  <span>Avg {avgResponses} responses/poll</span>
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
