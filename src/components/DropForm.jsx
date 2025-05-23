import React, { useState } from 'react';

function DropForm({ userLocation, onSubmit, onClose }) {
  const [type, setType] = useState('text');
  const [text, setText] = useState('');
  const [teaser, setTeaser] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  // Reveal distance state (meters)
  const [revealDistance, setRevealDistance] = useState(100); // default 100m

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && type === 'image') {
      setPreview(URL.createObjectURL(f));
    } else if (f && type === 'pdf') {
      setPreview('pdf');
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setError('Location unavailable.');
      return;
    }
    if (!teaser.trim()) {
      setError('Teaser required.');
      return;
    }
    if (type === 'text') {
      if (!text.trim()) {
        setError('Text required.');
        return;
      }
      setError('');
      await onSubmit({
        id: Date.now().toString(),
        lat: userLocation.lat,
        lng: userLocation.lng,
        type,
        url: text,
        teaser: teaser.trim(),
        timestamp: Date.now(),
        revealDistance
      }, null);
      setText('');
      setTeaser('');
    } else if (file) {
      setError('');
      await onSubmit({
        id: Date.now().toString(),
        lat: userLocation.lat,
        lng: userLocation.lng,
        type,
        url: '', // will be replaced after upload
        teaser: teaser.trim(),
        timestamp: Date.now(),
        revealDistance
      }, file);
      setFile(null);
      setPreview(null);
      setTeaser('');
    } else {
      setError('File required.');
      return;
    }
  };


  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 24, minWidth: 280, maxWidth: 340 }}>
        <h3 style={{ marginTop: 0 }}>Drop Treasure</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>Type:</span>
            <select value={type} onChange={e => { setType(e.target.value); setFile(null); setPreview(null); }} style={{ marginLeft: 8, fontSize: 16 }}>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="pdf">PDF</option>
            </select>
          </label>

          {/* Teaser input */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>Teaser (public hint):</span>
            <input
              type="text"
              value={teaser}
              onChange={e => setTeaser(e.target.value)}
              required
              maxLength={80}
              placeholder="What will lure people here?"
              style={{ width: '100%', marginTop: 4, marginBottom: 4, borderRadius: 6, border: '1px solid #ccc', padding: 7, fontSize: 16 }}
            />
          </label>

          {/* Reveal Distance Slider */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ fontWeight: 500 }}>Reveal Distance:</span>
            <input
              type="range"
              min={10}
              max={2000}
              step={10}
              value={revealDistance}
              onChange={e => setRevealDistance(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8 }}
            />
            <span style={{ marginLeft: 12, fontWeight: 500, fontSize: 15 }}>
              {revealDistance < 1000
                ? `${revealDistance} meters`
                : `${(revealDistance / 1000).toFixed(2)} km`}
            </span>
          </label>

          {type === 'text' ? (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              required
              placeholder="Enter your message..."
              style={{ width: '100%', minHeight: 60, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc', padding: 8, fontSize: 16 }}
              inputMode="text"
            />
          ) : (
            <div style={{ marginBottom: 10 }}>
              <input
                type="file"
                accept={type === 'image' ? 'image/*' : 'application/pdf'}
                onChange={handleFileChange}
                required
                style={{ marginBottom: 6, fontSize: 16 }}
              />
              {preview && type === 'image' && (
                <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
              )}
              {preview && type === 'pdf' && (
                <div style={{ marginTop: 4, color: '#555', fontSize: 13 }}>PDF selected</div>
              )}
            </div>
          )}

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={!userLocation || (type === 'text' ? !text.trim() : !file)}
              style={{ fontSize: 16 }}
            >
              Drop
            </button>
            <button type="button" onClick={onClose} style={{ background: '#eee', color: '#333', fontSize: 16 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DropForm;
