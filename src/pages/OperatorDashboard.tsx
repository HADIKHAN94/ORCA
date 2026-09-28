// src/pages/OperatorDashboard.tsx — Maritime Operator — live ocean + safety
import React, { useState } from 'react';
import { MarineMap } from '../components/MarineMap';
import { Ship, Waves, Wind, Thermometer, Navigation, RefreshCw, Shield, MapPin } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useOceanData } from '../hooks/useOceanData';
import { useSafety } from '../hooks/useSafety';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Skeleton({ w = "w-16", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />;
}

export const OperatorDashboard: React.FC = () => {
  const { location } = useRole();
  const [vessel, setVessel] = useState("large");
  const { data: ocean, loading: oceanLoading, refetch } = useOceanData(location.lat, location.lon);
  const { data: safety, loading: safetyLoading, refetch: refetchSafety } = useSafety(location.lat, location.lon, vessel);

  const safetyColor = safety?.label === 'SAFE' ? 'text-risk-low' : safety?.label === 'MODERATE' ? 'text-risk-moderate' : 'text-risk-high';

  const refetchAll = () => { refetch(); refetchSafety(); };

  const forecast = ocean?.forecast_24h?.slice(0, 12) ?? [];
  const chartData = forecast.map(f => ({ time: f.hour, wave: f.wave_height, wind: f.wind_speed }));

  return (
    <div className="h-full flex flex-col space-y-5 overflow-y-auto pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-marine-900">Operations Intelligence</h2>
          <p className="text-gray-600 mt-1 text-sm">Route planning and vessel safety for <span className="font-semibold text-marine-700">{location.name}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <select value={vessel} onChange={e => setVessel(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
            <option value="small">Small Boat</option>
            <option value="country">Country Boat</option>
            <option value="mechanized">Mechanized Trawler</option>
            <option value="large">Large Vessel</option>
          </select>
          <button onClick={refetchAll} className="flex items-center gap-1.5 text-xs text-marine-600 border border-marine-200 rounded-lg px-2 py-1.5 hover:bg-marine-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Safety bar */}
      {safety && (
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${safety.label === 'SAFE' ? 'bg-green-50 border-green-200' : safety.label === 'MODERATE' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-3xl font-black ${safetyColor}`}>{safety.score}</div>
          <div className="flex-1">
            <p className={`font-bold ${safetyColor}`}>{safety.label} — {safety.vessel_type}</p>
            <p className="text-xs text-gray-600">{safety.recommendation}</p>
          </div>
          <div className="text-xs text-right space-y-0.5">
            <p className="text-gray-500">IMBL: <span className="font-bold text-gray-800">{safety.distance_to_imbl_km} km</span></p>
            <p className="text-gray-500">Port: <span className="font-bold text-gray-800">{safety.nearest_port}</span></p>
            <p className="text-gray-500">Distance: <span className="font-bold text-gray-800">{safety.nearest_port_distance_km} km</span></p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'SST', value: ocean?.sst, unit: '°C', icon: Thermometer, color: 'text-orange-500' },
          { label: 'Wave Ht', value: ocean?.wave_height, unit: 'm', icon: Waves, color: 'text-blue-600' },
          { label: 'Wind', value: ocean?.wind_speed, unit: 'km/h', icon: Wind, color: 'text-indigo-600' },
          { label: 'Wind Dir', value: ocean?.wind_direction_label, unit: '', icon: Navigation, color: 'text-marine-600' },
          { label: 'Current', value: ocean?.current_velocity, unit: 'm/s', icon: Ship, color: 'text-teal-600' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <p className="text-[10px] text-gray-500 font-medium">{label}</p>
            </div>
            {oceanLoading ? <Skeleton /> : <p className={`text-xl font-bold ${color}`}>{value ?? '—'}<span className="text-sm text-gray-400 ml-1">{unit}</span></p>}
          </div>
        ))}
      </div>

      {/* Map + 12h Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-[380px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          <MarineMap showRoute={true} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-marine-900 text-sm">12-Hour Forecast</h3>
          {oceanLoading ? <Skeleton w="w-full" h="h-40" /> : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0369a1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0369a1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} width={25} />
                <Tooltip formatter={(v: number, n: string) => [`${v} ${n === 'wave' ? 'm' : 'km/h'}`, n === 'wave' ? 'Wave Ht' : 'Wind']} />
                <Area type="monotone" dataKey="wave" stroke="#0369a1" fill="url(#waveGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400">No forecast data</p>}

          {/* Safety forecast */}
          {safety?.forecast_24h && safety.forecast_24h.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2">Safety Score — Next 12h</h4>
              <div className="grid grid-cols-6 gap-1">
                {safety.forecast_24h.slice(0, 12).map((f, i) => {
                  const c = f.score >= 70 ? 'bg-green-500' : f.score >= 40 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-sm" style={{ height: `${Math.max(4, f.score * 0.4)}px`, backgroundColor: f.score >= 70 ? '#22c55e' : f.score >= 40 ? '#f59e0b' : '#ef4444' }} />
                      <span className="text-[8px] text-gray-400">{f.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ocean && (
            <div className="pt-3 border-t border-gray-100 space-y-1.5">
              <h4 className="text-xs font-bold text-gray-600">Conditions</h4>
              {[
                { k: 'Visibility', v: ocean.visibility },
                { k: 'Swell', v: `${ocean.swell_height}m` },
                { k: 'Wave Period', v: `${ocean.wave_period}s` },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-right">
        Source: Open-Meteo Marine + ORCA Safety Engine · {ocean?.timestamp ? new Date(ocean.timestamp).toLocaleTimeString('en-IN') : ''}
      </p>
    </div>
  );
};
