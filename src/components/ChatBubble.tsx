import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChatBubbleProps {
  isUser: boolean;
  children: ReactNode;
  delay?: number;
}

export function ChatBubble({ isUser, children, delay = 0 }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[85%] md:max-w-[75%]",
        isUser ? "ml-auto" : "mr-auto",
        isUser ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-2xl",
          isUser
            ? "gradient-primary text-primary-foreground rounded-br-md"
            : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  isUser: boolean;
  message: string;
  delay?: number;
}

export function ChatMessage({ isUser, message, delay = 0 }: ChatMessageProps) {
  return (
    <ChatBubble isUser={isUser} delay={delay}>
      <p className="text-[15px] leading-relaxed">{message}</p>
    </ChatBubble>
  );
}
