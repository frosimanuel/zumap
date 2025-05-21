import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DropForm from './components/DropForm';
import ARView from './components/ARView';
import VPNGate from './components/VPNGate';
import { listenToDrops, addDrop } from './utils/data';

function App() {
  const [drops, setDrops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showDropForm, setShowDropForm] = useState(false);
  const [arDrop, setArDrop] = useState(null);
  const [vpnStatus, setVpnStatus] = useState('unknown'); // 'ok' | 'dummy' | 'unknown'
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Listen for real-time drop updates
    const unsubscribe = listenToDrops((allDrops) => {
      setDrops(allDrops);
      setLoading(false);
    });
    let watcher;
    if (navigator.geolocation) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        },
        (err) => {
          setUserLocation(null);
          setLocationError('Location permission denied or unavailable. Please allow location access in your browser settings.');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
    return () => {
      if (unsubscribe) unsubscribe();
      if (watcher && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, []);

  // Accepts (drop, file)
  const handleAddDrop = async (drop, file) => {
    await addDrop(drop, file);
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
          onSubmit={handleAddDrop} // expects (drop, file)
          onClose={() => setShowDropForm(false)}
        />
      )}
      {arDrop && (
        <ARView
          drop={arDrop}
          onClose={() => setArDrop(null)}
        />
      )}
      {loading && <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#fff8',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>Loading drops...</div>}
      {locationError && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', background: '#ffefef', color: '#900', zIndex: 3000, padding: 16, textAlign: 'center', fontWeight: 500
        }}>
          {locationError}
        </div>
      )}
    </div>
  );
}

export default App;
