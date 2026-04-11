import { Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
      </div>
    </header>
  );
};

export default Header;
