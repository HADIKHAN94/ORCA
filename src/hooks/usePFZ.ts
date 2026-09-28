// src/hooks/usePFZ.ts
import { useState, useEffect, useCallback } from "react";
import { api, type PFZResponse } from "../lib/api";

export function usePFZ(lat: number, lon: number) {
  const [data, setData] = useState<PFZResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setData(await api.pfz(lat, lon));
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [lat, lon]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

