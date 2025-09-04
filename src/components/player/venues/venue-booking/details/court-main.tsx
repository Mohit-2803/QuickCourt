"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  court: {
    image: string;
    openTime: number;
    closeTime: number;
    pricePerHour: number;
    currency: string;
    sport: string;
    venue: { latitude?: number | null; longitude?: number | null };
  };
};

export function CourtMain({ court }: Props) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="relative h-64 md:h-96 w-full bg-muted">
          <Image
            src={court.image}
            alt="Court image"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-lg font-semibold">Court info</h2>
            <div className="text-sm text-muted-foreground">
              <div>
                Operating hours: {court.openTime}:00 – {court.closeTime}:00
              </div>
              <div>
                Pricing: ₹{court.pricePerHour.toLocaleString("en-IN")}/hour
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <Button className="w-full">Book Now</Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-2">Location map</h2>
            {/* Empty div placeholder for map (use lat/lon later) */}
            <div className="h-56 w-full rounded-lg bg-muted" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
