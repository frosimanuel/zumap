import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Real Leaflet map view
import { getDistanceMeters } from '../utils/geo';

function MapView({ drops, userLocation, onDropTreasure, onCollectDrop, vpnStatus }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);
    } else {
      leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 16);
    }
    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    // User marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    }).addTo(leafletMapRef.current).bindPopup('You are here');
    markersRef.current.push(userMarker);
    // Drop markers
    drops.forEach(drop => {
      const dMarker = L.marker([drop.lat, drop.lng]).addTo(leafletMapRef.current);
      const dist = getDistanceMeters(userLocation.lat, userLocation.lng, drop.lat, drop.lng);
      let popup = `<b>Drop: ${drop.type.toUpperCase()}</b><br/>`;
      popup += `<br/>Distance: ${dist < 1000 ? dist.toFixed(1)+'m' : (dist/1000).toFixed(2)+'km'}`;
      if (dist <= 20) {
        // Show collect button if within 20m
        popup += `<br/><button id='collect-${drop.id}'>Collect</button>`;
      } else {
        popup += `<br/><span style='color:#888;font-size:12px;'>Get closer to collect</span>`;
      }
      dMarker.bindPopup(popup);
      dMarker.on('popupopen', () => {
        if (dist <= 20) {
          setTimeout(() => {
            const btn = document.getElementById(`collect-${drop.id}`);
            if (btn) btn.onclick = () => onCollectDrop(drop);
          }, 100);
        }
      });
      markersRef.current.push(dMarker);
    });
    // Cleanup on unmount
    return () => {
      if (leafletMapRef.current) leafletMapRef.current.remove();
      leafletMapRef.current = null;
      markersRef.current = [];
    };
  }, [drops, userLocation, onCollectDrop]);

  return (
    <div className="zumap-map-container">
      {/* Info panel, top right */}
      <div className="zumap-map-info">
        {vpnStatus === 'dummy' ? 'Showing dummy drops (not on VPN)' : 'Showing real drops'}<br/>
        {drops.length} drops loaded.
      </div>
      {/* Map */}
      <div ref={mapRef} className="zumap-leaflet-map"></div>
      {/* Buttons, bottom center on mobile, top left on desktop */}
      <div className="zumap-map-buttons">
        <button onClick={onDropTreasure}>Drop Treasure</button>
        <button onClick={() => {
          if (leafletMapRef.current && userLocation) {
            leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
          }
        }}>Center</button>
      </div>
    </div>
  );
}

export default MapView;
