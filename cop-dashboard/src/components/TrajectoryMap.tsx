import React, { useEffect, useRef } from 'react';
import { Sighting } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-shadow.png',
});

interface TrajectoryMapProps {
  sightings: Sighting[];
  plateNumber: string;
  onClose: () => void;
}

export default function TrajectoryMap({ sightings, plateNumber, onClose }: TrajectoryMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate bounds for all sightings
  const bounds = sightings.length > 0
    ? [[Math.min(...sightings.map(s => s.latitude)), Math.min(...sightings.map(s => s.longitude))],
       [Math.max(...sightings.map(s => s.latitude)), Math.max(...sightings.map(s => s.longitude))]]
    : [[0, 0], [0, 0]];

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Vehicle Trajectory - {plateNumber}</h3>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
      <MapContainer
        ref={mapRef}
        center={(bounds[0][0] + bounds[1][0]) / 2 === 0 ? [28.6139, 77.2090] : [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]}
        zoom={12}
        className="map"
        bounds={sightings.length > 0 ? bounds : undefined}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sightings.map((sighting, index) => (
          <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]}>
            <Popup>
              <div className="popup-content">
                <strong>Sighting #{index + 1}</strong>
                <p>Time: {formatTime(sighting.capturedAt)}</p>
                <p>Confidence: {(sighting.confidence * 100).toFixed(1)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {sightings.length > 1 && (
          <Polyline
            positions={sightings.map(s => [s.latitude, s.longitude])}
            color="#ef4444"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }} />
          <span>Vehicle path</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker" style={{ backgroundColor: '#3b82f6' }} />
          <span>Sighting point</span>
        </div>
      </div>
    </div>
  );
}
