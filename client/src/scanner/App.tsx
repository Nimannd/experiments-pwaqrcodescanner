import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scanner } from './Scanner';
import { StatsPanel } from './StatsPanel';

export const App: React.FC = () => {
  const [codes, setCodes] = useState<string[]>([]);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState(0);
  // Backend removed: no remote stats or upload state needed now

  const addCode = useCallback(async (code: string, duration: number) => {
    setCodes(prev => {
      if (prev.includes(code)) return prev; // dedup: ignore existing
      const next = [code, ...prev];
      setUniqueCount(next.length); // because dedup ensures uniqueness here
      return next.slice(0, 500); // allow a bit larger buffer now
    });
    setLastDuration(duration);
  }, []);

  const clearAll = () => {
    if (!codes.length) return;
    setCodes([]);
    setUniqueCount(0);
  };

  // Removed stats polling effect (backend eliminated)

  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding:'1rem', color:'#e6edf3', background:'#0d1117', minHeight:'100vh'}}>
  <h1 style={{marginTop:0}}>QR Scanner Experiment</h1>
  <p style={{margin:'0.25rem 0 1rem'}}><Link to="/qrs" style={{color:'#58a6ff'}}>View QR Assets Gallery →</Link></p>
      <p style={{maxWidth:600}}>Point your camera at QR codes. Decoded numeric values will appear below. This is an experimental build focusing on speed & accuracy using the <code>qr-scanner</code> library (WebAssembly ZXing).</p>
      <Scanner onCode={addCode} />
      <StatsPanel lastDuration={lastDuration} uniqueLocal={uniqueCount} totalLocal={codes.length} />
      <div style={{margin:'0.5rem 0 1rem', display:'flex', gap:'1rem', alignItems:'center'}}>
        <button onClick={clearAll} disabled={!codes.length} style={{padding:'0.5rem 1rem'}}>
          Clear {codes.length || ''} {codes.length===1?'Code':'Codes'}
        </button>
      </div>
      <h2>Recent Codes</h2>
      <ol style={{maxHeight:240, overflow:'auto', paddingLeft:'1.2rem'}}>
        {codes.map((c,i)=>(<li key={i} style={{fontFamily:'monospace'}}>{c}</li>))}
      </ol>
    </div>
  );
};
