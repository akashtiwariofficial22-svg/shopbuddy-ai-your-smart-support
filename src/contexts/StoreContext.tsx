import { createContext, useContext, useState, ReactNode } from "react";

interface Store {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  hours: string;
  address: string;
  inventory: Array<{
    name: string;
    inStock: boolean;
    quantity: number;
    price: number;
  }>;
}

interface StoreContextType {
  nearestStore: Store | null;
  distance: string;
  userCoordinates: { latitude: number; longitude: number } | null;
  setNearestStore: (store: Store, distance: string) => void;
  setUserCoordinates: (coords: { latitude: number; longitude: number }) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [nearestStore, setNearestStoreState] = useState<Store | null>(null);
  const [distance, setDistance] = useState<string>("--");
  const [userCoordinates, setUserCoordinatesState] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const setNearestStore = (store: Store, dist: string) => {
    setNearestStoreState(store);
    setDistance(dist);
  };

  const setUserCoordinates = (coords: { latitude: number; longitude: number }) => {
    setUserCoordinatesState(coords);
  };

  return (
    <StoreContext.Provider
      value={{
        nearestStore,
        distance,
        userCoordinates,
        setNearestStore,
        setUserCoordinates,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
