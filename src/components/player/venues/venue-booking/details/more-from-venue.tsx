"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Item = {
  id: number;
  name: string;
  sport: string;
  pricePerHour: number;
  image: string;
};

export function MoreFromVenue({
  venueName,
  items,
}: {
  venueName: string;
  items: Item[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        More available courts at {venueName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card
            key={it.id}
            className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
          >
            <div className="relative h-40 w-full bg-muted">
              <Image
                src={it.image}
                alt={it.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="pt-3 space-y-1">
              <h3 className="font-medium">{it.name}</h3>
              <div className="text-sm text-muted-foreground">{it.sport}</div>
              <div className="text-sm font-semibold">
                ₹{it.pricePerHour.toLocaleString("en-IN")}/hr
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Book</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
