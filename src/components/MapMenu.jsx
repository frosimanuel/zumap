import React, { useState, useRef, useEffect } from 'react';
import { Menu, Crosshair, MapPin } from 'lucide-react';

// Add CSS for animation and polish
const dropdownStyles = `
.zumap-mapmenu-dropdown {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  pointer-events: none;
  transition: opacity 0.18s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1);
}
.zumap-mapmenu-dropdown.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.zumap-mapmenu-dropdown button:hover, .zumap-mapmenu-dropdown button:focus {
  background: #f1f5fb;
}
`;
if (typeof document !== 'undefined' && !document.getElementById('zumap-mapmenu-style')) {
  const style = document.createElement('style');
  style.id = 'zumap-mapmenu-style';
  style.innerHTML = dropdownStyles;
  document.head.appendChild(style);
}

export default function MapMenu({ onDropTreasure, onCenter }) {
  console.log('[MapMenu] Component mounted');
  const [open, setOpen] = useState(false);
  const [vpnConnected, setVpnConnected] = useState(null); // null = checking, true = connected, false = not
  const menuRef = useRef(null);

  // Check VPN status on mount
  useEffect(() => {
    let cancelled = false;
    async function checkVPN() {
      console.log('[VPN CHECK] Starting VPN check...');
      try {
        const res = await fetch('https://zulink-mini-apps.tail364380.ts.net:5000/zuitzerland', { method: 'GET', mode: 'cors' });
        console.log('[VPN CHECK] Fetch response:', res);
        if (!cancelled) {
          setVpnConnected(res.ok);
          console.log('[VPN CHECK] Set vpnConnected:', res.ok);
        }
      } catch (err) {
        console.error('[VPN CHECK] Error during fetch:', err);
        if (!cancelled) {
          setVpnConnected(false);
          console.log('[VPN CHECK] Set vpnConnected: false');
        }
      }
    }
    checkVPN();
    return () => { cancelled = true; };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: 56,
        right: 16,
        zIndex: 1000,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <button
        aria-label="Show map actions"
        className="zumap-mapmenu-btn"
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 8,
          width: 38,
          height: 38,
          boxShadow: '0 1px 4px #0001',
          cursor: 'pointer',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
        onClick={() => setOpen(o => !o)}
      >
        <Menu size={22} />
      </button>
      <div className={`zumap-mapmenu-dropdown${open ? ' open' : ''}`}
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 10,
          minWidth: 120,
          boxShadow: '0 2px 8px #0002',
          marginTop: 2,
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'absolute',
          right: 0,
          top: 42,
          zIndex: 1001
        }}
        tabIndex={-1}
        aria-hidden={!open}
      >
        <div style={{
          padding: '6px 16px',
          fontSize: '0.98rem',
          color: vpnConnected === null ? '#888' : vpnConnected ? '#1a9c41' : '#c00',
          fontWeight: 500,
          borderBottom: '1px solid #eee',
          marginBottom: 6
        }}>
          {vpnConnected === null ? 'Checking VPN...' : vpnConnected ? 'VPN Connected' : 'VPN Disconnected'}
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            textAlign: 'left',
            width: '100%',
            padding: '8px 16px',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            borderRadius: 6,
            outline: 'none',
            transition: 'background 0.13s',
          }}
          onClick={() => {
            setOpen(false);
            onCenter();
          }}
        >
          <Crosshair size={20} /> <span>Center</span>
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            textAlign: 'left',
            width: '100%',
            padding: '8px 16px',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            borderRadius: 6,
            outline: 'none',
            transition: 'background 0.13s',
          }}
          onClick={() => {
            setOpen(false);
            onDropTreasure();
          }}
        >
          <MapPin size={20} /> <span>Drop Pin</span>
        </button>
      </div>
    </div>
  );
}
