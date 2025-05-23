import { useState, useRef, useEffect } from 'react';
import { Menu, Crosshair, ShieldCheck } from 'lucide-react';

const menuStyle = {
  position: 'fixed',
  top: 68,
  right: 18,
  zIndex: 100,
  userSelect: 'none'
};
const iconBtn = {
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 10,
  boxShadow: '0 2px 8px #0001',
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'box-shadow 0.18s',
};
const dropdown = {
  position: 'absolute',
  top: 54,
  right: 0,
  minWidth: 170,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 6px 32px #0002',
  padding: '8px 0',
  animation: 'fadeInUp 0.18s',
  border: '1px solid #ececec',
};
const item = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 20px',
  fontSize: 16,
  color: '#333',
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.14s',
};
const itemHover = {
  background: '#f3f6ff',
};

export default function DropdownMenu({ onCenter, vpnStatus }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={menuStyle} ref={ref}>
      <button style={iconBtn} aria-label="Menu" onClick={() => setOpen(v => !v)}>
        <Menu size={28} color="#6366f1" />
      </button>
      {open && (
        <div style={dropdown}>
          <button
            style={{ ...item }}
            onMouseOver={e => e.currentTarget.style.background = itemHover.background}
            onMouseOut={e => e.currentTarget.style.background = ''}
            onClick={() => { setOpen(false); onCenter && onCenter(); }}
          >
            <Crosshair size={20} color="#6366f1" /> Center Map
          </button>
          <div style={{ ...item, cursor: 'default', color: '#888' }}>
            <ShieldCheck size={20} color={vpnStatus === 'ok' ? '#22c55e' : '#f59e42'} />
            VPN: <span style={{fontWeight:600}}>{vpnStatus === 'ok' ? 'Connected' : vpnStatus === 'dummy' ? 'Dummy' : 'Unknown'}</span>
          </div>
        </div>
      )}
      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform: translateY(10px); }
          to { opacity:1; transform: none; }
        }
      `}</style>
    </div>
  );
}
