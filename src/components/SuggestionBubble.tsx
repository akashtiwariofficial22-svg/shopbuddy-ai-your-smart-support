import { Sparkles } from "lucide-react";

interface SuggestionBubbleProps {
  suggestion: string;
  highlight?: string;
}

export function SuggestionBubble({ suggestion, highlight }: SuggestionBubbleProps) {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-4 border border-accent/20 animate-bounce-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-foreground leading-relaxed">{suggestion}</p>
          {highlight && (
            <p className="text-accent font-semibold mt-1">{highlight}</p>
          )}
        </div>
      </div>
    </div>
  );
}
