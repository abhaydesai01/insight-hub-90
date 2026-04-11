import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePollingStore } from "@/lib/polling-store";
import Header from "@/components/Header";
import PollResults from "@/components/PollResults";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
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
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessions, launchPoll, closePoll, endSession, resetPoll, restartSession, adminLoggedIn } =
    usePollingStore();

  const session = code ? sessions[code] : null;

  if (!session || !code) {
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
    navigator.clipboard.writeText(code);
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

  // Each session has exactly one poll (the Yes/No poll created with the session)
  const poll = session.polls[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in">
        {/* Session header */}
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
          {/* Session code */}
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
              onClick={() => {
                restartSession(code);
                toast.success("Session restarted");
              }}
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
            onClick={() => {
              endSession(code);
              toast.success("Session ended");
            }}
            disabled={!session.isActive}
          >
            End Session
          </Button>
        </div>

        {/* Poll controls */}
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
                      onClick={() => launchPoll(code, poll.id)}
                    >
                      <Play className="h-3.5 w-3.5" /> Launch
                    </Button>
                  )}
                  {poll.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => closePoll(code, poll.id)}
                    >
                      <Square className="h-3.5 w-3.5" /> Close
                    </Button>
                  )}
                  {Object.keys(poll.responses).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetPoll(code, poll.id);
                        toast.success("Poll reset — ready for next question");
                      }}
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
