import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistanceMeters } from '../utils/geo';
import MapMenu from './MapMenu';

function MapView({ drops, userLocation, onDropTreasure, onCollectDrop, vpnStatus }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  // Persist zoom/center in state
  const [mapView, setMapView] = useState(() => {
    const storedMapView = localStorage.getItem('mapView');
    if (storedMapView) {
      return JSON.parse(storedMapView);
    } else {
      return {
        center: userLocation ? [userLocation.lat, userLocation.lng] : [0, 0],
        zoom: 16
      };
    }
  });

  // Initialize map as soon as userLocation is available
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 16,
        tap: false // Fixes mobile double-tap bugs
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);
      // Listen for move/zoom events to persist state
      leafletMapRef.current.on('moveend zoomend', () => {
        const center = leafletMapRef.current.getCenter();
        const zoom = leafletMapRef.current.getZoom();
        setMapView({ center: [center.lat, center.lng], zoom });
        localStorage.setItem('mapView', JSON.stringify({ center: [center.lat, center.lng], zoom }));
      });
    } else {
      // If map already exists and userLocation changes, pan to new location
      leafletMapRef.current.panTo([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Update markers when drops/userLocation change, but DO NOT reset map view
  useEffect(() => {
    if (!leafletMapRef.current || !userLocation) return;
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
    // Group drops by coordinates
    const coordMap = {};
    drops.forEach(drop => {
      const key = `${drop.lat},${drop.lng}`;
      if (!coordMap[key]) coordMap[key] = [];
      coordMap[key].push(drop);
    });

    Object.entries(coordMap).forEach(([coord, dropsAtCoord]) => {
      const [lat, lng] = coord.split(',').map(Number);
      if (dropsAtCoord.length === 1) {
        // Single drop: show as emoji marker
        const drop = dropsAtCoord[0];
        let icon = '❓';
        if (drop.type === 'text') icon = '📝';
        else if (drop.type === 'image') icon = '🖼️';
        else if (drop.type === 'pdf') icon = '📄';
        const emojiIcon = L.divIcon({
          className: 'emoji-marker',
          html: `<div style="font-size: 2rem;">${icon}</div>`
        });
        const dMarker = L.marker([lat, lng], { icon: emojiIcon }).addTo(leafletMapRef.current);
        const dist = getDistanceMeters(userLocation.lat, userLocation.lng, lat, lng);
        const revealDist = drop.revealDistance || 20;
        const teaser = drop.teaser ? `<span style='font-size:15px;font-weight:600;'>${icon} ${drop.teaser}</span>` : `<span style='font-size:15px;font-weight:600;'>${icon} A mysterious drop awaits!</span>`;
        let popup = `${teaser}<br/><span style='color:#666;font-size:13px;'>Drop type: ${drop.type.toUpperCase()}</span><br/>`;
        popup += `<br/>Distance: ${dist < 1000 ? dist.toFixed(1)+'m' : (dist/1000).toFixed(2)+'km'}`;
        if (dist <= revealDist) {
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
      } else {
        // Cluster: show special marker with count
        const clusterIcon = L.divIcon({
          className: 'emoji-marker',
          html: `<div style="font-size: 2rem; position: relative;"><span>🔢</span><span style='position:absolute;top:0;right:-10px;font-size:1rem;background:#fff3;border-radius:8px;padding:0 4px;font-weight:700;'>${dropsAtCoord.length}</span></div>`
        });
        const dMarker = L.marker([lat, lng], { icon: clusterIcon }).addTo(leafletMapRef.current);
        // Cluster popup: list all drops at this point
        // Landscape scrollable cluster popup with reachability
        let popup = `<b>${dropsAtCoord.length} drops at this point:</b><br/><div style='display:flex;overflow-x:auto;gap:8px;padding:8px 0 2px 0;max-width:320px;'>`;
        dropsAtCoord.forEach(drop => {
          let icon = '❓';
          if (drop.type === 'text') icon = '📝';
          else if (drop.type === 'image') icon = '🖼️';
          else if (drop.type === 'pdf') icon = '📄';
          const dist = getDistanceMeters(userLocation.lat, userLocation.lng, drop.lat, drop.lng);
          const revealDist = drop.revealDistance || 20;
          const inReach = dist <= revealDist;
          popup += `<div id='cluster-drop-${drop.id}' style='flex:0 0 auto;min-width:110px;max-width:140px;background:${inReach ? '#f7faff' : '#f3f3f3'};border-radius:10px;padding:8px 6px 8px 6px;margin-bottom:2px;box-shadow:0 2px 8px #0001;cursor:${inReach ? 'pointer' : 'not-allowed'};opacity:${inReach ? 1 : 0.5};border:1.5px solid ${inReach ? '#a5d8ff' : '#eee'};text-align:center;'>
            <div style='font-size:1.5rem;'>${icon}</div>
            <div style='font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>${drop.teaser ? drop.teaser : 'Untitled'}</div>
            <div style='font-size:12px;color:#888;'>${dist < 1000 ? dist.toFixed(1)+'m' : (dist/1000).toFixed(2)+'km'}</div>
            ${inReach ? `<div style='margin-top:4px;color:#22c55e;font-weight:600;'>Collect</div>` : `<div style='margin-top:4px;color:#aaa;'>Out of reach</div>`}
          </div>`;
        });
        popup += `</div>`;
        dMarker.bindPopup(popup);
        dMarker.on('popupopen', () => {
          dropsAtCoord.forEach(drop => {
            const el = document.getElementById(`cluster-drop-${drop.id}`);
            if (el) {
              // Only clickable if in reach
              const dist = getDistanceMeters(userLocation.lat, userLocation.lng, drop.lat, drop.lng);
              const revealDist = drop.revealDistance || 20;
              const inReach = dist <= revealDist;
              if (inReach) {
                el.onclick = () => onCollectDrop(drop);
                el.onmouseover = () => { el.style.background = '#e3f2fd'; };
                el.onmouseout = () => { el.style.background = ''; };
              } else {
                el.onclick = null;
                el.style.pointerEvents = 'none';
              }
            }
          });
        });
        markersRef.current.push(dMarker);
      }
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

    </div>
  );
}

export default MapView;
