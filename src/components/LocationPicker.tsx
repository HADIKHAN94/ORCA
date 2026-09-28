// src/components/LocationPicker.tsx
import { MapPin, Navigation, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { type Location, INDIAN_COASTAL_CITIES } from "../hooks/useLocation";

interface Props {
  location: Location;
  onSelect: (loc: Location) => void;
  onDetectGPS: () => void;
  isDetecting: boolean;
}

export function LocationPicker({
  location,
  onSelect,
  onDetectGPS,
  isDetecting,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = INDIAN_COASTAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-marine-400 transition-colors shadow-sm min-w-[180px]"
      >
        <MapPin className="w-3.5 h-3.5 text-marine-600 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{location.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or state..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-marine-400"
            />
          </div>
          {/* GPS button */}
          <button
            onClick={() => {
              onDetectGPS();
              setOpen(false);
            }}
            disabled={isDetecting}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-marine-700 hover:bg-marine-50 border-b border-gray-100 font-medium disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            {isDetecting ? "Detecting GPS..." : "Use My GPS Location"}
          </button>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  onSelect(city);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-marine-50 transition-colors ${location.name === city.name ? "bg-marine-50 text-marine-700 font-medium" : "text-gray-700"}`}
              >
                <span>{city.name}</span>
                <span className="text-xs text-gray-400">{city.state}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
