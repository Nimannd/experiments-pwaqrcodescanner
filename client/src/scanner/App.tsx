import React, { useCallback, useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Scanner } from './Scanner';
import { StatsPanel } from './StatsPanel';

export const App: React.FC = () => {
  const [codes, setCodes] = useState<string[]>([]);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [stats, setStats] = useState<{total:number;unique:number;avgDurationMs:number}|null>(null);

  const addCode = useCallback(async (code: string, duration: number) => {
    setCodes(prev => [code, ...prev].slice(0, 200));
    setLastDuration(duration);
    const unique = new Set([code, ...codes]).size;
    setUniqueCount(unique);
    // send to server (fire & forget)
    fetch('/api/scan-events', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, durationMs: duration, ts: Date.now() })}).catch(()=>{});
  }, [codes]);

  useEffect(()=>{
    const id = setInterval(()=>{
      fetch('/api/stats').then(r=>r.json()).then(setStats).catch(()=>{});
    }, 3000);
    return ()=> clearInterval(id);
  }, []);

  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding:'1rem', color:'#e6edf3', background:'#0d1117', minHeight:'100vh'}}>
      <h1 style={{marginTop:0}}>QR Scanner Experiment</h1>
      <p style={{maxWidth:600}}>Point your camera at QR codes. Decoded numeric values will appear below. This is an experimental build focusing on speed & accuracy using the <code>qr-scanner</code> library (WebAssembly ZXing).</p>
      <Scanner onCode={addCode} />
      <StatsPanel lastDuration={lastDuration} uniqueLocal={uniqueCount} totalLocal={codes.length} serverStats={stats} />
      <h2>Recent Codes</h2>
      <ol style={{maxHeight:240, overflow:'auto', paddingLeft:'1.2rem'}}>
        {codes.map((c,i)=>(<li key={i} style={{fontFamily:'monospace'}}>{c}</li>))}
      </ol>
    </div>
  );
};
