"use client";

import { useState } from "react";
import { FiltersSidebar } from "@/components/player/venues/venue-booking/filters-sidebar";
import { ResultsGrid } from "@/components/player/venues/venue-booking/results-grid";
import { searchCourts } from "@/app/actions/player/search-court-action";
import type { SearchCourtsResultItem } from "@/app/actions/player/search-court-action";

export default function VenuesClientSection({
  initialCity,
  initialItems,
}: {
  initialCity: string;
  initialItems: SearchCourtsResultItem[];
}) {
  const [items, setItems] = useState<SearchCourtsResultItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  async function handleApply(filters: {
    q: string;
    selected: string[];
    price: [number, number];
    rating: string;
  }) {
    setLoading(true);
    const minRating =
      filters.rating && filters.rating !== "any"
        ? Number(filters.rating)
        : undefined;

    const res = await searchCourts({
      city: initialCity,
      q: filters.q || undefined,
      sports: filters.selected.length ? filters.selected : undefined,
      minPrice: filters.price?.[0],
      maxPrice: filters.price?.[1],
      minRating,
      page: 1,
      pageSize: 12,
    });

    setItems(res.items);
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-4 xl:col-span-3">
        <FiltersSidebar onApply={handleApply} />
      </aside>
      <main className="lg:col-span-8 xl:col-span-9">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ResultsGrid items={items ?? []} />
        )}
      </main>
    </div>
  );
}
