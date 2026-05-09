import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface NativeLeafletMapProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const NativeLeafletMap: React.FC<NativeLeafletMapProps> = ({ center, zoom, markerPosition, onMapClick, interactive = true }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      if (interactive && onMapClick) {
        mapInstanceRef.current.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Mount only

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Update marker
    if (markerPosition) {
      if (!markerRef.current) {
        markerRef.current = L.marker(markerPosition, { icon: DefaultIcon }).addTo(mapInstanceRef.current);
      } else {
        markerRef.current.setLatLng(markerPosition);
      }
      mapInstanceRef.current.setView(markerPosition, zoom);
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [markerPosition, zoom]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default NativeLeafletMap;
