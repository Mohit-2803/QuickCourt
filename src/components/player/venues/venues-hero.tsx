"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCity } from "@/app/context/CityProviderForFeaturedCourts";

type Suggestion = {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  formatted?: string;
};

const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export function VenuesHero({ images }: { images: string[] }) {
  const router = useRouter();
  const { setCity } = useCity();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [navigating, setNavigating] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // ---- Search logic ----
  useEffect(() => {
    if (navigating) {
      setOpen(false);
      setResults([]);
      setLoading(false);
      return;
    }

    if (!query || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          text: query,
          type: "city",
          filter: "countrycode:in",
          format: "json",
          apiKey: GEOAPIFY_API_KEY || "",
          limit: "8",
        });
        const res = await fetch(`${GEOAPIFY_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Geoapify request failed");
        const data = await res.json();

        if (navigating) return;

        const items: Suggestion[] = data?.results ?? [];
        const mapped: Suggestion[] = items.map((it) => ({
          name: it.name,
          city: it.city,
          state: it.state,
          country: it.country,
          lat: it.lat,
          lon: it.lon,
          formatted: it.formatted,
        }));
        setResults(mapped);
        setOpen(mapped.length > 0);
      } catch {
        if (!navigating) {
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (!navigating) {
          setLoading(false);
        }
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, navigating]);

  function selectSuggestion(s: Suggestion) {
    setLoading(false);
    setResults([]);
    setOpen(false);
    setNavigating(true);
    const city = s.formatted?.split(",")[0] || s.city || s.name || "";
    setQuery(city);

    setCity(city);

    router.push(`/venues/venue-booking?city=${encodeURIComponent(city)}`);
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Find sports venues near you
        </h1>
        <p className="mt-2 text-muted-foreground w-3/4">
          Seamlessly explore sports venues and play with sports enthusiasts just
          like you!
        </p>

        <div className="mt-4 space-y-3 w-3/4">
          <div className="relative self-center my-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter city (e.g., Ahmedabad)"
              className="pl-9"
              aria-label="Search city"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setNavigating(false);
              }}
              onFocus={() => results.length && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {navigating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-t-transparent border-muted-foreground rounded-full animate-spin"></div>
            )}
            {open && (
              <ul
                ref={listRef}
                className={cn(
                  "absolute z-20 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md",
                  "max-h-64 overflow-auto"
                )}
              >
                {loading && (
                  <li className="px-3 py-2 text-sm text-muted-foreground font-medium">
                    Searching…
                  </li>
                )}
                {!loading && results.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No results
                  </li>
                )}
                {!loading &&
                  results.map((s, idx) => (
                    <li
                      key={`${s.lat}-${s.lon}-${idx}`}
                      className="cursor-pointer px-3 py-2 hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s);
                      }}
                    >
                      <div className="text-sm">
                        {s.city || s.name || s.formatted}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {[s.state, s.country].filter(Boolean).join(", ")}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Right section: carousel with autoplay */}
      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 0.6s ease-in-out",
              display: "flex",
            }}
          >
            {images.map((src, i) => (
              <CarouselItem key={i} className="w-full flex-shrink-0">
                <div className="relative h-64 md:h-80 w-full">
                  <Image
                    src={src}
                    alt={`Venue ${i + 1}`}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length
              )
            }
          />
          <CarouselNext
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % images.length)
            }
          />
        </Carousel>
      </div>
    </section>
  );
}
