import { Suspense } from "react";
import { VenuesHero } from "@/components/player/venues/venues-hero";
import { SportsGrid } from "@/components/player/venues/sports-grid";
import { FeaturedCourtsByCityWrapper } from "@/components/player/venues/featured-courts-wrapper";

export const metadata = {
  title: "Venues",
  description: "Discover and book sports venues near you.",
};

export default async function VenuesPage() {
  const carouselImages = ["/football.jpg", "/sport.jpg", "/sports-tools.jpg"];

  const sports = [
    { name: "Badminton", image: "/badminton.jpg" },
    { name: "Tennis", image: "/tennis.jpg" },
    { name: "Football", image: "/footballl.jpg" },
    { name: "Squash", image: "/squash.jpg" },
    { name: "Table Tennis", image: "/tt.jpg" },
    { name: "Basketball", image: "/basket.jpg" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-10 min-h-screen">
      <Suspense
        fallback={<div className="h-56 rounded-2xl bg-muted animate-pulse" />}
      >
        <VenuesHero images={carouselImages} />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}
      >
        <FeaturedCourtsByCityWrapper />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}
      >
        <SportsGrid items={sports} />
      </Suspense>
    </div>
  );
}
