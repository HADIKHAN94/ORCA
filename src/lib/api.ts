// src/lib/api.ts
// Central API client — all calls go through here
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export interface OceanConditions {
  lat: number;
  lon: number;
  sst: number;
  wave_height: number;
  wave_direction: number;
  wave_period: number;
  swell_height: number;
  swell_direction: number;
  wind_speed: number;
  wind_direction: number;
  wind_direction_label: string;
  current_velocity: number;
  current_direction: number;
  visibility: string;
  timestamp: string;
  forecast_24h: Array<{
    hour: string;
    wave_height: number;
    wind_speed: number;
    sst: number;
  }>;
  source: string;
}

export interface PFZZone {
  id: string;
  lat: number;
  lon: number;
  distance_km: number;
  bearing_deg: number;
  bearing_label: string;
  intensity: "HIGH" | "MEDIUM" | "LOW";
  chlorophyll: number;
  sst: number;
  species: string[];
  depth_range: string;
  valid_until: string;
  source: string;
}

export interface PFZResponse {
  query_lat: number;
  query_lon: number;
  zones: PFZZone[];
  monsoon_ban: boolean;
  advisory_date: string;
  total_zones: number;
}

export interface SafetyScore {
  lat: number;
  lon: number;
  score: number;
  label: "SAFE" | "MODERATE" | "DANGER";
  vessel_type: string;
  recommendation: string;
  conditions: Record<
    string,
    {
      value: number | string;
      unit: string;
      threshold: number | string;
      status: string;
    }
  >;
  forecast_24h: Array<{ hour: string; score: number; wave_height: number }>;
  distance_to_imbl_km: number;
  inside_india_eez: boolean;
  geofence_warning: string | null;
  nearest_port: string;
  nearest_port_distance_km: number;
  sst: number;
  wave_height: number;
  wind_speed: number;
  wind_direction_label: string;
  source: string;
}

export interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "ADVISORY" | "INFO";
  category: string;
  title: string;
  description: string;
  region: string;
  issued: string;
  expires: string;
  source: string;
}

export interface AlertsResponse {
  alerts: AlertItem[];
  cyclone: null | object;
  last_updated: string;
}

export interface FishingOutlookDay {
  date: string;
  day: string;
  score: number;
  weather: string;
  wave_height: number;
  wind_speed: number;
  recommendation: string;
}

export interface GeofenceResult {
  lat: number;
  lon: number;
  inside_india_eez: boolean;
  inside_india_territorial: boolean;
  distance_to_imbl_km: number;
  distance_to_eez_boundary_km: number;
  warning: string | null;
  safe: boolean;
  nearest_port: string;
  nearest_port_distance_km: number;
}

async function get<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, String(v)),
  );
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

export const api = {
  ocean: (lat: number, lon: number) =>
    get<OceanConditions>("/api/ocean", { lat, lon }),

  safety: (lat: number, lon: number, vessel_type = "mechanized") =>
    get<SafetyScore>("/api/safety", { lat, lon, vessel_type }),

  pfz: (lat: number, lon: number, radius_km = 200) =>
    get<PFZResponse>("/api/fishing/pfz", { lat, lon, radius_km }),

  outlook: (lat: number, lon: number) =>
    get<{ outlook: FishingOutlookDay[]; source: string }>(
      "/api/fishing/outlook",
      { lat, lon },
    ),

  alerts: (lat: number, lon: number) =>
    get<AlertsResponse>("/api/alerts", { lat, lon }),

  geofence: (lat: number, lon: number) =>
    get<GeofenceResult>("/api/geofence/check", { lat, lon }),
};
