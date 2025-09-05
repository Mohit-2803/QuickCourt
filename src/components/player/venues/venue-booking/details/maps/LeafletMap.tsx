// components/LeafletMap.tsx
"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = { lat: number; lng: number; zoom?: number };

export function LeafletMap({ lat, lng, zoom = 15 }: Props) {
  useEffect(() => {
    // Example simple pin path; replace with your own SVG
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 11.5 16 32 16 32s16-20.5 16-32C32 7.2 24.8 0 16 0z" fill="#EF4444"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>`
    );
    const icon = L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -40],
    });

    const map = L.map("map").setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.marker([lat, lng], { icon }).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng, zoom]);

  return <div id="map" className="h-56 w-full rounded-lg" />;
}
