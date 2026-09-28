import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 11, { animate: true });
    }
  }, [center, map]);
  return null;
}

export interface MapConfig {
  center?: [number, number];
  markers?: { lat: number; lon: number; label: string }[];
}

export const MarineMap: React.FC<{
  showRoute?: boolean;
  config?: MapConfig | null;
}> = ({ showRoute = true, config }) => {
  const defaultCenter: [number, number] = [17.682, 83.312]; // Vizag fallback
  
  // Demo static data for routes
  const pfzZoneB: [number, number][] = [[17.85, 83.5], [17.9, 83.55], [17.88, 83.62], [17.82, 83.58], [17.85, 83.5]];
  const restrictedArea: [number, number][] = [[17.75, 83.6], [17.8, 83.65], [17.72, 83.7], [17.68, 83.65], [17.75, 83.6]];
  const routeOptions = {
    optimal: [defaultCenter, [17.75, 83.45], [17.8, 83.48], [17.86, 83.56]] as [number, number][],
    hazardous: [defaultCenter, [17.72, 83.62], [17.86, 83.56]] as [number, number][]
  };

  const center = config?.center || defaultCenter;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer 
        center={center} 
        zoom={10} 
        style={{ height: '100%', width: '100%', background: '#0A192F' }}
        zoomControl={false}
      >
        <MapUpdater center={config?.center} />
        
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Dynamic Markers from AI Config */}
        {config?.markers?.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lon]}>
            <Popup><strong>{m.label}</strong></Popup>
          </Marker>
        ))}

        {/* Static demo data rendered only if AI didn't pass config or if showRoute is true */}
        {(!config || showRoute) && (
          <>
            <Polygon positions={pfzZoneB} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }}>
              <Popup><div className="text-center"><strong>PFZ Zone B</strong><br/>High Potential</div></Popup>
            </Polygon>
            <Polygon positions={restrictedArea} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }}>
              <Popup><div className="text-center text-red-600"><strong>Restricted Area</strong><br/>Do Not Enter</div></Popup>
            </Polygon>
            <Polyline positions={routeOptions.optimal} pathOptions={{ color: '#3B82F6', weight: 3, dashArray: '8, 8' }} />
            <Polyline positions={routeOptions.hazardous} pathOptions={{ color: '#6B7280', weight: 2, dashArray: '4, 4' }} />
            {!config?.markers?.length && (
               <Marker position={defaultCenter}>
                 <Popup><strong>Vessel Alpha</strong><br/>Speed: 19 km/h</Popup>
               </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};
