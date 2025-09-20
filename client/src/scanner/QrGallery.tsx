import React from 'react';
import { Link } from 'react-router-dom';

// Dynamically import all images in assets folder (png, jpg, jpeg, svg)
// Vite's import.meta.glob will give us a map of paths to async import functions
const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });

const images: { path: string; src: string }[] = Object.entries(imageModules).map(([path, mod]) => ({
  path,
  // mod will be the resolved URL string because of import: 'default'
  src: mod as string
}));

export const QrGallery: React.FC = () => {
  return (
    <div style={{fontFamily:'system-ui,sans-serif', padding:'1rem', background:'#0d1117', color:'#e6edf3', minHeight:'100vh'}}>
      <h1 style={{marginTop:0}}>QR Assets Gallery</h1>
      <p style={{maxWidth:600}}>All image files found in <code>src/assets</code> (PNG/JPG/SVG). Add or remove files and reload to update.</p>
  <p><Link to="/" style={{color:'#58a6ff'}}>← Back to Scanner</Link></p>
      {images.length === 0 && <div style={{opacity:0.7}}>No images found. Drop QR images into <code>client/src/assets</code>.</div>}
      <div style={{display:'grid', gap:'1rem', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))'}}>
        {images.map(img => (
          <figure key={img.path} style={{margin:0, background:'#161b22', padding:'0.5rem', borderRadius:4}}>
            <img src={img.src} style={{maxWidth:'100%', display:'block'}} loading="lazy" />
            <figcaption style={{fontSize:10, wordBreak:'break-all', marginTop:4}}>{img.path.replace('../assets/','')}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};
