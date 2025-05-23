import React, { useEffect, useState } from 'react';

const CODEX_API_URL = 'http://localhost:8080';

// AR view: fetch content from Codex if codexCid is present
function ARView({ drop, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(!!drop.codexCid);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
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
          const blob = await res.blob();
          // Check if blob is an image
          if (!blob.type.startsWith('image/')) {
            const errTxt = await blob.text();
            console.error('Codex image fetch error: Not an image', errTxt);
            if (!ignore) setError('Codex error: Not an image file.\n' + errTxt);
            return;
          }
          const imgUrl = URL.createObjectURL(blob);
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
    return () => { ignore = true; };
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
        (() => {
          let ext = 'bin';
          let label = 'Download File';
          if (drop.type === 'image') { ext = 'png'; label = 'Download Image'; }
          else if (drop.type === 'pdf') { ext = 'pdf'; label = 'Download PDF'; }
          else if (drop.type === 'text') { ext = 'txt'; label = 'Download Text'; }
          return (
            <div style={{margin:'1em 0', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <a
                href={`http://localhost:8080/api/codex/v1/data/${drop.codexCid}/network/stream`}
                download={`${drop.codexCid}.${ext}`}
                style={{
                  background: '#0ff',
                  color: '#222',
                  padding: '10px 24px',
                  borderRadius: 6,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontSize: 18
                }}
              >
                {label}
              </a>
            </div>
          );
        })()
      ) : (
        // Fallback: show drop.url as before
        drop.type === 'text' ? (
          <div style={{ margin: '1em 0', background: '#fff', color: '#222', padding: 8 }}>{drop.url}</div>
        ) : (
          (() => {
            // Use codexCid if available, otherwise fallback to drop.url
            const url = drop.codexCid
              ? `/api/proxy/codex/${drop.codexCid}/stream`
              : drop.url;
            let ext = 'bin';
            if (drop.type === 'image') ext = 'png';
            else if (drop.type === 'pdf') ext = 'pdf';
            return (
              <a
                href={url}
                download={drop.codexCid ? `${drop.codexCid}.${ext}` : undefined}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0ff' }}
              >
                Download {drop.type.toUpperCase()}
              </a>
            );
          })()
        )
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={onClose}>Close</button>
      </div>
      {/* TODO: Integrate AR.js/A-Frame overlay */}
    </div>
  );
}

export default ARView;
