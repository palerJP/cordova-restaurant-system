'use client';
import { useEffect, useState } from 'react';
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
export function PwaControls() {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [help, setHelp] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const sync = () => setStandalone(media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    sync(); media.addEventListener('change', sync);
    const available = (event: Event) => { event.preventDefault(); setInstall(event as InstallEvent); };
    const installed = () => { setStandalone(true); setInstall(null); setHelp(false); };
    window.addEventListener('beforeinstallprompt', available);
    window.addEventListener('appinstalled', installed);
    let disposed = false;
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(reg => {
        if (disposed) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (!disposed && worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
          });
        });
      }).catch(() => { /* Installation remains optional; the website stays usable. */ });
    }
    return () => { disposed = true; media.removeEventListener('change', sync); window.removeEventListener('beforeinstallprompt', available); window.removeEventListener('appinstalled', installed); };
  }, []);
  const doInstall = async () => {
    if (!install) { setHelp(true); return; }
    try { await install.prompt(); await install.userChoice; } finally { setInstall(null); }
  };
  return <>
    {!standalone && <div className="text-sm text-stone-500 dark:text-stone-400">
      <button type="button" onClick={doInstall} className="text-left hover:text-cordova-green dark:hover:text-emerald-400 transition-colors">Install CordovaEats</button>
      {help && <div className="mx-auto mt-3 max-w-md" role="status"><p>On iPhone or iPad, open this site in Safari, tap Share, then Add to Home Screen. On Android or desktop, use your browser menu and choose Install app or Add to Home screen when available.</p><button type="button" className="mt-2 underline" onClick={() => setHelp(false)}>Close instructions</button></div>}
    </div>}
    {waiting && <div role="status" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl bg-[#1B5232] p-4 text-white shadow-lg"><p>A CordovaEats update is ready. Save any changes before updating.</p><button type="button" className="mt-2 rounded bg-white px-3 py-2 font-semibold text-[#1B5232]" onClick={() => { navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true }); waiting.postMessage({ type: 'ACTIVATE_UPDATE' }); }}>Update now</button><button type="button" className="ml-4 underline" onClick={() => setWaiting(null)}>Later</button></div>}
  </>;
}

