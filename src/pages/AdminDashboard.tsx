import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import Header from "@/components/Header";
import PollResults from "@/components/PollResults";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import {
  Copy,
  Play,
  Square,
  Users,
  Download,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const { code: codeParam } = useParams<{ code: string }>();
  const code = codeParam?.toUpperCase() ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ready, token } = useAdminAuth();

  useEffect(() => {
    if (ready && !token) {
      navigate("/admin/login");
    }
  }, [ready, token, navigate]);

  const sessionQuery = useQuery({
    queryKey: ["sessions", "admin", code, token],
    queryFn: () => api.getSessionAdmin(token!, code),
    enabled: !!code && !!token && ready,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["sessions", "admin", code] });

  const launchMutation = useMutation({
    mutationFn: (pollId: string) => api.launchPoll(token!, code, pollId),
    onSuccess: () => {
      void invalidate();
      void queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closeMutation = useMutation({
    mutationFn: (pollId: string) => api.closePoll(token!, code, pollId),
    onSuccess: () => {
      void invalidate();
      void queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: (pollId: string) => api.resetPoll(token!, code, pollId),
    onSuccess: () => {
      void invalidate();
      toast.success("Poll reset — ready for next question");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const endMutation = useMutation({
    mutationFn: () => api.endSession(token!, code),
    onSuccess: () => {
      void invalidate();
      void queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
      toast.success("Session ended");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restartMutation = useMutation({
    mutationFn: () => api.restartSession(token!, code),
    onSuccess: () => {
      void invalidate();
      void queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
      toast.success("Session restarted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !token) {
    return null;
  }

  if (sessionQuery.isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Session not found</h1>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const session = sessionQuery.data?.session;
  if (!session && sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading session…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Session not found</h1>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const copyCode = () => {
    void navigator.clipboard.writeText(code);
    toast.success("Session code copied!");
  };

  const handleExport = () => {
    const lines = [`Session: ${session.title}`, `Code: ${code}`, ""];
    session.polls.forEach((p, i) => {
      lines.push(`Poll ${i + 1} (Yes/No)`);
      const total = Object.keys(p.responses).length;
      p.options.forEach((o) => {
        const count = Object.values(p.responses).filter((r) => r === o.id).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        lines.push(`  ${o.label}: ${count} (${pct}%)`);
      });
      lines.push(`  Total responses: ${total}`, "");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const poll = session.polls[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            {session.description && (
              <p className="mt-1 text-muted-foreground">{session.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{session.participantCount}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 card-shadow">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Session Code</p>
              <p className="font-mono text-2xl font-bold tracking-widest">{code}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            {!session.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" /> Restart
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => endMutation.mutate()}
              disabled={!session.isActive || endMutation.isPending}
            >
              End Session
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 card-shadow">
            <QRCodeSVG
              value={`${window.location.origin}/session/${code}`}
              size={140}
              level="M"
            />
            <p className="mt-2 text-xs text-muted-foreground">Scan to join</p>
          </div>
        </div>

        {poll && session.isActive && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 card-shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Yes / No Poll
                  {poll.isActive && (
                    <span className="ml-2 inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      Live
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  {!poll.isActive && (
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => launchMutation.mutate(poll.id)}
                      disabled={launchMutation.isPending}
                    >
                      <Play className="h-3.5 w-3.5" /> Launch
                    </Button>
                  )}
                  {poll.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => closeMutation.mutate(poll.id)}
                      disabled={closeMutation.isPending}
                    >
                      <Square className="h-3.5 w-3.5" /> Close
                    </Button>
                  )}
                  {Object.keys(poll.responses).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetMutation.mutate(poll.id)}
                      disabled={resetMutation.isPending}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  )}
                </div>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                Ask the question verbally, then launch the poll. Participants will vote Yes or No.
              </p>

              <PollResults poll={poll} />
            </div>
          </div>
        )}

        {!session.isActive && poll && (
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h2 className="mb-4 text-lg font-semibold">Final Results</h2>
            <PollResults poll={poll} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
