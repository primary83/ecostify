"use client";

import { useEffect, useState } from "react";
import type { Provider } from "../lib/types";
import ProviderCard from "./ProviderCard";
import { useGeolocation } from "../hooks/useGeolocation";
import { MapPin, Loader2 } from "lucide-react";

interface ProviderListProps {
  searchTerms: string[];
  categoryName: string;
}

export default function ProviderList({
  searchTerms,
  categoryName,
}: ProviderListProps) {
  const { location, loading: geoLoading } = useGeolocation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "reviews">(
    "distance"
  );

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      try {
        const query = searchTerms[0] || categoryName;
        const res = await fetch(
          `/api/places?latitude=${location.latitude}&longitude=${location.longitude}&query=${encodeURIComponent(query)}&limit=20`
        );
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers || []);
        }
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!geoLoading) {
      fetchProviders();
    }
  }, [location, geoLoading, searchTerms, categoryName]);

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
    return (a.distance ?? 999) - (b.distance ?? 999);
  });

  return (
    <div>
      {/* Location & Sort Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <MapPin className="w-4 h-4 text-sage" />
          <span>{location.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Sort by:</span>
          {(["distance", "rating", "reviews"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                sortBy === s
                  ? "bg-ink text-cream border-ink"
                  : "bg-white text-ink-muted border-[rgba(26,26,46,0.12)] hover:border-ink"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading || geoLoading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="w-8 h-8 text-sage animate-spin mb-4" />
          <p className="text-sm text-ink-muted">
            Finding providers near you...
          </p>
        </div>
      ) : sortedProviders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-muted">
            No providers found in your area. Try expanding your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {sortedProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
