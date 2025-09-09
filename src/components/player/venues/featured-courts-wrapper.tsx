"use client";

import { useEffect, useState } from "react";
import { FeaturedCourts } from "./featured-courts";
import { getFeaturedCourtsByCity } from "@/app/actions/player/get-featured";
import { useCity } from "@/app/context/CityProviderForFeaturedCourts";

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
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return <FeaturedCourts items={courts} />;
}
