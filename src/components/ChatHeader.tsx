import { Shield, ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  storeName?: string;
}

export function ChatHeader({ storeName }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">ShopBuddy AI</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-sm text-muted-foreground">Online</span>
            {storeName && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {storeName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
        <Shield className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-accent">Protected</span>
      </div>
    </header>
  );
}
