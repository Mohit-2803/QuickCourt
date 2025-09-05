"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

type Props = {
  court: {
    name: string;
    sport: string;
    ratingAvg: number;
    ratingCount: number;
    venue: {
      name: string;
      city: string;
      state?: string | null;
      country?: string | null;
    };
  };
};

export function CourtHeader({ court }: Props) {
  const location = [court.venue.city, court.venue.state]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="px-6 py-2 space-y-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{court.name}</h1>
          <h3 className="text-lg font-semibold text-gray-700">
            {court.venue.name}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location || court.venue.country}
          </span>
          <span>•</span>
          <span>{court.sport}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  (court.ratingAvg ?? 0) >= i + 0.5
                    ? "h-3.5 w-3.5 fill-orange-400 text-orange-400"
                    : "h-3.5 w-3.5 text-muted-foreground"
                }
              />
            ))}
            <span className="ml-1">
              {court.ratingAvg.toFixed(1)} ({court.ratingCount})
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
