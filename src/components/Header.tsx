import { Vote, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext.tsx";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const navigate = useNavigate();
  const { token, profile, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-card card-shadow">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient">
            <Vote className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>PolicyPoll</span>
        </button>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {token ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/portal")}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Portal</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/login")}
            >
              <LogIn className="h-4 w-4" />
              Admin Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
