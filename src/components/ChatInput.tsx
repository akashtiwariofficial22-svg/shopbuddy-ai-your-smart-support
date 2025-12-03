import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "./ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-card border-t border-border">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything…"
          disabled={disabled}
          className="w-full h-12 px-4 pr-12 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>
      <Button
        type="submit"
        variant="chat"
        size="chat"
        disabled={!message.trim() || disabled}
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
}
