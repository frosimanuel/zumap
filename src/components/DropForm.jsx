import React, { useState } from 'react';

function DropForm({ userLocation, onSubmit, onClose }) {
  const [type, setType] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

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
        timestamp: Date.now()
      }, null);
      setText('');
    } else if (file) {
      setError('');
      await onSubmit({
        id: Date.now().toString(),
        lat: userLocation.lat,
        lng: userLocation.lng,
        type,
        url: '', // will be replaced after upload
        timestamp: Date.now()
      }, file);
      setFile(null);
      setPreview(null);
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
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>Type:</span>
            <select value={type} onChange={e => { setType(e.target.value); setFile(null); setPreview(null); }} style={{ marginLeft: 8 }}>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          {type === 'text' ? (
            <textarea value={text} onChange={e => setText(e.target.value)} required placeholder="Enter your message..." style={{ width: '100%', minHeight: 60, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc', padding: 8 }} />
          ) : (
            <div style={{ marginBottom: 10 }}>
              <input type="file" accept={type === 'image' ? 'image/*' : 'application/pdf'} onChange={handleFileChange} required style={{ marginBottom: 6 }} />
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
            <button type="submit" disabled={!userLocation || (type === 'text' ? !text.trim() : !file)}>
              Drop
            </button>
            <button type="button" onClick={onClose} style={{ background: '#eee', color: '#333' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DropForm;
