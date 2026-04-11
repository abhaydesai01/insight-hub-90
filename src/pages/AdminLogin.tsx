import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePollingStore } from "@/lib/polling-store";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { adminLogin } = usePollingStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    const success = adminLogin(email.trim(), password.trim());
    if (success) {
      toast.success("Login successful");
      navigate("/admin/portal");
    } else {
      toast.error("Invalid credentials");
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
          <Button type="submit" variant="hero" className="w-full" size="lg">
            Sign In
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo: admin@karnataka.gov.in / admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
