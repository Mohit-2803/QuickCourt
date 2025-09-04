"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourtCard from "./court-card";

type Court = {
  id: number;
  name: string;
  sport: string;
  image: string;
  pricePerHour: number;
  currency: string;
  openTime: number;
  closeTime: number;
};

export default function CourtsBySport({ courts }: { courts: Court[] }) {
  // Group courts by sport
  const bySport = useMemo(() => {
    return courts.reduce<Record<string, Court[]>>((acc, c) => {
      (acc[c.sport] = acc[c.sport] || []).push(c);
      return acc;
    }, {});
  }, [courts]);

  const sports = Object.keys(bySport);
  const defaultSport = sports.length > 0 ? sports[0] : "All";

  return (
    <Tabs defaultValue={defaultSport} className="w-full">
      <TabsList className="mb-4">
        {sports.map((sport) => (
          <TabsTrigger key={sport} value={sport} className="cursor-pointer">
            {sport}
          </TabsTrigger>
        ))}
      </TabsList>

      {sports.map((sport) => (
        <TabsContent key={sport} value={sport}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bySport[sport].map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
