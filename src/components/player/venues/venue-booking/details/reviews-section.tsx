"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import LeaveReview from "./review/LeaveReview";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  user: string;
  rating: number;
  text: string;
  avatarUrl?: string | null;
  createdAt?: string | null;
};

interface ReviewsSectionProps {
  average: number;
  total: number;
  reviews: Review[];
  canLeaveReview: boolean;
  courtId: number;
}

const PREVIEW_LENGTH = 220;

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (
    parts[0].slice(0, 1).toUpperCase() +
    parts[parts.length - 1].slice(0, 1).toUpperCase()
  );
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return iso;
  }
}

export function ReviewsSection({
  average,
  total,
  reviews,
  canLeaveReview,
  courtId,
}: ReviewsSectionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

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
              Showing: Most recent
            </div>
          </div>
        </CardContent>
      </Card>

      {/* stacked reviews (one per row) */}
      <div className="space-y-4">
        {reviews.map((r) => {
          const isExpanded = !!expanded[r.id];
          const shouldTruncate = r.text && r.text.length > PREVIEW_LENGTH;
          const previewText =
            shouldTruncate && !isExpanded
              ? r.text.slice(0, PREVIEW_LENGTH) + "…"
              : r.text;

          const displayName = r.user?.trim() ? r.user : "User";

          return (
            <Card
              key={r.id}
              className="rounded-2xl border bg-card text-card-foreground shadow-sm"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Avatar or initials */}
                  <div className="flex-shrink-0">
                    {r.avatarUrl ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={r.avatarUrl}
                          alt={displayName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-orange-500/95 flex items-center justify-center text-sm font-medium text-white">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* name, rating and date/time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{displayName}</div>

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
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>

                    {/* review text */}
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{previewText}</p>

                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(r.id)}
                          className="mt-2 inline-flex items-center text-sm font-medium underline underline-offset-2  cursor-pointer text-gray-600"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
