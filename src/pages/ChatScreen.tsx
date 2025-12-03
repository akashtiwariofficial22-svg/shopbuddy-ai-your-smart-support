import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage, ChatBubble } from "@/components/ChatBubble";
import { StoreCard } from "@/components/StoreCard";
import { InventoryCard } from "@/components/InventoryCard";
import { SuggestionBubble } from "@/components/SuggestionBubble";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/contexts/StoreContext";
import { STORES } from "@/hooks/useGeolocation";

type MessageType = 
  | { type: "text"; isUser: boolean; content: string }
  | { type: "store"; isUser: false }
  | { type: "inventory"; isUser: false; product: string; quantity: number }
  | { type: "suggestion"; isUser: false; suggestion: string; highlight?: string }
  | { type: "actions"; isUser: false; actions: string[] };

type ChatMsg = { role: "user" | "assistant"; content: string };

const maskPII = (text: string): string => {
  let masked = text.replace(/(\+91[-\s]?)?[6-9]\d{9}/g, "+91-XXXXXXXXXX");
  masked = masked.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
    (_, local) => `${local.charAt(0)}***@***.com`);
  return masked;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nearestStore, distance, userCoordinates } = useStore();

  // Use detected store or fallback to default
  const currentStore = nearestStore || STORES[0];
  const currentDistance = distance || "nearby";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting with detected store
  useEffect(() => {
    const initChat = async () => {
      await new Promise(r => setTimeout(r, 500));
      
      const locationInfo = userCoordinates 
        ? `I detected you're ${currentDistance} from ${currentStore.name}!`
        : `I found ${currentStore.name} near you!`;
      
      setMessages([
        { type: "text", isUser: false, content: `Hi there! 👋 I'm ShopBuddy, your personal support assistant. ${locationInfo}` },
      ]);
      
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, { type: "store", isUser: false }]);
      
      await new Promise(r => setTimeout(r, 600));
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "How can I help you today? You can ask about store hours, menu items, or get personalized recommendations!" 
      }]);

      setChatHistory([
        { role: "assistant", content: `Hi there! I'm ShopBuddy, your personal support assistant. ${locationInfo} How can I help you today?` }
      ]);
    };
    
    initChat();
  }, [currentStore.name, currentDistance, userCoordinates]);

  const handleSend = async (message: string) => {
    const maskedMessage = maskPII(message);
    setMessages(prev => [...prev, { type: "text", isUser: true, content: maskedMessage }]);
    setIsTyping(true);

    const updatedHistory = [...chatHistory, { role: "user" as const, content: maskedMessage }];
    setChatHistory(updatedHistory);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: updatedHistory,
          storeContext: {
            store: currentStore,
            distance: currentDistance,
            userLocation: userCoordinates
          }
        }
      });

      if (error) {
        console.error("Chat error:", error);
        throw error;
      }

      if (data.error) {
        if (data.code === "RATE_LIMITED") {
          toast({
            title: "Please slow down",
            description: "Too many requests. Please wait a moment.",
            variant: "destructive"
          });
        } else if (data.code === "CREDITS_DEPLETED") {
          toast({
            title: "Service unavailable",
            description: "Please try again later.",
            variant: "destructive"
          });
        }
        throw new Error(data.error);
      }

      const aiResponse = data.response;
      setChatHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);

      const lowerResponse = aiResponse.toLowerCase();
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("open") || lowerMessage.includes("hours") || lowerMessage.includes("store") || lowerMessage.includes("where") || lowerMessage.includes("location")) {
        setMessages(prev => [...prev, { type: "store", isUser: false }]);
      }

      setMessages(prev => [...prev, { type: "text", isUser: false, content: aiResponse }]);

      // Show inventory cards based on store inventory
      const inventory = currentStore.inventory;
      for (const item of inventory) {
        if (lowerResponse.includes(item.name.toLowerCase())) {
          setMessages(prev => [...prev, { 
            type: "inventory", 
            isUser: false, 
            product: item.name, 
            quantity: item.quantity 
          }]);
          break;
        }
      }

      if (lowerMessage.includes("cold") || lowerMessage.includes("warm") || lowerMessage.includes("suggest") || lowerMessage.includes("recommend")) {
        if (!lowerResponse.includes("cocoa") && !lowerResponse.includes("hot")) {
          setMessages(prev => [...prev, { 
            type: "suggestion", 
            isUser: false, 
            suggestion: "Based on your preferences, check out our recommendations!", 
            highlight: "Special offers available!" 
          }]);
        }
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      setMessages(prev => [...prev, { 
        type: "text", 
        isUser: false, 
        content: "I'm having trouble connecting right now. Try again in a moment!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCouponApply = () => {
    toast({
      title: "🎉 Coupon Applied!",
      description: "10% discount has been applied to your order.",
    });
  };

  const handleDirections = () => {
    // Open Google Maps with store coordinates
    if (currentStore) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${currentStore.latitude},${currentStore.longitude}`;
      window.open(url, '_blank');
    }
    toast({
      title: "📍 Opening Maps",
      description: `Directions to ${currentStore.name}`,
    });
  };

  const handleAction = (action: string) => {
    if (action === "Order for Pickup") {
      toast({
        title: "🛒 Order Started",
        description: "Taking you to the order screen...",
      });
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader storeName={currentStore.name} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          if (msg.type === "text") {
            return <ChatMessage key={index} isUser={msg.isUser} message={msg.content} delay={index * 50} />;
          }
          if (msg.type === "store") {
            return (
              <div key={index} className="max-w-[85%] md:max-w-[75%] animate-slide-in-left">
                <StoreCard
                  name={currentStore.name}
                  status={currentStore.hours}
                  distance={currentDistance}
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
