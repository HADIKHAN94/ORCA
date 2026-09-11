import React from 'react';
import { MarineMap } from '../components/MarineMap';
import { AlertTriangle } from 'lucide-react';

export const DisasterDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-marine-900">Regional Hazard Intelligence</h2>
        <p className="text-gray-600 mt-1">Track hazards, assess risks and coordinate emergency response.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <KPICard title="Overall Hazard" value="High" color="text-risk-high" />
        <KPICard title="Cyclone Risk" value="High" color="text-risk-high" />
        <KPICard title="Wave Risk" value="Moderate" color="text-risk-moderate" />
        <KPICard title="Lightning Risk" value="Low" color="text-risk-low" />
        <KPICard title="Vessels Exposed" value="142" color="text-marine-700" />
        <KPICard title="Coastal Exposure" value="7 Dists" color="text-marine-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          {/* We would use a specific map view for cyclone tracking here */}
          <MarineMap showRoute={false} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-marine-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-risk-high" /> Priority Areas
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <h4 className="font-bold text-red-900 text-sm">Sector 7 (Offshore)</h4>
              <p className="text-xs text-red-700 mt-1">3.8m waves expected within 4 hours. 24 vessels currently in zone.</p>
              <button className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded font-medium">Broadcast Evacuation</button>
            </div>
            
            <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
              <h4 className="font-bold text-amber-900 text-sm">Coastal District Alpha</h4>
              <p className="text-xs text-amber-700 mt-1">Storm surge potential 1.2m at high tide.</p>
              <button className="mt-2 text-xs bg-amber-600 text-white px-3 py-1.5 rounded font-medium">Alert Authorities</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, color }: { title: string, value: string, color: string }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
    <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);
