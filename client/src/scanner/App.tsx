import React, { useCallback, useEffect, useState } from 'react';
import { Scanner } from './Scanner';
import { StatsPanel } from './StatsPanel';

export const App: React.FC = () => {
  const [codes, setCodes] = useState<string[]>([]);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [stats, setStats] = useState<{total:number;unique:number;avgDurationMs:number}|null>(null);
  const [sending, setSending] = useState(false);
  const [lastUploadResult, setLastUploadResult] = useState<string | null>(null);

  const addCode = useCallback(async (code: string, duration: number) => {
    setCodes(prev => {
      if (prev.includes(code)) return prev; // dedup: ignore existing
      const next = [code, ...prev];
      setUniqueCount(next.length); // because dedup ensures uniqueness here
      return next.slice(0, 500); // allow a bit larger buffer now
    });
    setLastDuration(duration);
  }, []);

  const uploadAll = async () => {
    if (!codes.length || sending) return;
    setSending(true);
    setLastUploadResult(null);
    try {
      const payload = codes.map(code => ({ code }));
      const res = await fetch('/api/scan-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: payload })
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setLastUploadResult(`Uploaded ${json.added} codes`);
      setCodes([]);
      setUniqueCount(0);
    } catch (e:any) {
      setLastUploadResult(e.message || 'Error');
    } finally {
      setSending(false);
    }
  };

  useEffect(()=>{
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      return; // skip polling on GitHub Pages (no backend there)
    }
    const id = setInterval(()=>{
      fetch('/api/stats').then(r=>r.json()).then(setStats).catch(()=>{});
    }, 3000);
    return ()=> clearInterval(id);
  }, []);

  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding:'1rem', color:'#e6edf3', background:'#0d1117', minHeight:'100vh'}}>
  <h1 style={{marginTop:0}}>QR Scanner Experiment</h1>
  <p style={{margin:'0.25rem 0 1rem'}}><a href={`${import.meta.env.BASE_URL}qrs`} style={{color:'#58a6ff'}}>View QR Assets Gallery →</a></p>
      <p style={{maxWidth:600}}>Point your camera at QR codes. Decoded numeric values will appear below. This is an experimental build focusing on speed & accuracy using the <code>qr-scanner</code> library (WebAssembly ZXing).</p>
      <Scanner onCode={addCode} />
      <StatsPanel lastDuration={lastDuration} uniqueLocal={uniqueCount} totalLocal={codes.length} serverStats={stats} />
      <div style={{margin:'0.5rem 0 1rem', display:'flex', gap:'1rem', alignItems:'center'}}>
        <button onClick={uploadAll} disabled={!codes.length || sending} style={{padding:'0.5rem 1rem'}}>
          {sending ? 'Uploading…' : `Upload ${codes.length || ''} Codes`}
        </button>
        {lastUploadResult && <span style={{fontSize:12, opacity:0.8}}>{lastUploadResult}</span>}
      </div>
      <h2>Recent Codes</h2>
      <ol style={{maxHeight:240, overflow:'auto', paddingLeft:'1.2rem'}}>
        {codes.map((c,i)=>(<li key={i} style={{fontFamily:'monospace'}}>{c}</li>))}
      </ol>
    </div>
  );
};
