import { Package, Tag } from "lucide-react";
import { Button } from "./ui/button";

interface InventoryCardProps {
  name: string;
  image?: string;
  inStock: boolean;
  quantity?: number;
  couponText?: string;
  onApplyCoupon?: () => void;
  onOrder?: () => void;
}

export function InventoryCard({
  name,
  image,
  inStock,
  quantity,
  couponText,
  onApplyCoupon,
  onOrder,
}: InventoryCardProps) {
  return (
    <div className="bg-store-card rounded-2xl p-4 shadow-soft animate-bounce-in">
      <div className="flex items-start gap-3">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${inStock ? 'text-accent' : 'text-destructive'}`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-accent' : 'bg-destructive'}`} />
              {inStock ? `In Stock${quantity ? ` — ${quantity} left` : ''}` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        {couponText && onApplyCoupon && (
          <Button 
            variant="accent" 
            size="sm" 
            className="flex-1"
            onClick={onApplyCoupon}
          >
            <Tag className="w-4 h-4" />
            {couponText}
          </Button>
        )}
        {onOrder && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onOrder}
          >
            Order for Pickup
          </Button>
        )}
      </div>
    </div>
  );
}
