import { Shield } from "lucide-react";

interface PrivacyBadgeProps {
  compact?: boolean;
}

export function PrivacyBadge({ compact = false }: PrivacyBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-accent">
        <Shield className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 rounded-2xl animate-fade-in">
      <Shield className="w-5 h-5 text-accent flex-shrink-0" />
      <p className="text-sm text-muted-foreground">
        <span className="text-accent font-medium">Your data stays protected</span> — sensitive info is masked before AI processing.
      </p>
    </div>
  );
}
