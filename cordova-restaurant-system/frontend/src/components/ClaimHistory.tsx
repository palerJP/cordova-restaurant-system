'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { ClaimDetail } from '@/lib/claims';

export default function ClaimHistory({ id, detail }: { id: string; detail: ClaimDetail }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  async function download(documentId: string) {
    setBusy(documentId); setError('');
    try {
      const blob = await api.get<Blob>(`/api/claims/${id}/documents/${documentId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'ownership-evidence'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Evidence could not be downloaded. Try again.'); }
    finally { setBusy(null); }
  }
  return <div className="mt-4 space-y-4">
    <div><h4 className="font-semibold">Private ownership evidence</h4><div className="flex flex-wrap gap-3 mt-2">{detail.documents.map((doc, index) => <button key={doc.id} type="button" disabled={!!busy} className="text-sm text-cordova-green underline disabled:opacity-50" onClick={() => download(doc.id)}>{busy === doc.id ? 'Downloading…' : `Download evidence ${index + 1}`}</button>)}</div></div>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <div><h4 className="font-semibold">Application history</h4><ol className="mt-2 space-y-3">{detail.events.map(event => <li key={event.id} className="border-l-2 border-stone-300 pl-3 text-sm"><p className="text-stone-500">{new Date(event.created_at).toLocaleString()} · {event.action.replaceAll('_', ' ')}</p><p className="whitespace-pre-wrap break-words">{event.message}</p></li>)}</ol></div>
  </div>;
}
