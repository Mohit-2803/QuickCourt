// app/venues/venue-booking/page.tsx
import { Suspense } from "react";
import { FiltersSidebar } from "@/components/player/venues/venue-booking/filters-sidebar";
import { ResultsGrid } from "@/components/player/venues/venue-booking/results-grid";

export default async function VenueBookingPage({
  searchParams,
}: {
  searchParams: { city?: string };
}) {
  const cityRaw = searchParams.city?.trim() || "";
  const city = cityRaw
    ? cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1)
    : "Your City";

  // Demo results; normally fetch using searchParams
  const demo = [
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
    {
      id: 5,
      name: "Court B",
      venue: "QuickCourt Arena",
      sport: "Badminton",
      price: 600,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.4,
      ratingCount: 64,
    },
    {
      id: 6,
      name: "Court B",
      venue: "QuickCourt Arena",
      sport: "Badminton",
      price: 600,
      image: "/badminton.jpg",
      location: "Bengaluru, KA",
      ratingAvg: 4.4,
      ratingCount: 64,
    },
    {
      id: 7,
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

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-6">
      {/* Top heading bar */}
      <div className="rounded-2xl border text-center bg-card text-card-foreground shadow-sm p-5">
        <h1 className="text-xl md:text-xl font-semibold">
          Sports Venues in {city}: Discover and Book Nearby Venues
        </h1>
      </div>

      {/* Layout: sidebar + results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 xl:col-span-3">
          <Suspense
            fallback={
              <div className="h-64 rounded-xl bg-muted animate-pulse" />
            }
          >
            <FiltersSidebar />
          </Suspense>
        </aside>

        <main className="lg:col-span-8 xl:col-span-9">
          <Suspense
            fallback={
              <div className="h-64 rounded-xl bg-muted animate-pulse" />
            }
          >
            <ResultsGrid items={demo} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
