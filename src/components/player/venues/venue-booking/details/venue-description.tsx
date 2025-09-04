"use client";

import { Card, CardContent } from "@/components/ui/card";

export function VenueDescription({
  venue,
}: {
  venue: { name: string; description?: string };
}) {
  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-5 space-y-2">
        <h2 className="text-lg font-semibold">About {venue.name}</h2>
        <p className="text-sm text-muted-foreground">
          {venue.description || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
}
