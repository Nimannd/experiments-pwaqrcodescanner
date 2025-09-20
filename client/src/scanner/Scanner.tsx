import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface Props { onCode: (code: string, durationMs: number) => void; }

export const Scanner: React.FC<Props> = ({ onCode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<QrScanner.Camera[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    QrScanner.listCameras(true).then(cams => {
      setDevices(cams);
      if (cams.length) setActiveDeviceId(cams[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!activeDeviceId) return;
    if (scannerRef.current) {
      scannerRef.current.setCamera(activeDeviceId).catch(console.error);
      return;
    }
    const qrScanner = new QrScanner(videoRef.current, result => {
      const now = performance.now();
      onCode(result.data, now - (result?.scanRegion?.processingStart || now));
    }, {
      preferredCamera: activeDeviceId,
      highlightScanRegion: true,
      highlightCodeOutline: true,
      maxScansPerSecond: 10
    });
    scannerRef.current = qrScanner;
    qrScanner.start().then(()=> setIsRunning(true)).catch(err=> console.error('Failed to start', err));
    return () => { qrScanner.stop(); };
  }, [activeDeviceId, onCode]);

  return (
    <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
      <div style={{position:'relative'}}>
        <video ref={videoRef} style={{width:320, height:240, background:'#222'}} muted playsInline />
        {!isRunning && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#bbb'}}>Starting...</div>}
      </div>
      <div style={{minWidth:220}}>
        <label style={{display:'block', fontSize:12, textTransform:'uppercase', letterSpacing:1}}>Camera</label>
        <select value={activeDeviceId ?? ''} onChange={e=> setActiveDeviceId(e.target.value)} style={{padding:4, width:'100%'}}>
          {devices.map(d => <option key={d.id} value={d.id}>{d.label || d.id}</option>)}
        </select>
        <button onClick={()=>{
          if (!scannerRef.current) return;
          if (isRunning) {
            scannerRef.current.stop();
            setIsRunning(false);
          } else {
            scannerRef.current.start().then(()=> setIsRunning(true));
          }
        }} style={{marginTop:8}}>{isRunning? 'Pause':'Start'}</button>
      </div>
    </div>
  );
};
