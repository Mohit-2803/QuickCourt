"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Court = {
  id: number;
  name: string;
  sport: string;
  image: string; // URL for court photo
  pricePerHour: number; // INR
  currency: string;
  openTime: number; // 6
  closeTime: number; // 22
};

export default function CourtCard({ court }: { court: Court }) {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="relative h-40 w-full bg-muted">
        {court.image && (
          <Image
            src={court.image}
            alt={`${court.name} - ${court.sport}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        )}
      </div>

      {/* Header */}
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{court.name}</CardTitle>
        <div className="text-sm text-muted-foreground">{court.sport}</div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          Hours: {court.openTime}:00 - {court.closeTime}:00
        </div>
        <div className="mt-1 text-sm">Price: ₹{court.pricePerHour} / hour</div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="cursor-pointer">
          Edit
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Price
        </Button>
        <Button variant="destructive" size="sm" className="cursor-pointer">
          Disable
        </Button>
      </CardFooter>
    </Card>
  );
}
