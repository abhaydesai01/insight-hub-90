import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePollingStore } from "@/lib/polling-store";
import Header from "@/components/Header";
import { toast } from "sonner";

const AdminCreate = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { createSession, setCurrentSession, setIsAdmin } = usePollingStore();

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a session title");
      return;
    }
    const code = createSession(title.trim(), description.trim());
    setCurrentSession(code);
    setIsAdmin(true);
    toast.success(`Session created! Code: ${code}`);
    navigate(`/admin/${code}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-lg px-4 py-12 animate-fade-in">
        <h1 className="mb-2 text-2xl font-bold">Create New Session</h1>
        <p className="mb-8 text-muted-foreground">
          Set up a polling session for your policy discussion.
        </p>

        <div className="space-y-4 rounded-xl border bg-card p-6 card-shadow">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Session Title</label>
            <Input
              placeholder="e.g. Budget Review Q4 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="Brief description of the session..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleCreate} variant="hero" className="w-full" size="lg">
            Create Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCreate;
