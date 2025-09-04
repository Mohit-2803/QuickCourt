// components/venues/booking/results-grid.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

type CourtCard = {
  id: number;
  name: string;
  venue: string;
  sport: string;
  price: number;
  image: string;
  location: string;
  ratingAvg?: number | null;
  ratingCount?: number;
};

export function ResultsGrid({ items }: { items: CourtCard[] }) {
  return (
    <section className="space-y-3">
      <div className="text-sm text-muted-foreground">
        We got {items.length} results for you
      </div>
      {items.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg font-medium py-8">
          No results found.
          <p className="text-sm font-normal">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((it) => (
            <Card
              key={`${it.id}-${it.venue}-${it.name}`}
              className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm py-0 pb-6"
            >
              <div className="relative h-40 w-full bg-muted">
                <Image
                  src={it.image}
                  alt={it.name}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="pt-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {it.venue}
                    </p>
                    <h3 className="font-medium">{it.name}</h3>
                  </div>
                  <div className="text-right font-semibold text-green-800">
                    ₹{it.price.toLocaleString("en-IN")}/hr
                  </div>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = (it.ratingAvg ?? 0) >= i + 1;
                    const half =
                      (it.ratingAvg ?? 0) >= i + 0.5 &&
                      (it.ratingAvg ?? 0) < i + 1;
                    return (
                      <Star
                        key={i}
                        className={
                          filled || half
                            ? "h-3.5 w-3.5 fill-orange-400 text-orange-400"
                            : "h-3.5 w-3.5 text-muted-foreground"
                        }
                      />
                    );
                  })}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {it.ratingAvg?.toFixed(1) ?? "—"}
                    {it.ratingCount ? ` (${it.ratingCount})` : ""}
                  </span>
                </div>

                {/* Sport and location */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">{it.sport}</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[10rem]">
                      {it.location}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full cursor-pointer">
                  <Link href={`/venues/venue-booking/courts/${it.id}`}>
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
