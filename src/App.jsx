import { useState, useEffect } from 'react';
import { Menu, MapPin, Crosshair, User } from 'lucide-react';
import MapView from './components/MapView';
import DropdownMenu from './components/DropdownMenu';
import DropForm from './components/DropForm';
import ARView from './components/ARView';
import VPNGate from './components/VPNGate';
import { listenToDrops, addDrop } from './utils/data';

const styles = {
  app: {
    fontFamily: 'system-ui, sans-serif',
    minHeight: '100vh',
    background: '#f7f7f9',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },

  mapArea: {
    width: '100%',
    height: 'calc(100vh - 56px)',
    background: 'linear-gradient(135deg,#e0e7ff 0%,#f7f7f9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    color: '#8a8a8a',
    fontSize: 22,
    fontWeight: 500,
    opacity: 0.5,
    textAlign: 'center',
    padding: 24,
  },
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1 60%,#60a5fa 100%)',
    boxShadow: '0 4px 18px #6366f133',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    zIndex: 20,
    transition: 'background 0.2s',
  },
  fabIcon: { width: 32, height: 32 },
};

function App() {
  const [drops, setDrops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showDropForm, setShowDropForm] = useState(false);
  const [arDrop, setArDrop] = useState(null);
  const [vpnStatus, setVpnStatus] = useState('unknown'); // 'ok' | 'dummy' | 'unknown'

  // VPN status check
  useEffect(() => {
    let cancelled = false;
    async function checkVPN() {
      console.log('[App] Starting VPN check...');
      try {
        const res = await fetch('https://zulink-mini-apps.tail364380.ts.net:5000/zuitzerland', { method: 'GET', mode: 'cors' });
        console.log('[App] VPN fetch response:', res);
        if (!cancelled) {
          setVpnStatus(res.ok ? 'ok' : 'unknown');
          console.log('[App] setVpnStatus:', res.ok ? 'ok' : 'unknown');
        }
      } catch (err) {
        console.error('[App] VPN fetch error:', err);
        if (!cancelled) {
          setVpnStatus('unknown');
          console.log('[App] setVpnStatus: unknown');
        }
      }
    }
    checkVPN();
    return () => { cancelled = true; };
  }, []);
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
    <div style={styles.app}>
      {/* Floating Dropdown Menu (top right) */}
      <DropdownMenu
        onCenter={() => {
          if (userLocation && window.__leafletMap) {
            window.__leafletMap.setView([userLocation.lat, userLocation.lng], window.__leafletMap.getZoom(), { animate: true });
          }
        }}
        vpnStatus={vpnStatus}
      />
      {/* Main Map Area */}
      <main style={styles.mapArea}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:1}}>
          <MapView
            drops={drops}
            userLocation={userLocation}
            onDropTreasure={() => setShowDropForm(true)}
            onCollectDrop={setArDrop}
            vpnStatus={vpnStatus}
          />
        </div>
        {/* Floating Action Button (FAB) */}
        <button style={styles.fab} aria-label="Drop Pin" onClick={() => setShowDropForm(true)}>
          <MapPin style={styles.fabIcon} />
        </button>
        {/* Drop Form Modal */}
        {showDropForm && (
          <DropForm
            userLocation={userLocation}
            onSubmit={handleAddDrop}
            onClose={() => setShowDropForm(false)}
          />
        )}
        {/* AR View Modal */}
        {arDrop && (
          <ARView
            drop={arDrop}
            onClose={() => setArDrop(null)}
          />
        )}
        {/* Loading Overlay */}
        {loading && <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#fff8',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>Loading drops...</div>}
        {/* Location Error Banner */}
        {locationError && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', background: '#ffefef', color: '#900', zIndex: 3000, padding: 16, textAlign: 'center', fontWeight: 500
          }}>
            {locationError}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;