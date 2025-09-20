import React from 'react';

interface Props {
  lastDuration: number | null;
  totalLocal: number;
  uniqueLocal: number;
}

export const StatsPanel: React.FC<Props> = ({ lastDuration, totalLocal, uniqueLocal }) => {
  return (
    <div style={{margin:'1rem 0', display:'flex', gap:'2rem', flexWrap:'wrap', fontSize:14}}>
      <div>
        <strong>Local</strong><br />
        Scans: {totalLocal} / Unique: {uniqueLocal}<br />
        Last decode: {lastDuration!=null? `${Math.round(lastDuration)} ms` : '—'}
      </div>
    </div>
  );
};
