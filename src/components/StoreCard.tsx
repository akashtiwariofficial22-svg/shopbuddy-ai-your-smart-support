import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface StoreCardProps {
  name: string;
  status: string;
  distance: string;
  isOpen?: boolean;
  onDirections?: () => void;
  compact?: boolean;
}

export function StoreCard({ 
  name, 
  status, 
  distance, 
  isOpen = true, 
  onDirections,
  compact = false 
}: StoreCardProps) {
  if (compact) {
    return (
      <div className="bg-store-card rounded-2xl p-4 shadow-soft animate-bounce-in">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-sm ${isOpen ? 'text-accent' : 'text-destructive'}`}>
                <Clock className="w-3.5 h-3.5" />
                {status}
              </span>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">{distance}</span>
            </div>
          </div>
        </div>
        {onDirections && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={onDirections}
          >
            <Navigation className="w-4 h-4" />
            Show Directions
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card border border-border animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-button">
          <MapPin className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-accent' : 'bg-destructive'} animate-pulse-soft`} />
            <span className={`text-sm font-medium ${isOpen ? 'text-accent' : 'text-destructive'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4" />
              {status}
            </span>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
          {distance}
        </div>
      </div>
    </div>
  );
}
