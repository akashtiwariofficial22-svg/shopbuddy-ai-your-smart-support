import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage, ChatBubble } from "@/components/ChatBubble";
import { StoreCard } from "@/components/StoreCard";
import { InventoryCard } from "@/components/InventoryCard";
import { SuggestionBubble } from "@/components/SuggestionBubble";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type MessageType = 
  | { type: "text"; isUser: boolean; content: string }
  | { type: "store"; isUser: false }
  | { type: "inventory"; isUser: false; product: string; quantity: number }
  | { type: "suggestion"; isUser: false; suggestion: string; highlight?: string }
  | { type: "actions"; isUser: false; actions: string[] };

const maskPII = (text: string): string => {
  // Mask phone numbers
  const phoneRegex = /(\+91[-\s]?)?[6-9]\d{9}/g;
  text = text.replace(phoneRegex, "+91-XXXXXXXXXX");
  
  // Mask emails
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  text = text.replace(emailRegex, (_, local) => `${local.charAt(0)}***@***.com`);
  
  return text;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const initChat = async () => {
      await new Promise(r => setTimeout(r, 500));
      setMessages([
        { type: "text", isUser: false, content: "Hi there! 👋 I'm ShopBuddy, your personal support assistant. I noticed you're near Starbucks JP Nagar!" },
      ]);
      
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, { type: "store", isUser: false }]);
      
      await new Promise(r => setTimeout(r, 600));
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "How can I help you today? You can ask about store hours, menu items, or get personalized recommendations!" 
      }]);
    };
    
    initChat();
  }, []);

  const handleSend = async (message: string) => {
    const maskedMessage = maskPII(message);
    setMessages(prev => [...prev, { type: "text", isUser: true, content: maskedMessage }]);
    setIsTyping(true);

    // Simulate AI response based on keywords
    await new Promise(r => setTimeout(r, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("open") || lowerMessage.includes("hours") || lowerMessage.includes("time")) {
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "Great question! Let me check the store status for you." 
      }]);
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, { type: "store", isUser: false }]);
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "Yes! Starbucks JP Nagar is currently open and will be until 9PM tonight. It's just 50m away from you!" 
      }]);
    } 
    else if (lowerMessage.includes("cocoa") || lowerMessage.includes("hot chocolate") || lowerMessage.includes("cappuccino") || lowerMessage.includes("coffee")) {
      const product = lowerMessage.includes("cocoa") || lowerMessage.includes("chocolate") ? "Hot Cocoa" : "Cappuccino";
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: `Let me check our inventory for ${product}...` 
      }]);
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, { type: "inventory", isUser: false, product, quantity: product === "Hot Cocoa" ? 10 : 15 }]);
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: `Good news! ${product} is available at Starbucks JP Nagar. Would you like me to help you order?` 
      }]);
    }
    else if (lowerMessage.includes("cold") || lowerMessage.includes("warm") || lowerMessage.includes("weather") || lowerMessage.includes("suggest")) {
      setMessages(prev => [...prev, { 
        type: "suggestion", 
        isUser: false, 
        suggestion: "You seem cold — we have Hot Cocoa waiting just 50m away at Starbucks JP Nagar!", 
        highlight: "Want 10% off your order?" 
      }]);
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, { type: "inventory", isUser: false, product: "Hot Cocoa", quantity: 10 }]);
      setMessages(prev => [...prev, { type: "actions", isUser: false, actions: ["Order for Pickup", "Suggest alternatives"] }]);
    }
    else {
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "I'm here to help! You can ask me about:\n\n• Store hours and location\n• Menu items and availability\n• Personalized recommendations\n• Special offers and coupons\n\nWhat would you like to know?" 
      }]);
    }
    
    setIsTyping(false);
  };

  const handleCouponApply = () => {
    toast({
      title: "🎉 Coupon Applied!",
      description: "10% discount has been applied to your order.",
    });
  };

  const handleDirections = () => {
    toast({
      title: "📍 Opening Maps",
      description: "Directions to Starbucks JP Nagar",
    });
  };

  const handleAction = (action: string) => {
    if (action === "Order for Pickup") {
      toast({
        title: "🛒 Order Started",
        description: "Taking you to the order screen...",
      });
    } else {
      setMessages(prev => [...prev, { type: "text", isUser: true, content: action }]);
      handleSend(action);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          if (msg.type === "text") {
            return <ChatMessage key={index} isUser={msg.isUser} message={msg.content} delay={index * 50} />;
          }
          if (msg.type === "store") {
            return (
              <div key={index} className="max-w-[85%] md:max-w-[75%] animate-slide-in-left">
                <StoreCard
                  name="Starbucks JP Nagar"
                  status="Open until 9PM"
                  distance="50m"
                  isOpen={true}
                  onDirections={handleDirections}
                  compact
                />
              </div>
            );
          }
          if (msg.type === "inventory") {
            return (
              <div key={index} className="max-w-[85%] md:max-w-[75%] animate-slide-in-left">
                <InventoryCard
                  name={msg.product}
                  inStock={true}
                  quantity={msg.quantity}
                  couponText="Apply 10% Coupon"
                  onApplyCoupon={handleCouponApply}
                  onOrder={() => handleAction("Order for Pickup")}
                />
              </div>
            );
          }
          if (msg.type === "suggestion") {
            return (
              <div key={index} className="max-w-[85%] md:max-w-[75%] animate-slide-in-left">
                <SuggestionBubble suggestion={msg.suggestion} highlight={msg.highlight} />
              </div>
            );
          }
          if (msg.type === "actions") {
            return (
              <div key={index} className="flex flex-wrap gap-2 max-w-[85%] md:max-w-[75%] animate-fade-in">
                {msg.actions.map((action, i) => (
                  <Button key={i} variant="pill" size="sm" onClick={() => handleAction(action)}>
                    {action}
                  </Button>
                ))}
              </div>
            );
          }
          return null;
        })}
        
        {isTyping && (
          <div className="max-w-[85%] animate-fade-in">
            <div className="bg-chat-bot text-chat-bot-foreground px-4 py-3 rounded-2xl rounded-bl-md inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
