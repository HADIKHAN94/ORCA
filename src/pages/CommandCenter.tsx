import React from "react";
import { useRole } from "../context/RoleContext";
import { Wind, Waves, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { MarineMap } from "../components/MarineMap";

export const CommandCenter: React.FC = () => {
  const { role } = useRole();

  return (
    <div className="h-full flex gap-6">
      <div className="flex-1 flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-marine-900 flex items-center gap-2">
            Good Morning, {role === "Fisherman" ? "Captain" : role}{" "}
            <span className="text-2xl">👋</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Here's your marine overview for today.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Marine Risk"
            value="Low"
            subtitle="25 / 100"
            color="text-risk-low"
          />
          <KPICard
            title="Wave Height"
            value="1.4 m"
            subtitle="Low"
            color="text-risk-low"
          />
          <KPICard
            title="Wind Speed"
            value="18 km/h"
            subtitle="Moderate"
            color="text-risk-moderate"
          />
          <KPICard
            title="Sea Surface Temp"
            value="28.2°C"
            subtitle="Favourable"
            color="text-risk-low"
          />
          <KPICard
            title="Nearest PFZ"
            value="32.4 km"
            subtitle="Zone B"
            color="text-marine-600"
          />
          <KPICard
            title="ETA to PFZ"
            value="1h 42m"
            subtitle="Optimal route"
            color="text-marine-600"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Recommendation Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-marine-900">
                Today's Recommendation
              </h3>
              <span className="bg-risk-low/10 text-risk-low text-xs px-2.5 py-1 rounded-full font-bold border border-risk-low/20">
                GO
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-2xl font-bold text-marine-700">PFZ Zone B</h4>
              <div className="flex space-x-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                  High Potential
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                  Good Safety
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Distance</p>
                <p className="font-semibold text-gray-900">32.4 km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ETA</p>
                <p className="font-semibold text-gray-900">1h 42m</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <p className="font-semibold text-gray-900">82%</p>
              </div>
            </div>

            <div className="mt-auto flex space-x-3">
              <button className="flex-1 bg-marine-600 text-white py-2.5 rounded-lg font-medium hover:bg-marine-700 transition-colors">
                View on Map
              </button>
              <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Alternative Routes
              </button>
            </div>
          </div>

          {/* Map Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm flex flex-col h-80 lg:h-auto">
            <MarineMap showRoute={true} />
          </div>

          {/* Evidence Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-marine-900">
                Why this Zone?
              </h3>
              <Info className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 flex-1">
              <EvidenceItem text="High chlorophyll concentration" />
              <EvidenceItem text="Favorable SST (28.2°C)" />
              <EvidenceItem text="Low wave exposure (1.4m)" />
              <EvidenceItem text="Moderate wind (18 km/h)" />
              <EvidenceItem text="No restricted-zone conflict" />
              <EvidenceItem text="Shorter travel distance" />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>Updated 12 mins ago</span>
              <a
                href="#"
                className="text-marine-600 font-medium hover:underline"
              >
                View Data Sources
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Alerts */}
      <div className="w-80 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-bold text-marine-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-risk-moderate" /> Alerts
          </h3>
          <span className="bg-marine-100 text-marine-800 text-xs px-2 py-0.5 rounded-full font-bold">
            2 Active
          </span>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                No critical alerts
              </p>
              <p className="text-xs text-green-700 mt-1">
                Conditions are clear for your recommended route.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
            <Wind className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Moderate Wind Advisory
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Valid for Sector 7 next 4 hours. Wind speeds up to 22 km/h.
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Source: INCOIS
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
            <Waves className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Small Craft Advisory
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Caution advised in offshore zones due to building swells.
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Source: IMD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <p className="text-xs text-gray-500 font-medium mb-2">{title}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-600 font-medium mt-1">{subtitle}</p>
  </div>
);

const EvidenceItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full">
      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
    </div>
    <span className="text-sm text-gray-700 font-medium">{text}</span>
  </div>
);
