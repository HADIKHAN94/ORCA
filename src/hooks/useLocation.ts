// src/hooks/useLocation.ts
// Shared location state + list of Indian coastal cities
import { useState } from "react";

export interface Location {
  name: string;
  lat: number;
  lon: number;
  state: string;
}

export const INDIAN_COASTAL_CITIES: Location[] = [
  { name: "Ratnagiri", lat: 16.99, lon: 73.31, state: "Maharashtra" },
  { name: "Mumbai", lat: 18.93, lon: 72.83, state: "Maharashtra" },
  { name: "Alibag", lat: 18.64, lon: 72.87, state: "Maharashtra" },
  { name: "Goa (Panaji)", lat: 15.49, lon: 73.83, state: "Goa" },
  { name: "Mangalore", lat: 12.87, lon: 74.84, state: "Karnataka" },
  { name: "Kochi", lat: 9.93, lon: 76.27, state: "Kerala" },
  { name: "Kozhikode", lat: 11.25, lon: 75.78, state: "Kerala" },
  { name: "Thiruvananthapuram", lat: 8.5, lon: 76.96, state: "Kerala" },
  { name: "Tuticorin", lat: 8.78, lon: 78.13, state: "Tamil Nadu" },
  { name: "Chennai", lat: 13.08, lon: 80.27, state: "Tamil Nadu" },
  { name: "Visakhapatnam", lat: 17.68, lon: 83.22, state: "Andhra Pradesh" },
  { name: "Paradip", lat: 20.32, lon: 86.67, state: "Odisha" },
  { name: "Kolkata (Digha)", lat: 21.62, lon: 87.45, state: "West Bengal" },
  { name: "Veraval", lat: 20.9, lon: 70.37, state: "Gujarat" },
  { name: "Kandla", lat: 23.02, lon: 70.22, state: "Gujarat" },
  { name: "Port Blair", lat: 11.67, lon: 92.74, state: "Andaman & Nicobar" },
  { name: "Kavaratti", lat: 10.57, lon: 72.64, state: "Lakshadweep" },
];

export function useLocation() {
  const [location, setLocation] = useState<Location>(INDIAN_COASTAL_CITIES[0]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }
    setIsDetecting(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find nearest city
        let nearest = INDIAN_COASTAL_CITIES[0];
        let minD = Infinity;
        for (const city of INDIAN_COASTAL_CITIES) {
          const d = Math.hypot(city.lat - latitude, city.lon - longitude);
          if (d < minD) {
            minD = d;
            nearest = city;
          }
        }
        setLocation({
          ...nearest,
          lat: latitude,
          lon: longitude,
          name: `My Location (near ${nearest.name})`,
        });
        setIsDetecting(false);
      },
      (err) => {
        setGpsError(err.message);
        setIsDetecting(false);
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  return { location, setLocation, detectGPS, isDetecting, gpsError };
}
