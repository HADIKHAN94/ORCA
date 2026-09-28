// src/pages/CoastalDashboard.tsx — Fisherman role — full real data
import React, { useState } from "react";
import { MarineMap } from "../components/MarineMap";
import {
  Fish,
  Waves,
  Wind,
  Thermometer,
  Navigation,
  AlertTriangle,
  RefreshCw,
  Anchor,
} from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useOceanData } from "../hooks/useOceanData";
import { useSafety } from "../hooks/useSafety";
import { usePFZ } from "../hooks/usePFZ";
import { useAlerts } from "../hooks/useAlerts";

function Skeleton({ w = "w-16", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />;
}

function KPICard({ title, value, unit, color, loading, icon: Icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <p className="text-xs text-gray-500 font-medium">{title}</p>
      </div>
      {loading ? (
        <Skeleton />
      ) : (
        <p className={`text-xl font-bold ${color}`}>
          {value}
          <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      )}
    </div>
  );
}

export const CoastalDashboard: React.FC = () => {
  const { location } = useRole();
  const [vessel, setVessel] = useState("mechanized");
  const {
    data: ocean,
    loading: oceanLoading,
    refetch: refetchOcean,
  } = useOceanData(location.lat, location.lon);
  const {
    data: safety,
    loading: safetyLoading,
    refetch: refetchSafety,
  } = useSafety(location.lat, location.lon, vessel);
  const { data: pfz, loading: pfzLoading } = usePFZ(location.lat, location.lon);
  const { data: alertsData } = useAlerts(location.lat, location.lon);

  const safetyColor =
    safety?.label === "SAFE"
      ? "text-risk-low"
      : safety?.label === "MODERATE"
        ? "text-risk-moderate"
        : "text-risk-high";
  const safetyBg =
    safety?.label === "SAFE"
      ? "bg-green-50 border-green-200"
      : safety?.label === "MODERATE"
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  const refetchAll = () => {
    refetchOcean();
    refetchSafety();
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-marine-900">
            Situational Awareness
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Live ocean intelligence for{" "}
            <span className="font-semibold text-marine-700">
              {location.name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={vessel}
            onChange={(e) => setVessel(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            <option value="small">Small Boat</option>
            <option value="country">Country Boat</option>
            <option value="mechanized">Mechanized Trawler</option>
            <option value="large">Large Vessel</option>
          </select>
          <button
            onClick={refetchAll}
            className="flex items-center gap-1.5 text-xs text-marine-600 hover:text-marine-800 border border-marine-200 rounded-lg px-2 py-1.5 hover:bg-marine-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      {safety && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${safetyBg}`}
        >
          <div className={`text-2xl font-black ${safetyColor} leading-none`}>
            {safety.score}
          </div>
          <div className="flex-1">
            <p className={`font-bold text-sm ${safetyColor}`}>
              {safety.label} — Safety Score
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {safety.recommendation}
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <p>
              IMBL:{" "}
              <span className="font-semibold">
                {safety.distance_to_imbl_km} km
              </span>
            </p>
            <p>
              Port: <span className="font-semibold">{safety.nearest_port}</span>
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard
          title="Sea Surface Temp"
          value={ocean?.sst ?? "—"}
          unit="°C"
          color="text-orange-500"
          loading={oceanLoading}
          icon={Thermometer}
        />
        <KPICard
          title="Wave Height"
          value={ocean?.wave_height ?? "—"}
          unit="m"
          color="text-blue-600"
          loading={oceanLoading}
          icon={Waves}
        />
        <KPICard
          title="Wind Speed"
          value={ocean?.wind_speed ?? "—"}
          unit="km/h"
          color="text-indigo-600"
          loading={oceanLoading}
          icon={Wind}
        />
        <KPICard
          title="PFZ Zones"
          value={pfz?.total_zones ?? "—"}
          unit="found"
          color="text-green-600"
          loading={pfzLoading}
          icon={Fish}
        />
        <KPICard
          title="Safety Score"
          value={safety?.score ?? "—"}
          unit="/100"
          color={safetyColor}
          loading={safetyLoading}
          icon={AlertTriangle}
        />
      </div>

      {/* Map + Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          <MarineMap showRoute={false} />
        </div>

        {/* PFZ Zones panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3 overflow-y-auto">
          <h3 className="font-bold text-marine-900 flex items-center gap-2 text-sm">
            <Fish className="w-4 h-4 text-green-600" /> Nearest PFZ Zones
          </h3>
          {pfzLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} w="w-full" h="h-16" />
              ))}
            </div>
          ) : pfz?.monsoon_ban ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              🚫 PFZ Advisory not issued during monsoon ban season. Check again
              after July.
            </div>
          ) : pfz?.zones.length === 0 ? (
            <p className="text-sm text-gray-500">
              No zones within 200km range.
            </p>
          ) : (
            pfz?.zones.map((z, i) => (
              <div
                key={z.id}
                className={`p-3 rounded-lg border text-xs ${z.intensity === "HIGH" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-bold text-sm ${z.intensity === "HIGH" ? "text-green-700" : "text-amber-700"}`}
                  >
                    {z.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${z.intensity === "HIGH" ? "bg-green-600 text-white" : "bg-amber-500 text-white"}`}
                  >
                    {z.intensity}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">
                    {z.distance_km} km {z.bearing_label}
                  </span>{" "}
                  — Chloro: {z.chlorophyll} mg/m³
                </p>
                <p className="text-gray-600">Species: {z.species.join(", ")}</p>
                <p className="text-gray-400">
                  {z.lat.toFixed(2)}°N, {z.lon.toFixed(2)}°E · Depth:{" "}
                  {z.depth_range}
                </p>
              </div>
            ))
          )}

          {/* Live conditions */}
          {ocean && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Live Conditions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Visibility", value: ocean.visibility },
                  { label: "Current", value: `${ocean.current_velocity} m/s` },
                  { label: "Wind Dir", value: ocean.wind_direction_label },
                  { label: "Swell", value: `${ocean.swell_height}m` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-400">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {alertsData && alertsData.alerts.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Active
                Alerts ({alertsData.alerts.length})
              </h4>
              {alertsData.alerts.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className={`p-2 rounded mb-1 text-xs ${a.severity === "CRITICAL" ? "bg-red-50 border border-red-200 text-red-800" : a.severity === "WARNING" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}
                >
                  <span className="font-bold">[{a.severity}]</span> {a.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-right">
        Data: Open-Meteo Marine, INCOIS PFZ, ORCA Safety Engine ·{" "}
        {ocean?.timestamp
          ? new Date(ocean.timestamp).toLocaleTimeString("en-IN")
          : "—"}
      </p>
    </div>
  );
};
