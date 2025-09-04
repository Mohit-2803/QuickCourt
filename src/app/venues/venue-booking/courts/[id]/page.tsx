// app/courts/[id]/page.tsx
import { Suspense } from "react";
import { CourtHeader } from "@/components/player/venues/venue-booking/details/court-header";
import { CourtMain } from "@/components/player/venues/venue-booking/details/court-main";
import { AmenitiesRow } from "@/components/player/venues/venue-booking/details/amenities-row";
import { MoreFromVenue } from "@/components/player/venues/venue-booking/details/more-from-venue";
import { VenueDescription } from "@/components/player/venues/venue-booking/details/venue-description";
import { ReviewsSection } from "@/components/player/venues/venue-booking/details/reviews-section";

export default async function CourtDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Dummy payload (replace with server fetch)
  const court = {
    id: Number(params.id),
    name: "Court A",
    sport: "Badminton",
    pricePerHour: 600,
    currency: "INR",
    venue: {
      id: 10,
      name: "QuickCourt Arena",
      city: "Bengaluru",
      state: "KA",
      country: "India",
      description:
        "QuickCourt Arena is a premium multi-sport facility offering top-quality courts, professional lighting, and comfortable amenities. Ideal for casual play and competitive sessions.",
      latitude: 12.9716,
      longitude: 77.5946,
    },
    ratingAvg: 4.6,
    ratingCount: 128,
    image: "/images/courts/badminton-1.jpg",
    openTime: 6,
    closeTime: 22,
    amenities: [
      "parking",
      "lights",
      "locker",
      "washroom",
      "Wifi",
      "CCTV Surveillance",
    ],
  };

  const moreCourts = [
    {
      id: 2,
      name: "Court B",
      sport: "Badminton",
      pricePerHour: 600,
      image: "/images/courts/badminton-2.jpg",
    },
    {
      id: 3,
      name: "Court 1",
      sport: "Tennis",
      pricePerHour: 800,
      image: "/images/courts/tennis-1.jpg",
    },
    {
      id: 4,
      name: "Turf 1",
      sport: "Football",
      pricePerHour: 1500,
      image: "/images/courts/football-1.jpg",
    },
  ];

  const reviews = [
    {
      id: "r1",
      user: "Aarav",
      rating: 5,
      text: "Great court quality and lighting!",
    },
    {
      id: "r2",
      user: "Neha",
      rating: 4,
      text: "Clean facility and friendly staff.",
    },
    {
      id: "r3",
      user: "Rahul",
      rating: 4,
      text: "Good availability during mornings.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
      <Suspense
        fallback={<div className="h-16 rounded-xl bg-muted animate-pulse" />}
      >
        <CourtHeader court={court} />
      </Suspense>

      <Suspense
        fallback={<div className="h-80 rounded-xl bg-muted animate-pulse" />}
      >
        <CourtMain court={court} />
      </Suspense>

      <Suspense
        fallback={<div className="h-20 rounded-xl bg-muted animate-pulse" />}
      >
        <AmenitiesRow amenities={court.amenities} />
      </Suspense>

      <Suspense
        fallback={<div className="h-40 rounded-xl bg-muted animate-pulse" />}
      >
        <VenueDescription venue={court.venue} />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        <MoreFromVenue venueName={court.venue.name} items={moreCourts} />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        <ReviewsSection
          average={court.ratingAvg}
          total={court.ratingCount}
          reviews={reviews}
        />
      </Suspense>
    </div>
  );
}
