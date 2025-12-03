import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/StoreCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-button">
              <MessageCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to <span className="text-primary">ShopBuddy AI</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Support that knows you.
              </p>
            </div>
          </div>

          {/* Detected Store */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Nearby store detected</span>
            </div>
            <StoreCard
              name="Starbucks JP Nagar"
              status="Open until 9PM"
              distance="50m away"
              isOpen={true}
            />
          </div>

          {/* Privacy Note */}
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <PrivacyBadge />
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="w-5 h-5" />
              Start Chatting
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">ShopBuddy AI</span>
        </p>
      </footer>
    </div>
  );
}
