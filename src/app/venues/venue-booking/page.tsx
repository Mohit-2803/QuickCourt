import { Suspense } from "react";
import { searchCourtsByCity } from "@/app/actions/player/search-court-action";
import VenuesClientSection from "@/components/player/venues/venue-booking/venuesSearchSection";

type SearchParams = {
  city?: string;
  sport?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const sp = await searchParams;
  const city = (sp.city || "").trim();
  return { title: city ? `${capitalize(city)}` : "Courts" };
};

export default async function VenueBookingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const cityRaw = (sp.city || "").trim();
  const city = cityRaw ? cityRaw : "Bengaluru";
  const sport = (sp.sport || "").trim() || undefined;
  const q = (sp.q || "").trim() || undefined;
  const page = Number(sp.page || "1");
  const pageSize = Number(sp.pageSize || "12");

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
  // const total = res.ok ? res.total : 0;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-6 min-h-screen">
      <div className="rounded-2xl border text-center bg-card text-card-foreground shadow-sm p-5">
        <h1 className="text-xl md:text-xl font-semibold">
          Sports Venues in {capitalize(cityRaw || "Bengaluru")}: Discover and
          Book Nearby Venues
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {items?.length || 0} results found
        </p>
      </div>

      <Suspense
        fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        <VenuesClientSection initialCity={city} initialItems={items ?? []} />
      </Suspense>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
