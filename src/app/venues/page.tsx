// app/venues/page.tsx
import { Suspense } from "react";
import { VenuesHero } from "@/components/player/venues/venues-hero";
import { SportsGrid } from "@/components/player/venues/sports-grid";
import { FeaturedCourts } from "@/components/player/venues/featured-courts";

export const metadata = {
  title: "Venues",
  description: "Discover and book sports venues near you.",
};

export default async function VenuesPage() {
  const carouselImages = ["/football.jpg", "/sport.jpg", "/login_img.jpg"];

  const featured = [
    {
      id: 1,
      name: "Court A",
      venue: "QuickCourt Arena",
      sport: "Badminton",
      price: 600,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.6,
      ratingCount: 128,
    },
    {
      id: 2,
      name: "Court 1",
      venue: "Metro Sports Hub",
      sport: "Tennis",
      price: 800,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.2,
      ratingCount: 76,
    },
    {
      id: 3,
      name: "Turf 1",
      venue: "Metro Sports Hub",
      sport: "Football",
      price: 1500,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.5,
      ratingCount: 91,
    },
    {
      id: 4,
      name: "Court B",
      venue: "QuickCourt Arena",
      sport: "Badminton",
      price: 600,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.4,
      ratingCount: 64,
    },
  ];

  const sports = [
    { name: "Badminton", image: "/badminton.jpg" },
    { name: "Tennis", image: "/tennis.jpg" },
    { name: "Football", image: "/footballl.jpg" },
    { name: "Squash", image: "/squash.jpg" },
    { name: "Table Tennis", image: "/tt.jpg" },
    { name: "Basketball", image: "/basket.jpg" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-10">
      <Suspense
        fallback={<div className="h-56 rounded-2xl bg-muted animate-pulse" />}
      >
        <VenuesHero images={carouselImages} />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}
      >
        <FeaturedCourts items={featured} />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}
      >
        <SportsGrid items={sports} />
      </Suspense>
    </div>
  );
}
