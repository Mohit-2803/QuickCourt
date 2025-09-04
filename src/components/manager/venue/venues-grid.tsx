"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";

type VenueCard = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  city: string;
  state?: string | null;
  country?: string | null;
  approved: boolean;
  photos: string[];
  amenities: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  courtsCount: number;
};

export default function VenuesGrid({ venues }: { venues: VenueCard[] }) {
  return (
    <section data-view="grid" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((v) => (
          <Card
            key={v.id}
            className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
          >
            <div className="relative h-40 w-full bg-muted">
              {v.photos && v.photos.length > 0 && (
                <Image
                  src={v.photos[0]}
                  alt={v.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                />
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold truncate">
                  {v.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    v.approved
                      ? "border-green-700/30 text-green-500 bg-green-600/15"
                      : "border-amber-700/30 text-amber-500 bg-amber-600/15"
                  }
                >
                  {v.approved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {v.city}
                  {v.state ? `, ${v.state}` : ""}{" "}
                  {v.country ? `• ${v.country}` : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {v.description}
              </p>
              <div className="mt-3 text-sm text-muted-foreground">
                {v.courtsCount} courts
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href={`/manager/venues/${v.slug}`}
                  aria-label={`View ${v.name}`}
                >
                  View
                </a>
              </Button>
              <Button className="gap-2" variant="ghost">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
