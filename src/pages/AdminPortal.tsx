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
  PlayCircle,
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
    {
      label: "Total Sessions",
      value: getTotalSessions(),
      icon: BarChart3,
    },
    {
      label: "Active Sessions",
      value: getActiveSessions(),
      icon: Activity,
    },
    {
      label: "Total Responses",
      value: getTotalResponses(),
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
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

        {/* Stats */}
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

        {/* Sessions list */}
        <h2 className="mb-4 text-lg font-semibold">All Sessions</h2>

        {sessionList.length === 0 && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
            No sessions created yet. Click "New Session" to start.
          </div>
        )}

        <div className="space-y-3">
          {sessionList.map((session) => {
            const totalPolls = session.polls.length;
            const totalResponses = session.polls.reduce(
              (acc, p) => acc + Object.keys(p.responses).length,
              0
            );

            return (
              <div
                key={session.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 card-shadow transition-shadow hover:card-shadow-lg"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{session.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        session.isActive
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Code: <span className="font-mono font-semibold text-foreground">{session.code}</span></span>
                    <span>{totalPolls} polls</span>
                    <span>{totalResponses} responses</span>
                    <span>{session.participantCount} participants</span>
                  </div>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
