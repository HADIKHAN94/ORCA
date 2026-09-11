import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Demo Data
const vesselPosition: [number, number] = [17.682, 83.312]; // Vizag coast approximation
const pfzZoneB: [number, number][] = [
  [17.85, 83.5],
  [17.9, 83.55],
  [17.88, 83.62],
  [17.82, 83.58],
  [17.85, 83.5]
];
const restrictedArea: [number, number][] = [
  [17.75, 83.6],
  [17.8, 83.65],
  [17.72, 83.7],
  [17.68, 83.65],
  [17.75, 83.6]
];
const routeOptions = {
  optimal: [
    vesselPosition,
    [17.75, 83.45],
    [17.8, 83.48],
    [17.86, 83.56] // Center of Zone B
  ] as [number, number][],
  hazardous: [
    vesselPosition,
    [17.72, 83.62], // Passes close/through restricted area
    [17.86, 83.56]
  ] as [number, number][]
};

export const MarineMap: React.FC<{
  showRoute?: boolean;
}> = ({ showRoute = true }) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer 
        center={vesselPosition} 
        zoom={10} 
        style={{ height: '100%', width: '100%', background: '#0A192F' }}
        zoomControl={false}
      >
        {/* Dark theme map tiles (CartoDB Dark Matter or similar, using standard OSM for now with CSS filter if needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* PFZ Zone B */}
        <Polygon 
          positions={pfzZoneB} 
          pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }}
        >
          <Popup>
            <div className="text-center">
              <strong>PFZ Zone B</strong><br/>
              High Potential
            </div>
          </Popup>
        </Polygon>

        {/* Restricted Area */}
        <Polygon 
          positions={restrictedArea} 
          pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }}
        >
          <Popup>
            <div className="text-center text-red-600">
              <strong>Restricted Area</strong><br/>
              Do Not Enter
            </div>
          </Popup>
        </Polygon>

        {/* Routes */}
        {showRoute && (
          <>
            <Polyline 
              positions={routeOptions.optimal} 
              pathOptions={{ color: '#3B82F6', weight: 3, dashArray: '8, 8' }} 
            />
            <Polyline 
              positions={routeOptions.hazardous} 
              pathOptions={{ color: '#6B7280', weight: 2, dashArray: '4, 4' }} 
            />
          </>
        )}

        {/* Vessel Marker */}
        <Marker position={vesselPosition}>
          <Popup>
            <strong>Vessel Alpha</strong><br/>
            Speed: 19 km/h<br/>
            Heading: NE 42°
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <CircleMarker 
          center={[17.86, 83.56]} 
          radius={6} 
          pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 1 }} 
        />

      </MapContainer>
    </div>
  );
};
