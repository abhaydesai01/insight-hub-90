import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import Header from "@/components/Header";
import { toast } from "sonner";
import { api } from "@/lib/api";

const AdminCreate = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ready, token } = useAdminAuth();

  useEffect(() => {
    if (ready && !token) {
      navigate("/admin/login");
    }
  }, [ready, token, navigate]);

  const createMutation = useMutation({
    mutationFn: () => api.createSession(token!, title.trim(), description.trim()),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["sessions", "list"] });
      toast.success(`Session created! Code: ${res.session.code}`);
      navigate(`/admin/${res.session.code}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!token) return;
    if (!title.trim()) {
      toast.error("Please enter a session title");
      return;
    }
    createMutation.mutate();
  };

  if (!ready || !token) {
    return null;
  }

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
          <Button
            onClick={handleCreate}
            variant="hero"
            className="w-full"
            size="lg"
            disabled={createMutation.isPending}
          >
            Create Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCreate;
