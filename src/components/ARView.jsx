import React, { useEffect, useState } from 'react';

const CODEX_API_URL = 'http://localhost:8080';

// AR view: fetch content from Codex if codexCid is present
function ARView({ drop, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(!!drop.codexCid);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    let currentImgUrl = null;
    async function fetchContent() {
      if (!drop.codexCid) return;
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:8080/api/codex/v1/data/${drop.codexCid}/network/stream`;
        if (drop.type === 'text') {
          const res = await fetch(url);
          const txt = await res.text();
          // Detect HTML or error message
          if (!res.ok || txt.startsWith('<!DOCTYPE html') || txt.startsWith('Codex error:')) {
            console.error('Codex fetch error:', res.status, txt);
            if (!ignore) setError(`Codex error: ${res.status}\n${txt}`);
            return;
          }
          if (!ignore) setContent(txt);
        } else if (drop.type === 'image') {
          const res = await fetch(url);
          if (!res.ok) {
            const errTxt = await res.text();
            console.error('Codex image fetch error:', res.status, errTxt);
            if (!ignore) setError(`Codex error: ${res.status} ${errTxt}`);
            return;
          }
          const origBlob = await res.blob();
          // Use original MIME type for blob, fallback to PNG only if needed
          let imgType = origBlob.type && origBlob.type.startsWith('image/') ? origBlob.type : 'image/png';
          let imgBlob = origBlob;
          if (imgType !== origBlob.type) {
            imgBlob = new Blob([origBlob], { type: imgType });
          }
          const imgUrl = URL.createObjectURL(imgBlob);
          currentImgUrl = imgUrl;
          if (!ignore) setContent(imgUrl);
        } else if (drop.type === 'pdf') {
          const res = await fetch(url);
          if (!res.ok) {
            const errTxt = await res.text();
            console.error('Codex PDF fetch error:', res.status, errTxt);
            if (!ignore) setError(`Codex error: ${res.status} ${errTxt}`);
            return;
          }
          const blob = await res.blob();
          // Check if blob is a PDF
          if (blob.type !== 'application/pdf') {
            const errTxt = await blob.text();
            console.error('Codex PDF fetch error: Not a PDF', errTxt);
            if (!ignore) setError('Codex error: Not a PDF file.\n' + errTxt);
            return;
          }
          const pdfUrl = URL.createObjectURL(blob);
          if (!ignore) setContent(pdfUrl);
        }
      } catch (e) {
        console.error('Codex fetch exception:', e);
        if (!ignore) setError('Failed to load content from Codex: ' + (e?.message || e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchContent();
    return () => {
      ignore = true;
      if (currentImgUrl) URL.revokeObjectURL(currentImgUrl);
    };
  }, [drop.codexCid, drop.type]);

  return (
    <div style={{ background: '#222', color: '#fff', padding: 24, position: 'fixed', top: '10%', left: '10%', right: '10%', zIndex: 1000, borderRadius: 12, maxWidth: 420, margin: 'auto' }}>
      <h3>AR View</h3>
      <div>Type: {drop.type}</div>
      <div>Location: {drop.lat?.toFixed?.(5)}, {drop.lng?.toFixed?.(5)}</div>
      {loading ? (
        <div style={{margin:'1em 0'}}>Loading from Codex...</div>
      ) : error ? (
        <div style={{margin:'1em 0',color:'#f88'}}>{error}</div>
      ) : drop.codexCid ? (
        drop.type === 'text' ? (
          <div style={{background:'#fff',color:'#222',padding:16,borderRadius:8,margin:'1em 0',wordBreak:'break-word',maxWidth:320,maxHeight:320,overflow:'auto'}}>{content}</div>
        ) : drop.type === 'image' ? (
          <div style={{margin:'1em 0'}}>
            <img 
              src={content} 
              alt="Codex drop" 
              style={{maxWidth:300,maxHeight:300,borderRadius:8,background:'#fff'}} 
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div style={{marginTop:8}}>
              <a href={content} download={`drop-${drop.codexCid || 'image'}.png`} style={{color:'#fff',textDecoration:'underline',fontWeight:600}}>Download image</a>
            </div>
          </div>
        ) : (
          <div style={{ margin: '1em 0' }}>
            <a
              href={drop.codexCid ? `/api/proxy/codex/${drop.codexCid}/stream` : drop.url}
              download={drop.codexCid ? `${drop.codexCid}.${drop.type === 'image' ? 'png' : drop.type === 'pdf' ? 'pdf' : 'bin'}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0ff' }}
            >
              Download {drop.type.toUpperCase()}
            </a>
          </div>
        )
      ) : (
        <div style={{ margin: '1em 0' }}>
          <a
            href={drop.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0ff' }}
          >
            Download {drop.type.toUpperCase()}
          </a>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={onClose}>Close</button>
      </div>
      {/* TODO: Integrate AR.js/A-Frame overlay */}
    </div>
  );
}

export default ARView;
