const LOGOUT_KEY = 'cordovaeats:logout:v1';

export function broadcastLogout(): void {
  try {
    window.localStorage.setItem(LOGOUT_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    // BroadcastChannel also supports browsers with disabled storage.
  }
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(LOGOUT_KEY);
    channel.postMessage('logout');
    channel.close();
  }
}

export function onOtherTabLogout(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOGOUT_KEY && event.newValue !== null) callback();
  };
  window.addEventListener('storage', onStorage);
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(LOGOUT_KEY) : null;
  if (channel) channel.onmessage = event => { if (event.data === 'logout') callback(); };
  return () => {
    window.removeEventListener('storage', onStorage);
    channel?.close();
  };
}
