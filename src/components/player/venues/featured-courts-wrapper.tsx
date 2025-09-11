"use client";

import { useEffect, useState } from "react";
import { FeaturedCourts } from "./featured-courts";
import { getFeaturedCourtsByCity } from "@/app/actions/player/get-featured";
import { useCity } from "@/app/context/CityProviderForFeaturedCourts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type FeaturedCourt = {
  id: number;
  name: string;
  venue: string;
  sport: string;
  price: number;
  image: string;
  location: string;
  ratingAvg?: number;
  ratingCount?: number;
};

export function FeaturedCourtsByCityWrapper() {
  const { city } = useCity();
  const [courts, setCourts] = useState<FeaturedCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourts() {
      try {
        setLoading(true);
        setError(null);

        const items = await getFeaturedCourtsByCity(city);

        const mapped = items.map((x) => ({
          id: Number(x.courtId),
          name: x.courtName,
          venue: x.venue.name,
          sport: x.sport,
          price: x.pricePerHour,
          image: x.image,
          location: x.venue.city,
          ratingAvg: undefined,
          ratingCount: undefined,
        }));

        setCourts(mapped);
      } catch (err) {
        console.error("Error fetching featured courts:", err);
        setError("Failed to load featured courts");
      } finally {
        setLoading(false);
      }
    }

    fetchCourts();
  }, [city]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm py-0 pb-6"
            >
              <Skeleton className="h-40 w-full" />

              <CardContent className="pt-3 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>

                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>

              {/* Button placeholder */}
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-muted bg-card p-8 text-center space-y-4 shadow-sm">
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>
        <h3 className="font-semibold text-lg">
          We&apos;re having trouble loading courts
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn&apos;t load the featured courts for {city}. Please try again
          later or explore other sections.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <FeaturedCourts items={courts} />;
}
