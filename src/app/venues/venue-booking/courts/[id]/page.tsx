// app/courts/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CourtHeader } from "@/components/player/venues/venue-booking/details/court-header";
import { CourtMain } from "@/components/player/venues/venue-booking/details/court-main";
import { AmenitiesRow } from "@/components/player/venues/venue-booking/details/amenities-row";
import { VenueDescription } from "@/components/player/venues/venue-booking/details/venue-description";
import { ReviewsSection } from "@/components/player/venues/venue-booking/details/reviews-section";
import { getCourtDetails } from "@/app/actions/player/get-court-details";
import { MoreFromVenue } from "@/components/player/venues/venue-booking/details/more-from-venue";

export const metadata = {
  title: "Court Details",
  description: "View detailed information about the court and venue.",
};

export default async function CourtDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const res = await getCourtDetails(id);
  if (!res.ok) notFound();

  const { court, moreCourts, reviews } = res;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
      <Suspense
        fallback={<div className="h-16 rounded-xl bg-muted animate-pulse" />}
      >
        <CourtHeader
          court={{
            name: court.name,
            sport: court.sport,
            ratingAvg: court.ratingAvg ?? 0,
            ratingCount: court.ratingCount ?? 0,
            venue: court.venue,
          }}
        />
      </Suspense>

      <Suspense
        fallback={<div className="h-80 rounded-xl bg-muted animate-pulse" />}
      >
        <CourtMain
          court={{
            sport: court.sport,
            pricePerHour: court.pricePerHour,
            currency: court.currency,
            venue: court.venue,
            image: court.image,
            openTime: court.openTime,
            closeTime: court.closeTime,
          }}
        />
      </Suspense>

      <Suspense
        fallback={<div className="h-20 rounded-xl bg-muted animate-pulse" />}
      >
        <AmenitiesRow amenities={court.amenities} />
      </Suspense>

      <Suspense
        fallback={<div className="h-40 rounded-xl bg-muted animate-pulse" />}
      >
        <VenueDescription
          venue={{
            ...court.venue,
            description: court.venue.description ?? undefined,
          }}
        />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        <MoreFromVenue
          venueName={court.venue.name}
          items={moreCourts.map((c) => ({
            id: c.id,
            name: c.name,
            sport: c.sport,
            pricePerHour: c.pricePerHour,
            image: c.image,
            ratingAvg: c.ratingAvg,
            ratingCount: c.ratingCount,
          }))}
        />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        <ReviewsSection
          average={court.ratingAvg ?? 0}
          total={court.ratingCount ?? 0}
          reviews={reviews.map((review) => ({
            ...review,
            id: String(review.id),
            text: review.text ?? "",
          }))}
        />
      </Suspense>
    </div>
  );
}
