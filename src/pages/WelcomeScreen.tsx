import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/StoreCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { useGeolocation, findNearestStore, STORES } from "@/hooks/useGeolocation";
import { useStore } from "@/contexts/StoreContext";

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { coordinates, error, loading, requestLocation } = useGeolocation();
  const { setNearestStore, setUserCoordinates } = useStore();
  const [detectedStore, setDetectedStore] = useState<{
    store: typeof STORES[0];
    formattedDistance: string;
  } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  // Auto-request location on mount
  useEffect(() => {
    if (!locationRequested) {
      requestLocation();
      setLocationRequested(true);
    }
  }, [locationRequested, requestLocation]);

  // Find nearest store when coordinates are available
  useEffect(() => {
    if (coordinates) {
      const result = findNearestStore(coordinates.latitude, coordinates.longitude);
      setDetectedStore({
        store: result.store,
        formattedDistance: result.formattedDistance,
      });
      setNearestStore(result.store, result.formattedDistance);
      setUserCoordinates(coordinates);
    }
  }, [coordinates, setNearestStore, setUserCoordinates]);

  const handleStartChat = () => {
    // If no location, use default store
    if (!detectedStore) {
      const defaultStore = STORES[0];
      setNearestStore(defaultStore, "nearby");
    }
    navigate("/chat");
  };

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

          {/* Location Detection */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span>Detecting your location...</span>
                  </>
                ) : detectedStore ? (
                  <>
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-accent font-medium">Location detected</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Nearby store</span>
                  </>
                )}
              </div>
              {error && (
                <button
                  onClick={requestLocation}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-card rounded-3xl p-6 shadow-card border border-border animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/2" />
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/3" />
                  </div>
                </div>
              </div>
            ) : detectedStore ? (
              <StoreCard
                name={detectedStore.store.name}
                status={detectedStore.store.hours}
                distance={detectedStore.formattedDistance}
                isOpen={true}
              />
            ) : (
              <StoreCard
                name={STORES[0].name}
                status={STORES[0].hours}
                distance="nearby"
                isOpen={true}
              />
            )}

            {error && (
              <p className="text-sm text-muted-foreground text-center">
                {error}. Using default store location.
              </p>
            )}

            {coordinates && (
              <p className="text-xs text-muted-foreground text-center">
                📍 Your location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
              </p>
            )}
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
              onClick={handleStartChat}
              disabled={loading}
            >
              <MessageCircle className="w-5 h-5" />
              {loading ? "Detecting location..." : "Start Chatting"}
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
