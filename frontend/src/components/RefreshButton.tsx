"use client";

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function RefreshButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRefresh = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/library/refresh-failed', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('success');
        setMessage(`Queued ${data.movies_queued + data.shows_queued}`);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
    
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 4000);
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={status === 'loading'}
      className="pricing-tab"
      style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: status === 'loading' ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
      title="Refresh failed metadata syncs for Loading titles"
    >
      {status === 'loading' && <RefreshCw size={16} className="spin-icon" />}
      {status === 'loading' && 'Syncing...'}
      {status === 'success' && <CheckCircle2 size={16} />}
      {status === 'success' && message}
      {status === 'error' && <XCircle size={16} />}
      {status === 'error' && 'Failed'}
      {status === 'idle' && <RefreshCw size={16} />}
      {status === 'idle' && 'Sync'}
    </button>
  );
}
