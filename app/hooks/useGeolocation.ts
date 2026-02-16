"use client";

import { useState, useEffect, useCallback } from "react";

interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
}

const DEFAULT_LOCATION: GeoLocation = {
  latitude: 28.3469,
  longitude: -81.4070,
  city: "Horizon West, FL",
};

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Try IP-based geolocation first
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            city: `${data.city}, ${data.region_code}`,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Try fallback
    }

    // Fallback: ipwho.is
    try {
      const res = await fetch("https://ipwho.is/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            city: `${data.city}, ${data.region_code || data.region}`,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Try browser GPS
    }

    // Fallback: Browser Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            city: "Your Location",
          });
          setLoading(false);
        },
        () => {
          setError("Could not detect location");
          setLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { location, loading, error, refresh: detectLocation };
}
