"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { getOrCreateSessionId } from "@/utils/session-id";
import { recordCourtEvent } from "@/app/actions/player/featured-action";
import Link from "next/link";

export type CourtSummary = {
  id: number;
  name: string;
  sport: string;
  pricePerHour: number;
  image: string;
  ratingAvg: number | null;
  ratingCount: number | null;
};

export function MoreFromVenue({
  venueName,
  items,
}: {
  venueName: string;
  items: CourtSummary[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        More available courts at {venueName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card
            key={`${it.id}-${it.name}`}
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
                  <h3 className="font-medium">{it.name}</h3>
                </div>
                <div className="text-right font-semibold text-green-800">
                  ₹{it.pricePerHour.toLocaleString("en-IN")}/hr
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
                  {it.ratingAvg?.toFixed(1) ?? "0.0"}
                  {it.ratingCount ? ` (${it.ratingCount})` : ""}
                </span>
              </div>

              {/* Sport */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground font-medium">
                  {it.sport}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  const sessionId = getOrCreateSessionId();
                  const minuteBucket = Math.floor(Date.now() / 60000);
                  const idem = `${sessionId}:${it.id}:${minuteBucket}`;
                  recordCourtEvent({
                    courtId: it.id,
                    kind: "VIEW",
                    source: "search",
                    idempotencyKey: idem,
                  }).catch(() => {});
                }}
                asChild
              >
                <Link href={`/venues/venue-booking/courts/${it.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
