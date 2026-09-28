// src/hooks/useOceanData.ts
import { useState, useEffect, useCallback } from "react";
import { api, type OceanConditions } from "../lib/api";

export function useOceanData(lat: number, lon: number) {
  const [data, setData] = useState<OceanConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.ocean(lat, lon);
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch ocean data");
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
