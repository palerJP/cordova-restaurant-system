# CordovaEats PWA

Use Install CordovaEats at the bottom of the website or the browser installation menu. Safari on iPhone/iPad uses Share > Add to Home Screen. Installed windows use standalone display, branded icons and the green theme. Browser support determines whether a native install prompt is available.

The service worker registers in production only. Offline navigation shows a retry screen. Reservations, menus, analytics, accounts and API responses are never cached or queued by this worker. Only the offline document and app icons are cached. Reconnect for current information.

Updates wait until the user selects Update now; save work before updating.

Validation: TypeScript passed. Real Chromium verified manifest, worker control, offline navigation, reconnect retry, private-data cache exclusion and 390px layout.
