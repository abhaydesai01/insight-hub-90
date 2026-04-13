import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, Shield, Zap, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import { setParticipantToken } from "@/lib/participant-token";

const Index = () => {
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const { token: adminToken } = useAdminAuth();
  const { lang } = useLanguage();

  const handleJoin = async () => {
    const normalizedCode = joinCode.trim().toUpperCase();

    if (!normalizedCode) {
      toast.error(t("enterCode"));
      return;
    }

    setJoining(true);
    try {
      const res = await api.joinSession(normalizedCode);
      setParticipantToken(res.code, res.participantToken);
      navigate(`/session/${res.code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid or inactive session code");
    } finally {
      setJoining(false);
    }
  };

  const handleCreateSession = () => {
    navigate("/admin/create");
  };

  const features = [
    {
      icon: Shield,
      title: t("anonymous"),
      desc: t("anonymousDesc"),
    },
    {
      icon: Zap,
      title: t("realTime"),
      desc: t("realTimeDesc"),
    },
    {
      icon: Users,
      title: t("scalable"),
      desc: t("scalableDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background" key={lang}>
      <Header />

      {/* Hero */}
      <section className="hero-gradient px-4 py-20 text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Vote className="h-4 w-4" /> {t("govLabel")}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mb-10 text-lg text-primary-foreground/80">
            {t("heroSubtitle")}
          </p>

          {/* Join Card */}
          <div className="mx-auto max-w-md rounded-xl bg-card p-6 text-foreground card-shadow-lg animate-slide-up">
            <h2 className="mb-4 text-lg font-semibold">{t("joinSession")}</h2>
            <div className="flex gap-2">
              <Input
                placeholder={t("enterCode")}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest uppercase"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <Button onClick={handleJoin} variant="hero" size="lg" disabled={joining}>
                {t("join")} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {adminToken && (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{t("or")}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleCreateSession}
                >
                  {t("createSession")}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-6 card-shadow transition-shadow hover:card-shadow-lg animate-slide-up"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        {t("footerText")}
      </footer>
    </div>
  );
};

export default Index;
