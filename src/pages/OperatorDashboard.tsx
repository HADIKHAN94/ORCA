import React from 'react';
import { MarineMap } from '../components/MarineMap';
import { Route } from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-marine-900">Route & Operations Optimization</h2>
        <p className="text-gray-600 mt-1">Plan routes, optimize operations and reduce risk & fuel consumption.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Active Missions" value="Mission 23" color="text-marine-700" />
        <KPICard title="ETA" value="2h 15m" color="text-marine-700" />
        <KPICard title="Distance to Dest" value="48.6 km" color="text-gray-900" />
        <KPICard title="Fuel Est." value="120 L" color="text-gray-900" />
        <KPICard title="Route Risk" value="Low" color="text-risk-low" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          <MarineMap showRoute={true} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-marine-900 mb-4 flex items-center gap-2">
            <Route className="w-5 h-5 text-marine-600" /> Route Comparison
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-lg opacity-60">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 text-sm">Route A (Shortest)</h4>
                <span className="text-sm font-bold">32.4 km</span>
              </div>
              <p className="text-xs text-gray-500 flex justify-between"><span>Risk:</span> <span className="text-risk-high font-semibold">High (Restricted Area)</span></p>
            </div>

            <div className="p-3 border-2 border-marine-500 bg-marine-50 rounded-lg relative">
              <div className="absolute -top-2.5 right-2 bg-marine-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ORCA Recommended</div>
              <div className="flex justify-between items-start mb-2 mt-1">
                <h4 className="font-bold text-marine-900 text-sm">Route B (Safer)</h4>
                <span className="text-sm font-bold text-marine-900">35.8 km</span>
              </div>
              <p className="text-xs text-marine-700 flex justify-between mb-1"><span>Risk:</span> <span className="text-risk-low font-semibold">Low</span></p>
              <p className="text-xs text-marine-700 flex justify-between"><span>ETA:</span> <span>1h 55m</span></p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700 font-medium mb-3">ORCA Reason: Safer conditions outweigh 3.4 km extra distance. Avoids restricted zone boundary.</p>
              <button className="w-full bg-marine-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-marine-700 transition-colors">
                Commit to Route B
              </button>
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
