import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, Shield, Zap, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePollingStore } from "@/lib/polling-store";
import { toast } from "sonner";
import Header from "@/components/Header";

const Index = () => {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();
  const { joinSession, setIsAdmin } = usePollingStore();

  const handleJoin = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a session code");
      return;
    }
    const success = joinSession(joinCode.trim());
    if (success) {
      setIsAdmin(false);
      navigate(`/session/${joinCode.trim().toUpperCase()}`);
    } else {
      toast.error("Invalid or inactive session code");
    }
  };

  const handleCreateSession = () => {
    setIsAdmin(true);
    navigate("/admin/create");
  };

  const features = [
    {
      icon: Shield,
      title: "100% Anonymous",
      desc: "No personal data collected. Session-based identifiers ensure complete privacy.",
    },
    {
      icon: Zap,
      title: "Real-Time Results",
      desc: "Instant aggregation and live visualization of poll responses.",
    },
    {
      icon: Users,
      title: "Scalable",
      desc: "Supports thousands of simultaneous participants with sub-second latency.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="hero-gradient px-4 py-20 text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Vote className="h-4 w-4" /> Government of Karnataka
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Real-Time Anonymous Polling
          </h1>
          <p className="mb-10 text-lg text-primary-foreground/80">
            Enhance policy discussions with instant, anonymous feedback.
            Structured responses, transparent outcomes.
          </p>

          {/* Join Card */}
          <div className="mx-auto max-w-md rounded-xl bg-card p-6 text-foreground card-shadow-lg animate-slide-up">
            <h2 className="mb-4 text-lg font-semibold">Join a Session</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest uppercase"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <Button onClick={handleJoin} variant="hero" size="lg">
                Join <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleCreateSession}
            >
              Create a New Session
            </Button>
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
        PolicyPoll — Real-Time Anonymous Polling for Policy Discussions
      </footer>
    </div>
  );
};

export default Index;
