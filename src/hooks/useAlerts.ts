// src/hooks/useAlerts.ts
import { useState, useEffect, useCallback } from "react";
import { api, type AlertsResponse } from "../lib/api";

export function useAlerts(lat: number, lon: number) {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.alerts(lat, lon));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(fetch, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
