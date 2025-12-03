import { useState, useEffect } from "react";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
}

// Mock store database with real coordinates
export const STORES = [
  {
    id: "starbucks-jp-nagar",
    name: "Starbucks JP Nagar",
    latitude: 12.9063,
    longitude: 77.5857,
    hours: "Open until 9PM",
    address: "JP Nagar 6th Phase, Bangalore",
    inventory: [
      { name: "Hot Cocoa", inStock: true, quantity: 10, price: 250 },
      { name: "Cappuccino", inStock: true, quantity: 15, price: 300 },
      { name: "Latte", inStock: true, quantity: 12, price: 320 },
      { name: "Iced Mocha", inStock: true, quantity: 8, price: 350 },
    ],
  },
  {
    id: "starbucks-koramangala",
    name: "Starbucks Koramangala",
    latitude: 12.9352,
    longitude: 77.6245,
    hours: "Open until 10PM",
    address: "Koramangala 5th Block, Bangalore",
    inventory: [
      { name: "Hot Cocoa", inStock: true, quantity: 5, price: 250 },
      { name: "Espresso", inStock: true, quantity: 20, price: 200 },
      { name: "Cold Brew", inStock: true, quantity: 7, price: 380 },
    ],
  },
  {
    id: "starbucks-indiranagar",
    name: "Starbucks Indiranagar",
    latitude: 12.9784,
    longitude: 77.6408,
    hours: "Open until 11PM",
    address: "100 Feet Road, Indiranagar, Bangalore",
    inventory: [
      { name: "Caramel Macchiato", inStock: true, quantity: 12, price: 350 },
      { name: "Flat White", inStock: true, quantity: 8, price: 320 },
      { name: "Hot Cocoa", inStock: true, quantity: 15, price: 250 },
    ],
  },
  {
    id: "cafe-coffee-day-hsr",
    name: "Cafe Coffee Day HSR",
    latitude: 12.9116,
    longitude: 77.6389,
    hours: "Open until 10PM",
    address: "HSR Layout Sector 2, Bangalore",
    inventory: [
      { name: "Cappuccino", inStock: true, quantity: 20, price: 180 },
      { name: "Cafe Latte", inStock: true, quantity: 15, price: 200 },
      { name: "Hot Chocolate", inStock: true, quantity: 10, price: 160 },
    ],
  },
  {
    id: "third-wave-coffee-whitefield",
    name: "Third Wave Coffee Whitefield",
    latitude: 12.9698,
    longitude: 77.7499,
    hours: "Open until 9PM",
    address: "Whitefield Main Road, Bangalore",
    inventory: [
      { name: "Pour Over", inStock: true, quantity: 8, price: 280 },
      { name: "Cortado", inStock: true, quantity: 12, price: 220 },
      { name: "Matcha Latte", inStock: true, quantity: 6, price: 300 },
    ],
  },
];

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  return `${(meters / 1000).toFixed(1)}km away`;
}

export function findNearestStore(latitude: number, longitude: number) {
  let nearestStore = STORES[0];
  let minDistance = Infinity;

  for (const store of STORES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      store.latitude,
      store.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestStore = store;
    }
  }

  return {
    store: nearestStore,
    distance: minDistance,
    formattedDistance: formatDistance(minDistance),
  };
}

export function useGeolocation(): GeolocationState & {
  requestLocation: () => void;
} {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setState({
          coordinates: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  return { ...state, requestLocation };
}
