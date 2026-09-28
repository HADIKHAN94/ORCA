// src/hooks/useSafety.ts
import { useState, useEffect, useCallback } from "react";
import { api, type SafetyScore } from "../lib/api";

export function useSafety(lat: number, lon: number, vesselType = "mechanized") {
  const [data, setData] = useState<SafetyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.safety(lat, lon, vesselType));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, vesselType]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
