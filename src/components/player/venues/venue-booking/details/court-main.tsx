"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeafletMap } from "./maps/LeafletMap";

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
  const { latitude, longitude } = court.venue || {};
  const hasCoords =
    typeof latitude === "number" &&
    !Number.isNaN(latitude) &&
    typeof longitude === "number" &&
    !Number.isNaN(longitude);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="relative w-full h-full bg-muted">
          <Image
            src={court.image}
            alt="Court image"
            fill
            className="h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-row justify-between py-0 items-center">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-lg font-semibold">Court info</h2>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-md">
                Available hours: {court.openTime}:00 – {court.closeTime}:00
              </div>
              <div className="font-medium text-md">
                Pricing:{" "}
                <span className="font-semibold text-green-700">
                  ₹{court.pricePerHour.toLocaleString("en-IN")}/hour
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button className="w-full cursor-pointer">Book Now</Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm py-0">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-2">Location map</h2>
            {hasCoords ? (
              <LeafletMap lat={latitude as number} lng={longitude as number} />
            ) : (
              <div className="h-56 w-full rounded-lg bg-muted" />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
