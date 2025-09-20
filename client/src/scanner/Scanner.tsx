import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface Props { onCode: (code: string, durationMs: number) => void; }

export const Scanner: React.FC<Props> = ({ onCode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<QrScanner.Camera[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

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
      // Switching camera
      scannerRef.current.setCamera(activeDeviceId).then(async() => {
        // Reset flash state on camera change
        setFlashOn(false);
        const support = await scannerRef.current?.hasFlash().catch(()=>false);
        setHasFlash(!!support);
      }).catch(console.error);
      return;
    }
    const qrScanner = new QrScanner(videoRef.current, result => {
      // qr-scanner doesn't expose processingStart in types; just record instant duration as 0 for now.
      const now = performance.now();
      onCode(result.data, 0);
    }, {
      preferredCamera: activeDeviceId,
      highlightScanRegion: true,
      highlightCodeOutline: true,
      maxScansPerSecond: 10
    });
    scannerRef.current = qrScanner;
    qrScanner.start().then(async()=> {
      setIsRunning(true);
      const support = await qrScanner.hasFlash().catch(()=>false);
      setHasFlash(!!support);
    }).catch(err=> console.error('Failed to start', err));
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
        {hasFlash && (
          <button
            onClick={async()=>{
              if (!scannerRef.current) return;
              try {
                // Toggle flash state
                const newState = !flashOn;
                await scannerRef.current.toggleFlash();
                setFlashOn(newState);
              } catch (e) {
                console.error('Flash toggle failed', e);
                // Re-check support in case capability changed
                const support = await scannerRef.current.hasFlash().catch(()=>false);
                setHasFlash(!!support);
              }
            }}
            style={{marginTop:8, marginLeft:8, background: flashOn? '#d29922':'#30363d', color:'#fff'}}
            title={flashOn? 'Turn flash off':'Turn flash on'}
          >{flashOn? 'Flash On':'Flash Off'}</button>
        )}
      </div>
    </div>
  );
};
