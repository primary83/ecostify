"use client";

import type { Provider } from "../lib/types";
import { Star, MapPin, Phone } from "lucide-react";

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div
      className="bg-white rounded-[var(--radius)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      {/* Photo */}
      <div className="relative h-40 bg-cream-dark flex items-center justify-center">
        {provider.photoRef ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photo?ref=${encodeURIComponent(provider.photoRef)}&maxWidth=400&maxHeight=300`}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl text-ink-muted opacity-30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-12 h-12"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 12h6M9 8h6M9 16h3" />
            </svg>
          </div>
        )}
        {/* Open/Closed badge */}
        {provider.isOpen !== undefined && (
          <span
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{
              background: provider.isOpen
                ? "var(--sage)"
                : "var(--coral)",
            }}
          >
            {provider.isOpen ? "Open" : "Closed"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-base mb-1 text-ink">
          {provider.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                fill={i < Math.round(provider.rating) ? "#f5c518" : "none"}
                stroke={i < Math.round(provider.rating) ? "#f5c518" : "#ccc"}
              />
            ))}
          </div>
          <span className="text-xs text-ink-muted">
            {provider.rating.toFixed(1)} ({provider.reviewCount})
          </span>
          {provider.distance !== undefined && (
            <span className="text-xs text-ink-muted ml-auto">
              {provider.distance} mi
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-ink-muted mb-3">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {provider.address}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold no-underline transition-all hover:-translate-y-px"
              style={{
                background: "var(--sage)",
                color: "white",
              }}
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
          <button
            onClick={() => {
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  provider.name + " " + provider.address
                )}`,
                "_blank"
              );
            }}
            className="flex-1 py-2.5 rounded-full text-xs font-semibold cursor-pointer bg-white transition-all hover:border-ink"
            style={{
              border: "1.5px solid rgba(26,26,46,0.12)",
              color: "var(--ink)",
            }}
          >
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
}
