import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePollingStore } from "@/lib/polling-store";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import Header from "@/components/Header";
import { toast } from "sonner";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";

const ParticipantSession = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessions, participantId, submitResponse, changeResponse } = usePollingStore();
  // Force re-render on language change
  const { lang } = useLanguage();

  const session = code ? sessions[code] : null;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'policypoll-store') {
        usePollingStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      usePollingStore.persist.rehydrate();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!session || !code) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">{t('sessionNotFound')}</h1>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            {t('goHome')}
          </Button>
        </div>
      </div>
    );
  }

  const activePoll = session.polls.find((p) => p.isActive);
  const currentResponse = activePoll && participantId
    ? activePoll.responses[participantId]
    : undefined;
  const hasResponded = currentResponse !== undefined;

  const handleVote = (optionId: string) => {
    if (!activePoll || !participantId) return;

    if (hasResponded) {
      changeResponse(code, activePoll.id, optionId);
      toast.success(t('voteUpdated'));
    } else {
      submitResponse(code, activePoll.id, optionId);
      toast.success(t('voteSubmitted'));
    }
  };

  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-20 text-center animate-fade-in">
          <div className="rounded-xl border bg-card p-8 card-shadow">
            <h1 className="text-xl font-bold">{t('sessionEnded')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('thankYouParticipating')}
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
              {t('goHome')}
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
          <p className="text-xs text-muted-foreground">{t('session')}</p>
          <h1 className="text-lg font-bold">{session.title}</h1>
        </div>

        {!activePoll && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="font-semibold">{t('waitingForPoll')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('waitingForPollDesc')}
            </p>
          </div>
        )}

        {activePoll && hasResponded && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border bg-card p-8 text-center card-shadow">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
              <h2 className="text-xl font-semibold">{t('thankYou')}</h2>
              <p className="mt-1 text-muted-foreground">
                {t('yourVote')} <span className="font-bold text-foreground">
                  {currentResponse === "yes" ? `✅ ${t('yes')}` : `❌ ${t('no')}`}
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('waitingNextQuestion')}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleVote(currentResponse === "yes" ? "no" : "yes")}
            >
              <RefreshCw className="h-4 w-4" /> {t('changeMind')} {currentResponse === "yes" ? t('no') : t('yes')}
            </Button>
          </div>
        )}

        {activePoll && !hasResponded && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border bg-card p-5 card-shadow text-center">
              <p className="text-sm text-muted-foreground">{t('castYourVote')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-success hover:bg-success/10"
                onClick={() => handleVote("yes")}
              >
                ✅ {t('yes')}
              </Button>
              <Button
                variant="outline"
                className="h-24 text-xl font-bold transition-all hover:ring-2 hover:ring-destructive hover:bg-destructive/10"
                onClick={() => handleVote("no")}
              >
                ❌ {t('no')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSession;
