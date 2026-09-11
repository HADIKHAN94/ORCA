import React from 'react';
import { MarineMap } from '../components/MarineMap';
import { Ship } from 'lucide-react';

export const CoastalDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-marine-900">Situational Awareness</h2>
        <p className="text-gray-600 mt-1">Monitor marine activity, manage resources and ensure coastal safety.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Active Vessels" value="125" color="text-marine-700" />
        <KPICard title="Restricted Breaches" value="0" color="text-risk-low" />
        <KPICard title="Unknown Vessels" value="2" color="text-risk-moderate" />
        <KPICard title="Active Alerts" value="4" color="text-risk-moderate" />
        <KPICard title="Marine Patrols" value="12" color="text-marine-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          <MarineMap showRoute={false} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-marine-900 mb-4 flex items-center gap-2">
            <Ship className="w-5 h-5 text-marine-600" /> Recent Activity
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900 text-sm">Vessel ORCA-FV-1024</h4>
                <span className="text-xs text-gray-500">2m ago</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Departed for PFZ Zone B. Cleared safety check.</p>
            </div>

            <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-amber-900 text-sm">Unknown Vessel</h4>
                <span className="text-xs text-amber-700">12m ago</span>
              </div>
              <p className="text-xs text-amber-800 mt-1">Detected near maritime boundary (Sector 4). No AIS signal.</p>
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
