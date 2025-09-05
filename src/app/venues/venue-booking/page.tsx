// app/venues/venue-booking/page.tsx
import { Suspense } from "react";
import { FiltersSidebar } from "@/components/player/venues/venue-booking/filters-sidebar";
import { ResultsGrid } from "@/components/player/venues/venue-booking/results-grid";
import { searchCourtsByCity } from "@/app/actions/player/search-court-action";

type SearchParams = {
  city?: string;
  sport?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

export default async function VenueBookingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cityRaw = (searchParams.city || "").trim();
  const city = cityRaw ? cityRaw : "Bengaluru";

  const sport = (searchParams.sport || "").trim() || undefined;
  const q = (searchParams.q || "").trim() || undefined;
  const page = Number(searchParams.page || "1");
  const pageSize = Number(searchParams.pageSize || "12");

  const res = await searchCourtsByCity({
    city,
    sport,
    q,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 50
        ? pageSize
        : 12,
  });

  const items = res.ok ? res.items : [];
  const total = res.ok ? res.total : 0;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-6">
      {/* Top heading bar */}
      <div className="rounded-2xl border text-center bg-card text-card-foreground shadow-sm p-5">
        <h1 className="text-xl md:text-xl font-semibold">
          Sports Venues in {cityRaw ? capitalize(cityRaw) : "Bengaluru"}:
          Discover and Book Nearby Venues
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {total} results found
        </p>
      </div>

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
          <ResultsGrid items={items ?? []} />
        </main>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
