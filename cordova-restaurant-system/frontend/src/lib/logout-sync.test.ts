import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { broadcastLogout, onOtherTabLogout } from './logout-sync';

test('logout reaches another channel and storage notifications are filtered and cleaned up', async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const surface = Object.assign(new EventTarget(), {
    localStorage: { setItem: () => { throw new Error('Storage disabled'); } },
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: surface });
  let calls = 0;
  let signal: (() => void) | undefined;
  const stop = onOtherTabLogout(() => { calls++; signal?.(); });
  try {
    const received = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Logout was not received')), 2000);
      signal = () => { clearTimeout(timeout); resolve(); };
    });
    broadcastLogout();
    await received;
    assert.equal(calls, 1);
    signal = undefined;
    surface.dispatchEvent(Object.assign(new Event('storage'), { key: 'theme', newValue: 'dark' }));
    surface.dispatchEvent(Object.assign(new Event('storage'), { key: 'cordovaeats:logout:v1', newValue: null }));
    assert.equal(calls, 1);
    surface.dispatchEvent(Object.assign(new Event('storage'), { key: 'cordovaeats:logout:v1', newValue: 'new-logout' }));
    assert.equal(calls, 2);
    stop();
    surface.dispatchEvent(Object.assign(new Event('storage'), { key: 'cordovaeats:logout:v1', newValue: 'another-logout' }));
    assert.equal(calls, 2);
  } finally {
    stop();
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
