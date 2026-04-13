import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password.trim());
      toast.success("Login successful");
      navigate("/admin/portal");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-md px-4 py-16 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl hero-gradient">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage polling sessions
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border bg-card p-6 card-shadow">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="admin@karnataka.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={submitting}>
            Sign In
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Use the admin account configured on the server (see server/.env.example).
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
