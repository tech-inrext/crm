// LeafletMap.tsx
"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface LeafletMapProps {
  location: {
    lat: number;
    lng: number;
  };
  propertyName?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ location, propertyName = "Property Location" }) => {
  // Default to India if coordinates are not set
  const mapCenter: [number, number] = location.lat !== 0 && location.lng !== 0 
    ? [location.lat, location.lng] 
    : [20.5937, 78.9629]; // Default to India center

  const isValidLocation = location.lat !== 0 && location.lng !== 0;

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={isValidLocation ? 15 : 5}
        style={{ height: '200px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {isValidLocation && (
          <>
            <Marker position={mapCenter}>
              <Popup>
                <strong>{propertyName}</strong>
                <br />
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Popup>
            </Marker>
            <MapUpdater center={mapCenter} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;