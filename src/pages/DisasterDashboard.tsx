// src/pages/DisasterDashboard.tsx — Disaster Manager role — real alerts + safety
import React from 'react';
import { MarineMap } from '../components/MarineMap';
import { AlertTriangle, Waves, Wind, RefreshCw, Shield, MapPin, Clock } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAlerts } from '../hooks/useAlerts';
import { useOceanData } from '../hooks/useOceanData';
import { useSafety } from '../hooks/useSafety';

function Skeleton({ w = "w-16", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />;
}

const SEV_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200',    dot: 'bg-red-500'    },
  WARNING:  { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  ADVISORY: { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  INFO:     { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
};

export const DisasterDashboard: React.FC = () => {
  const { location } = useRole();
  const { data: alertsData, loading: alertLoading, refetch } = useAlerts(location.lat, location.lon);
  const { data: ocean, loading: oceanLoading } = useOceanData(location.lat, location.lon);
  const { data: safety } = useSafety(location.lat, location.lon);

  const alerts = alertsData?.alerts ?? [];
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warnings = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <div className="h-full flex flex-col space-y-5 overflow-y-auto pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-marine-900">Regional Hazard Intelligence</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Real-time alerts for <span className="font-semibold text-marine-700">{location.name}</span>
            <span className="ml-2 text-xs text-gray-400">Updated: {alertsData ? new Date(alertsData.last_updated).toLocaleTimeString('en-IN') : '—'}</span>
          </p>
        </div>
        <button onClick={refetch} className="flex items-center gap-1.5 text-xs text-marine-600 hover:text-marine-800 border border-marine-200 rounded-lg px-3 py-1.5 hover:bg-marine-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { title: 'Critical Alerts', value: alertLoading ? '—' : String(critical), color: critical > 0 ? 'text-risk-high' : 'text-risk-low', icon: AlertTriangle },
          { title: 'Warnings', value: alertLoading ? '—' : String(warnings), color: warnings > 0 ? 'text-risk-moderate' : 'text-risk-low', icon: AlertTriangle },
          { title: 'Safety Score', value: safety ? `${safety.score}/100` : '—', color: safety?.label === 'SAFE' ? 'text-risk-low' : 'text-risk-moderate', icon: Shield },
          { title: 'Wave Height', value: ocean ? `${ocean.wave_height}m` : '—', color: 'text-blue-600', icon: Waves },
          { title: 'Wind Speed', value: ocean ? `${ocean.wind_speed} km/h` : '—', color: 'text-indigo-600', icon: Wind },
          { title: 'IMBL Dist.', value: safety ? `${safety.distance_to_imbl_km}km` : '—', color: 'text-marine-600', icon: MapPin },
        ].map(({ title, value, color, icon: Icon }) => (
          <div key={title} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <p className="text-[10px] text-gray-500 font-medium">{title}</p>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-[380px]">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm lg:col-span-2">
          <MarineMap showRoute={false} />
        </div>

        {/* Live Alerts Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-marine-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Live Alerts Feed
            </h3>
            <span className="text-xs font-mono text-gray-400">{alerts.length} active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {alertLoading ? (
              [1,2,3].map(i => <Skeleton key={i} w="w-full" h="h-20" />)
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Shield className="w-8 h-8 mb-2 text-green-400" />
                <p className="text-sm font-medium text-green-600">All Clear</p>
                <p className="text-xs">No active alerts for this region</p>
              </div>
            ) : alerts.map((alert) => {
              const cfg = SEV_CONFIG[alert.severity] ?? SEV_CONFIG.INFO;
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.text}`}>{alert.severity}</span>
                        <span className="text-[10px] text-gray-400">· {alert.category}</span>
                      </div>
                      <p className={`text-xs font-semibold ${cfg.text} leading-tight`}>{alert.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {alert.region}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {alert.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-right">
        Alerts: Open-Meteo Marine + ORCA Safety Engine · Auto-refreshes every 5 min
      </p>
    </div>
  );
};
