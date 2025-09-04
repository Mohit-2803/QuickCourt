// app/my-venues/page.tsx
import { Suspense } from "react";
import VenuesGrid from "@/components/manager/venue/venues-grid";
import { VenueHeaderAndButton } from "@/components/manager/venue/add-venue-button";
import { getOwnerVenues } from "@/app/actions/manager/venue-actions";

export const metadata = {
  title: "My Venues",
  description: "Manage your sports venues.",
};

export default async function MyVenuesPage() {
  const res = await getOwnerVenues();

  if (!res.ok) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        <VenueHeaderAndButton total={0} />
        <div className="rounded-xl border bg-card text-card-foreground p-6">
          <p className="text-sm text-muted-foreground">
            {res.error || "Unable to load venues."}
          </p>
        </div>
      </div>
    );
  }

  const venues = res.venues.map((venue) => ({
    ...venue,
    courtsCount: venue._count.courts,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
      <VenueHeaderAndButton total={venues.length} />

      <Suspense
        fallback={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
      >
        <div className="space-y-6">
          <VenuesGrid venues={venues} />
        </div>
      </Suspense>
    </div>
  );
}
