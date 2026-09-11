import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarineMap } from '../components/MarineMap';

const data = [
  { name: 'May 1', sst: 27.8, chlorophyll: 1.2 },
  { name: 'May 5', sst: 28.0, chlorophyll: 1.4 },
  { name: 'May 10', sst: 28.2, chlorophyll: 1.5 },
  { name: 'May 15', sst: 28.5, chlorophyll: 1.1 },
  { name: 'May 20', sst: 28.8, chlorophyll: 0.8 },
  { name: 'May 25', sst: 29.1, chlorophyll: 0.6 },
  { name: 'Jun 2', sst: 29.4, chlorophyll: 0.5 },
];

export const ResearcherDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-marine-900">Ocean Analytics Workspace</h2>
        <p className="text-gray-600 mt-1">Explore ocean data, analyze trends and generate scientific insights.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">SST Anomaly (30d)</p>
          <p className="text-xl font-bold text-red-500">+1.2°C</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Avg Chlorophyll (mg/m³)</p>
          <p className="text-xl font-bold text-marine-700">1.48</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Ocean Front Activity</p>
          <p className="text-xl font-bold text-risk-moderate">High</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Data Freshness</p>
          <p className="text-xl font-bold text-gray-800">2h ago</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Region Analyzed</p>
          <p className="text-lg font-bold text-marine-700 truncate">Bay of Bengal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-marine-900 mb-4">SST vs Chlorophyll Trend (30 Days)</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#EF4444' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#10B981' }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="sst" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="SST (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="chlorophyll" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Chlorophyll" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-marine-50 rounded-lg border border-marine-100">
            <p className="text-sm text-marine-900 font-medium">ORCA Analysis:</p>
            <p className="text-sm text-marine-700 mt-1">Reduced chlorophyll coincides with warming SST. Productivity decline in this region is likely driven by the +1.2°C anomaly pushing the thermal front 14km offshore.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
          <MarineMap showRoute={false} />
        </div>

      </div>
    </div>
  );
};
