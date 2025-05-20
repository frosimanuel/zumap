import React from 'react';

// Placeholder for AR view
function ARView({ drop, onClose }) {
  return (
    <div style={{ background: '#222', color: '#fff', padding: 24, position: 'fixed', top: '10%', left: '10%', right: '10%', zIndex: 1000 }}>
      <h3>AR View (Demo)</h3>
      <div>Type: {drop.type}</div>
      <div>Location: {drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}</div>
      {drop.type === 'text' ? (
        <div style={{ margin: '1em 0', background: '#fff', color: '#222', padding: 8 }}>{drop.url}</div>
      ) : (
        <a href={drop.url} download target="_blank" rel="noopener noreferrer" style={{ color: '#0ff' }}>Download {drop.type.toUpperCase()}</a>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={onClose}>Close</button>
      </div>
      {/* TODO: Integrate AR.js/A-Frame overlay */}
    </div>
  );
}

export default ARView;
