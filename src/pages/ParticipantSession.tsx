import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePollingStore } from "@/lib/polling-store";
import Header from "@/components/Header";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";

const ParticipantSession = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessions, participantId, submitResponse } = usePollingStore();

  const session = code ? sessions[code] : null;

  // Sync across tabs: when admin changes state, participant tab updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'policypoll-store') {
        usePollingStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

  const activePoll = session.polls.find((p) => p.isActive);
  const hasResponded = activePoll && participantId
    ? activePoll.responses[participantId] !== undefined
    : false;

  const handleVote = (optionId: string) => {
    if (!activePoll || hasResponded) return;
    submitResponse(code, activePoll.id, optionId);
    toast.success("Response submitted!");
  };

  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-20 text-center animate-fade-in">
          <div className="rounded-xl border bg-card p-8 card-shadow">
            <h1 className="text-xl font-bold">Session Ended</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for participating in this session.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-md px-4 py-8 animate-fade-in">
        <div className="mb-6 text-center">
          <p className="text-xs text-muted-foreground">Session</p>
          <h1 className="text-lg font-bold">{session.title}</h1>
        </div>

        {!activePoll && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="font-semibold">Waiting for poll...</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The administrator will ask a question and launch the poll shortly.
            </p>
          </div>
        )}

        {activePoll && hasResponded && (
          <div className="rounded-xl border bg-card p-8 text-center card-shadow animate-slide-up">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
            <h2 className="font-semibold">Response Submitted</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Waiting for the next question...
            </p>
          </div>
        )}

        {activePoll && !hasResponded && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border bg-card p-5 card-shadow text-center">
              <p className="text-sm text-muted-foreground">Please cast your vote</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-success hover:bg-success/10"
                onClick={() => handleVote("yes")}
              >
                ✅ Yes
              </Button>
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-destructive hover:bg-destructive/10"
                onClick={() => handleVote("no")}
              >
                ❌ No
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSession;
