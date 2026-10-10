'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '@/lib/api';

export default function PermitDownload({ url }: { url: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function download() {
    setBusy(true);
    setError('');
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      if (!/^\/(?:api\/)?uploads\/business-permits\/[^/]+$/.test(pathname)) throw new Error('Unsupported document location');
      const blob = await api.get<Blob>(pathname, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = pathname.split('/').pop() || 'business-permit';
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError('Document could not be downloaded. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return <>
    <button type="button" disabled={busy} onClick={download} className="inline-flex items-center gap-1.5 text-xs font-bold text-cordova-green hover:underline disabled:opacity-50">
      <Download size={13} />{busy ? 'Downloading...' : 'Download Business Permit'}
    </button>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
  </>;
}
