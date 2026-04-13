import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import Header from "@/components/Header";
import { toast } from "sonner";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { getParticipantToken, setParticipantToken } from "@/lib/participant-token";

const ParticipantSession = () => {
  const { code: codeParam } = useParams<{ code: string }>();
  const code = codeParam?.toUpperCase() ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const [participantToken, setToken] = useState<string | null>(() =>
    code ? getParticipantToken(code) : null
  );

  useEffect(() => {
    if (code) {
      setToken(getParticipantToken(code));
    }
  }, [code]);

  const liveQuery = useQuery({
    queryKey: ["sessions", "live", code, participantToken],
    queryFn: () => api.getSessionLive(code, participantToken),
    enabled: !!code,
    refetchInterval: 2000,
  });

  const joinMutation = useMutation({
    mutationFn: () => api.joinSession(code),
    onSuccess: (res) => {
      setParticipantToken(res.code, res.participantToken);
      setToken(res.participantToken);
      void queryClient.invalidateQueries({ queryKey: ["sessions", "live", code] });
      toast.success("Joined session");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const voteMutation = useMutation({
    mutationFn: (input: {
      token: string;
      sessionCode: string;
      pollId: string;
      optionId: string;
    }) => api.submitVote(input.token, input.sessionCode, input.pollId, input.optionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions", "live", code] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (liveQuery.isError) {
    return (
      <div className="min-h-screen bg-background" key={lang}>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">{t("sessionNotFound")}</h1>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            {t("goHome")}
          </Button>
        </div>
      </div>
    );
  }

  const data = liveQuery.data;
  if (!data && liveQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background" key={lang}>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { session, participant } = data;
  const activePoll = session.polls.find((p) => p.isActive);
  const myVote =
    participant && activePoll && participant.activePollId === activePoll.id
      ? participant.myVote
      : null;
  const hasResponded = myVote !== null && myVote !== undefined && myVote !== "";

  const handleVote = (pollId: string, optionId: string, previousHadVote: boolean) => {
    if (!participantToken) return;
    voteMutation.mutate(
      { token: participantToken, sessionCode: code, pollId, optionId },
      {
        onSuccess: () => {
          toast.success(previousHadVote ? t("voteUpdated") : t("voteSubmitted"));
        },
      }
    );
  };

  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-background" key={lang}>
        <Header />
        <div className="container mx-auto max-w-md px-4 py-20 text-center animate-fade-in">
          <div className="rounded-xl border bg-card p-8 card-shadow">
            <h1 className="text-xl font-bold">{t("sessionEnded")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("thankYouParticipating")}
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
              {t("goHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" key={lang}>
      <Header />
      <div className="container mx-auto max-w-md px-4 py-8 animate-fade-in">
        <div className="mb-6 text-center">
          <p className="text-xs text-muted-foreground">{t("session")}</p>
          <h1 className="text-lg font-bold">{session.title}</h1>
        </div>

        {!participantToken && (
          <div className="mb-6 rounded-xl border bg-card p-5 text-center card-shadow">
            <p className="text-sm text-muted-foreground mb-3">
              Join this session to vote. You can enter the code on the home page, or join here.
            </p>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
            >
              Join session
            </Button>
          </div>
        )}

        {!activePoll && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="font-semibold">{t("waitingForPoll")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("waitingForPollDesc")}
            </p>
          </div>
        )}

        {activePoll && participantToken && hasResponded && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border bg-card p-8 text-center card-shadow">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
              <h2 className="text-xl font-semibold">{t("thankYou")}</h2>
              <p className="mt-1 text-muted-foreground">
                {t("yourVote")}{" "}
                <span className="font-bold text-foreground">
                  {myVote === "yes" ? `✅ ${t("yes")}` : `❌ ${t("no")}`}
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("waitingNextQuestion")}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                activePoll &&
                handleVote(activePoll.id, myVote === "yes" ? "no" : "yes", true)
              }
              disabled={voteMutation.isPending}
            >
              <RefreshCw className="h-4 w-4" /> {t("changeMind")}{" "}
              {myVote === "yes" ? t("no") : t("yes")}
            </Button>
          </div>
        )}

        {activePoll && participantToken && !hasResponded && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border bg-card p-5 card-shadow text-center">
              <p className="text-sm text-muted-foreground">{t("castYourVote")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-success hover:bg-success/10"
                onClick={() => activePoll && handleVote(activePoll.id, "yes", hasResponded)}
                disabled={voteMutation.isPending}
              >
                ✅ {t("yes")}
              </Button>
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-destructive hover:bg-destructive/10"
                onClick={() => activePoll && handleVote(activePoll.id, "no", hasResponded)}
                disabled={voteMutation.isPending}
              >
                ❌ {t("no")}
              </Button>
            </div>
          </div>
        )}

        {activePoll && !participantToken && (
          <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            Use the button above to join before voting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSession;
