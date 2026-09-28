import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MarineMap } from "../components/MarineMap";
import { useRole } from "../context/RoleContext";

export const ResearcherDashboard: React.FC = () => {
  const { location } = useRole();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/ocean/history?lat=${location.lat}&lon=${location.lon}&days=30`,
        );
        const data = await res.json();
        setHistoryData(data.history.reverse());
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [location.lat, location.lon]);

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-marine-900">
          Ocean Analytics Workspace
        </h2>
        <p className="text-gray-600 mt-1">
          Explore ocean data, analyze trends and generate scientific insights.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">
            SST Anomaly (30d)
          </p>
          <p className="text-xl font-bold text-red-500">+1.2°C</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Avg Chlorophyll
          </p>
          <p className="text-xl font-bold text-marine-700">1.48 mg/m³</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Ocean Front Activity
          </p>
          <p className="text-xl font-bold text-risk-moderate">High</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Data Freshness
          </p>
          <p className="text-xl font-bold text-gray-800">Live</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Region Analyzed
          </p>
          <p className="text-lg font-bold text-marine-700 truncate">
            {location.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-marine-900 mb-4">
            SST vs Wave Trend (30 Days)
          </h3>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Loading history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historyData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#6B7280" }}
                    minTickGap={30}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#EF4444" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#3b82f6" }}
                  />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sst"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    name="SST (°C)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="wave_height"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Wave Height (m)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 p-4 bg-marine-50 rounded-lg border border-marine-100">
            <p className="text-sm text-marine-900 font-medium">
              ORCA Analysis:
            </p>
            <p className="text-sm text-marine-700 mt-1">
              Recent data shows stabilization of SST in the {location.name}{" "}
              region after a short-term anomaly. Wave heights correlate with
              expected seasonal monsoon winds.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
          <MarineMap showRoute={false} />
        </div>
      </div>
    </div>
  );
};
