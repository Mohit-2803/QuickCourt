"use client";

import { useState } from "react";
import { FiltersSidebar } from "@/components/player/venues/venue-booking/filters-sidebar";
import { ResultsGrid } from "@/components/player/venues/venue-booking/results-grid";
import { searchCourts } from "@/app/actions/player/search-court-action";
import type { SearchCourtsResultItem } from "@/app/actions/player/search-court-action";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

export default function VenuesClientSection({
  initialCity,
  initialItems,
}: {
  initialCity: string;
  initialItems: SearchCourtsResultItem[];
}) {
  const [items, setItems] = useState<SearchCourtsResultItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:hidden col-span-1">
        <div className="flex items-center justify-between mb-2">
          <Button
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
        <FiltersSidebar onApply={handleApply} />
      </aside>

      <main className="lg:col-span-8 xl:col-span-9">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
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

      <div
        id="mobile-filters-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filters-title"
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />

        <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card shadow-xl overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 id="mobile-filters-title" className="text-lg font-medium">
              Filters
            </h3>
            <Button
              variant="ghost"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <FiltersSidebar onApply={handleApply} />
          </div>
        </div>
      </div>
    </div>
  );
}
