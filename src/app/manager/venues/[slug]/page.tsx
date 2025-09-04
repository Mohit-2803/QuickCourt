import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CourtsBySport from "@/components/manager/venue/courts-by-sport";
import { getVenueBySlugForOwner } from "@/app/actions/manager/venue-actions";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Venue Details",
  description: "Manage your sports venue and its courts.",
};

export default async function VenuePage({
  params,
}: {
  params: { slug: string };
}) {
  const res = await getVenueBySlugForOwner(params.slug);

  if (!res.ok || !res.venue) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Venue</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {res.error || "Unable to load venue."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const venue = res.venue;

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6 min-h-screen">
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl font-semibold">
              {venue.name}
            </CardTitle>
            <Button asChild>
              <Link href={`/manager/venues/${venue.slug}/courts/new`}>
                Add Court
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground font-medium">
          {venue.city.toUpperCase()} •{" "}
          <Badge
            className="font-medium text-md"
            variant={venue.approved ? "default" : "destructive"}
          >
            {venue.approved ? "Venue Approved" : "Venue approval Pending"}
          </Badge>
        </CardContent>
      </Card>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        {venue.courts && venue.courts.length > 0 ? (
          <CourtsBySport courts={venue.courts} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No courts available.
          </div>
        )}
      </Suspense>
    </div>
  );
}
