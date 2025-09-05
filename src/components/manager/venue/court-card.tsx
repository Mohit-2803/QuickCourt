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
import { Star } from "lucide-react";
import { toggleCourtStatus } from "@/app/actions/manager/venue-actions";
import { toast } from "sonner";
import { EditCourtDialog } from "./edit-court/edit-court-dialog";

type Court = {
  id: number;
  name: string;
  sport: string;
  image: string;
  pricePerHour: number;
  currency: string;
  openTime: number;
  closeTime: number;
  status: "ACTIVE" | "INACTIVE";
  ratingAvg?: number | null;
  ratingCount?: number;
};

async function handleToggleStatus(courtId: number) {
  try {
    const res = await toggleCourtStatus(courtId);
    if (res.ok) toast.success("Court status updated");
    else toast.error(res.error || "Failed to update court status");
  } catch (error) {
    console.error("Error toggling court status:", error);
  }
}

export default function CourtCard({ court }: { court: Court }) {
  const rating = court.ratingAvg ?? 0;

  return (
    <Card className="overflow-hidden rounded-2xl border py-0 pb-6 bg-card text-card-foreground shadow-sm">
      <div className="relative h-48 w-full bg-muted">
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

      <CardHeader className="pb-2 space-y-1">
        <CardTitle className="text-base font-semibold">{court.name}</CardTitle>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  rating >= i + 1
                    ? "h-4 w-4 fill-orange-400 text-orange-400"
                    : rating >= i + 0.5
                    ? "h-4 w-4 text-orange-400"
                    : "h-4 w-4 text-muted-foreground"
                }
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {rating.toFixed(1)}{" "}
            {court.ratingCount ? `(${court.ratingCount})` : ""}
          </span>
        </div>

        <div className="text-sm text-muted-foreground font-medium">
          <span>Sport - </span>
          {court.sport}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground font-medium">
          Hours: {court.openTime}:00 - {court.closeTime}:00
        </div>
        <div className="mt-1 text-md font-medium">
          Price: ₹{court.pricePerHour} / hour
        </div>
        <div className="mt-1 text-md font-medium">
          Status:{" "}
          {court.status === "ACTIVE" ? (
            <span className="text-green-500">Active</span>
          ) : (
            <span className="text-red-500">Inactive</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2">
        {/* Open modal to edit all fields including price */}
        <EditCourtDialog court={court}>
          <Button variant="outline" size="sm" className="cursor-pointer">
            Edit
          </Button>
        </EditCourtDialog>

        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={() => handleToggleStatus(court.id)}
        >
          {court.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
