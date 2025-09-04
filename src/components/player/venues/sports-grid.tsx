// components/venues/sports-grid.tsx
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";

type SportItem = {
  name: string;
  image: string;
};

export function SportsGrid({ items }: { items: SportItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Some Popular Sports</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((sp) => (
          <Card
            key={sp.name}
            className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm py-0 relative"
          >
            <div className="relative h-52 w-full bg-muted">
              <Image
                src={sp.image}
                alt={sp.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm font-medium absolute bottom-2 left-2 text-white z-10">
              {sp.name}
            </p>
            {/* for blackish bottom below div */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </Card>
        ))}
      </div>
    </section>
  );
}
