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
      const revealDist = drop.revealDistance || 20;
      // Choose icon by type
      let icon = '❓';
      if (drop.type === 'text') icon = '📝';
      else if (drop.type === 'image') icon = '🖼️';
      else if (drop.type === 'pdf') icon = '📄';
      // Teaser text
      const teaser = drop.teaser ? `<span style='font-size:15px;font-weight:600;'>${icon} ${drop.teaser}</span>` : `<span style='font-size:15px;font-weight:600;'>${icon} A mysterious drop awaits!</span>`;
      let popup = `${teaser}<br/><span style='color:#666;font-size:13px;'>Drop type: ${drop.type.toUpperCase()}</span><br/>`;
      popup += `<br/>Distance: ${dist < 1000 ? dist.toFixed(1)+'m' : (dist/1000).toFixed(2)+'km'}`;
      if (dist <= revealDist) {
        // Show collect button if within reveal distance
        popup += `<br/><button id='collect-${drop.id}'>Collect</button>`;
      } else {
        popup += `<br/><span style='color:#888;font-size:12px;'>Get closer to collect (within ${revealDist < 1000 ? revealDist + 'm' : (revealDist/1000).toFixed(2) + 'km'})</span>`;
      }
      dMarker.bindPopup(popup);
      dMarker.on('popupopen', () => {
        if (dist <= revealDist) {
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
      <div ref={mapRef} className="zumap-leaflet-map" style={{ height: 'calc(100dvh - 40px)', maxHeight: 'calc(100vh - 40px)' }}></div>
      {/* Buttons, bottom center on mobile, top left on desktop */}
      <div className="zumap-map-buttons" style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
        <button style={{ pointerEvents: 'auto', margin: '0 8px' }} onClick={onDropTreasure}>Drop Treasure</button>
        <button style={{ pointerEvents: 'auto', margin: '0 8px' }} onClick={() => {
          if (leafletMapRef.current && userLocation) {
            leafletMapRef.current.setView([userLocation.lat, userLocation.lng], leafletMapRef.current.getZoom(), { animate: true });
          }
        }}>Center</button>
      </div>
    </div>
  );
}

export default MapView;
