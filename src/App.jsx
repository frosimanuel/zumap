import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DropForm from './components/DropForm';
import ARView from './components/ARView';
import VPNGate from './components/VPNGate';
import { getAllDrops, addDrop } from './utils/data';

function App() {
  const [drops, setDrops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showDropForm, setShowDropForm] = useState(false);
  const [arDrop, setArDrop] = useState(null);
  const [vpnStatus, setVpnStatus] = useState('unknown'); // 'ok' | 'dummy' | 'unknown'

  useEffect(() => {
    setDrops(getAllDrops());
    let watcher;
    if (navigator.geolocation) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
    return () => {
      if (watcher && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, []);

  const handleAddDrop = (drop) => {
    addDrop(drop);
    setDrops(getAllDrops());
    setShowDropForm(false);
  };

  return (
    <div>
      <VPNGate setVpnStatus={setVpnStatus} />
      <MapView
        drops={drops}
        userLocation={userLocation}
        onDropTreasure={() => setShowDropForm(true)}
        onCollectDrop={setArDrop}
        vpnStatus={vpnStatus}
      />
      {showDropForm && (
        <DropForm
          userLocation={userLocation}
          onSubmit={handleAddDrop}
          onClose={() => setShowDropForm(false)}
        />
      )}
      {arDrop && (
        <ARView
          drop={arDrop}
          onClose={() => setArDrop(null)}
        />
      )}
    </div>
  );
}

export default App;
