"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import LeaveReview from "./review/LeaveReview";
import { useRouter } from "next/navigation";

type Review = { id: string; user: string; rating: number; text: string };

interface ReviewsSectionProps {
  average: number;
  total: number;
  reviews: Review[];
  canLeaveReview: boolean;
  courtId: number;
}

export function ReviewsSection({
  average,
  total,
  reviews,
  canLeaveReview,
  courtId,
}: ReviewsSectionProps) {
  const router = useRouter();
  return (
    <section className="space-y-6">
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    average >= i + 0.5
                      ? "h-4 w-4 fill-orange-400 text-orange-400"
                      : "h-4 w-4 text-muted-foreground"
                  }
                />
              ))}
              <span className="font-medium">{average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({total} reviews)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Sort: Most recent
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="rounded-2xl border bg-card text-card-foreground shadow-sm"
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      r.rating >= i + 0.5
                        ? "h-3.5 w-3.5 fill-orange-400 text-orange-400"
                        : "h-3.5 w-3.5 text-muted-foreground"
                    }
                  />
                ))}
                <span className="ml-1 text-sm font-medium">{r.user}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canLeaveReview && (
        <LeaveReview
          courtId={courtId}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
