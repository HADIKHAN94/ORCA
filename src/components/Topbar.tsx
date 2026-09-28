import React, { useState } from 'react';
import { Bell, Globe, User, Navigation, ShieldAlert } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { LocationPicker } from './LocationPicker';
import { useAlerts } from '../hooks/useAlerts';

export const Topbar: React.FC = () => {
  const { role, location, setLocation } = useRole();
  const { data: alertsData } = useAlerts(location.lat, location.lon);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sosStatus, setSosStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  const criticalCount = alertsData?.alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING'
  ).length ?? 0;

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ name: 'My GPS Location', lat: latitude, lon: longitude, state: 'GPS' });
        setIsDetecting(false);
      },
      () => setIsDetecting(false),
      { timeout: 8000 }
    );
  };

  const triggerSOS = async () => {
    if (confirm("EMERGENCY: Are you sure you want to broadcast an SOS?")) {
      setSosStatus('SENDING');
      try {
        const res = await fetch('http://127.0.0.1:8000/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: location.lat, lon: location.lon, user_id: 1 })
        });
        const data = await res.json();
        alert(`SOS Triggered!\n\n${data.message}`);
        setSosStatus('SENT');
        setTimeout(() => setSosStatus('IDLE'), 10000);
      } catch {
        alert("Failed to connect to SOS server. Use VHF Channel 16 immediately!");
        setSosStatus('IDLE');
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <LocationPicker
          location={location}
          onSelect={setLocation}
          onDetectGPS={detectGPS}
          isDetecting={isDetecting}
        />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          <span>{location.lat.toFixed(2)}°N</span>
          <span>{location.lon.toFixed(2)}°E</span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button 
          onClick={triggerSOS}
          disabled={sosStatus === 'SENDING'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${sosStatus === 'IDLE' ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' : sosStatus === 'SENDING' ? 'bg-red-500 text-white animate-pulse' : 'bg-green-100 text-green-700 border-green-200'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          {sosStatus === 'IDLE' ? 'EMERGENCY SOS' : sosStatus === 'SENDING' ? 'BROADCASTING...' : 'HELP DISPATCHED'}
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-marine-600 transition-colors">
          <Globe className="w-4 h-4" />
          <span>English</span>
        </div>
        
        <button className="relative text-gray-500 hover:text-marine-600 transition-colors">
          <Bell className="w-5 h-5" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </button>

        <div className="flex items-center space-x-3 pl-5 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-marine-100 flex items-center justify-center text-marine-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm hidden sm:block">
            <p className="font-medium text-gray-900">Captain Arjun</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
