import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePollingStore, QuestionType, PollOption } from "@/lib/polling-store";
import Header from "@/components/Header";
import PollResults from "@/components/PollResults";
import { toast } from "sonner";
import {
  Copy,
  Play,
  Square,
  Plus,
  Users,
  X,
  Download,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessions, addPoll, launchPoll, closePoll, endSession, resetPoll, resetAllPolls, restartSession, adminLoggedIn } =
    usePollingStore();

  const session = code ? sessions[code] : null;

  const [question, setQuestion] = useState("");
  const [type, setType] = useState<QuestionType>("binary");
  const [options, setOptions] = useState<PollOption[]>([
    { id: "yes", label: "Yes" },
    { id: "no", label: "No" },
  ]);
  const [showCreate, setShowCreate] = useState(false);

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

  const handleTypeChange = (val: QuestionType) => {
    setType(val);
    if (val === "binary") {
      setOptions([
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ]);
    } else if (val === "mcq") {
      setOptions([
        { id: "opt1", label: "Option 1" },
        { id: "opt2", label: "Option 2" },
        { id: "opt3", label: "Option 3" },
      ]);
    } else {
      setOptions([]);
    }
  };

  const handleAddPoll = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    addPoll(code, question.trim(), type, options);
    setQuestion("");
    setShowCreate(false);
    toast.success("Poll added");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Session code copied!");
  };

  const handleExport = () => {
    const lines = [`Session: ${session.title}`, `Code: ${code}`, ""];
    session.polls.forEach((p, i) => {
      lines.push(`Q${i + 1}: ${p.question}`);
      const total = Object.keys(p.responses).length;
      if (p.type === "text") {
        Object.values(p.responses).forEach((r) => lines.push(`  - ${r}`));
      } else {
        p.options.forEach((o) => {
          const count = Object.values(p.responses).filter((r) => r === o.id).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          lines.push(`  ${o.label}: ${count} (${pct}%)`);
        });
      }
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

  const activePoll = session.polls.find((p) => p.isActive);

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

        {/* Session code */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-card p-4 card-shadow">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Session Code</p>
            <p className="font-mono text-2xl font-bold tracking-widest">{code}</p>
          </div>
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4" /> Copy
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

        {/* Add poll */}
        {session.isActive && (
          <div className="mb-6">
            {!showCreate ? (
              <Button onClick={() => setShowCreate(true)} variant="hero">
                <Plus className="h-4 w-4" /> New Poll
              </Button>
            ) : (
              <div className="space-y-4 rounded-xl border bg-card p-5 card-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Create Poll</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreate(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Enter your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Select value={type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binary">Yes / No</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="text">Open Text</SelectItem>
                  </SelectContent>
                </Select>

                {type === "mcq" && (
                  <div className="space-y-2">
                    {options.map((o, i) => (
                      <div key={o.id} className="flex gap-2">
                        <Input
                          value={o.label}
                          onChange={(e) => {
                            const updated = [...options];
                            updated[i] = { ...o, label: e.target.value };
                            setOptions(updated);
                          }}
                        />
                        {options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOptions(options.filter((_, j) => j !== i))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {options.length < 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setOptions([
                            ...options,
                            { id: `opt${options.length + 1}`, label: `Option ${options.length + 1}` },
                          ])
                        }
                      >
                        <Plus className="h-4 w-4" /> Add Option
                      </Button>
                    )}
                  </div>
                )}

                <Button onClick={handleAddPoll} variant="hero" className="w-full">
                  Add Poll
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Polls list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Polls ({session.polls.length})
            </h2>
            {session.polls.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export
              </Button>
            )}
          </div>

          {session.polls.length === 0 && (
            <div className="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">
              No polls yet. Create one to get started.
            </div>
          )}

          {session.polls.map((poll, idx) => (
            <div
              key={poll.id}
              className={`rounded-xl border bg-card p-5 card-shadow ${
                poll.isActive ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground">Q{idx + 1}</span>
                  <h3 className="font-semibold">{poll.question}</h3>
                </div>
                <div className="flex gap-1.5">
                  {session.isActive && !poll.isActive && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => launchPoll(code, poll.id)}
                      disabled={!!activePoll && activePoll.id !== poll.id}
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
                </div>
              </div>
              <PollResults poll={poll} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
