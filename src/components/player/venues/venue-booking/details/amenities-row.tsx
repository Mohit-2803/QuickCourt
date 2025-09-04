"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Camera, Car, Lightbulb, CupSoda, Lock } from "lucide-react";

const amenityIcon: Record<string, React.ElementType> = {
  Wifi: Wifi,
  "CCTV Surveillance": Camera,
  parking: Car,
  lights: Lightbulb,
  Refreshments: CupSoda,
  locker: Lock,
};

export function AmenitiesRow({ amenities }: { amenities: string[] }) {
  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold mb-3">Amenities</h2>
        <div className="flex flex-wrap gap-3">
          {amenities.map((a, idx) => {
            const Icon =
              amenityIcon[a] || amenityIcon[a.toLowerCase()] || Lightbulb;
            return (
              <div
                key={`${a}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              >
                <Icon className="h-4 w-4" />
                <span>{a}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
