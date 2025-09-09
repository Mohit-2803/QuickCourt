"use client";

import { createContext, useContext, useState } from "react";

type CityContextType = {
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
};

const cityContext = createContext<CityContextType | undefined>(undefined);

export function CityProviderForFeaturedCourts({
  children,
  initialCity = "Bengaluru",
}: {
  children: React.ReactNode;
  initialCity?: string;
}) {
  const [city, setCity] = useState(initialCity);

  return (
    <cityContext.Provider value={{ city, setCity }}>
      {children}
    </cityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(cityContext);
  if (context === undefined) {
    throw new Error(
      "useCity must be used within a CityProviderForFeaturedCourts"
    );
  }
  return context;
}
