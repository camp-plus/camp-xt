(function(){
  // Idempotent loader for CAMP overlay.
  // Ensures only one fetch/injection of the full overlay occurs, even if multiple
  // userscripts attempt to load it concurrently (CDN + raw + fetch+inject fallbacks).
  if (window.__CAMP_ready && window.__CAMP_ready.then) return;
  if (window.__CAMP_injecting && window.__CAMP_injecting.then) return;

  const overlayCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js';
  const overlayRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';

  const appendScript = (src) => new Promise((resolve, reject) => {
    try {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        // If script tag already exists, resolve once it loads (or immediately if already loaded)
        if (existing.getAttribute('data-camp-loaded') === '1') return resolve(src);
        existing.addEventListener('load', () => { existing.setAttribute('data-camp-loaded','1'); resolve(src); });
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => { s.setAttribute('data-camp-loaded','1'); resolve(src); };
      s.onerror = (e) => { s.remove(); reject(e); };
      (document.head || document.documentElement).appendChild(s);
    } catch (e) { reject(e); }
  });

  const fetchAndInject = async (url) => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    try {
      await appendScript(blobUrl);
      return blobUrl;
    } finally {
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 1500);
    }
  };

  // Start injection and publish a promise on window so others can await it.
  window.__CAMP_injecting = (async () => {
    try {
      // Try CDN script tag first
      try {
        await appendScript(overlayCDN);
      } catch (e) {
        // CDN failed, try raw via normal script tag
        try { await appendScript(overlayRaw); }
        catch (e2) {
          // If that fails due to nosniff, try fetch+inject
          try { await fetchAndInject(overlayRaw); }
          catch (e3) { throw e3; }
        }
      }

      // At this point overlay script should have executed and set window.CAMPOverlay
      if (window.CAMPOverlay && typeof window.CAMPOverlay === 'function') {
        window.__CAMP_ready = Promise.resolve(window.CAMPOverlay);
        return window.CAMPOverlay;
      }

      // If still not defined, throw to let waiters know
      throw new Error('CAMPOverlay not defined after injection');
    } catch (err) {
      // Ensure __CAMP_ready is a rejected promise
      window.__CAMP_ready = Promise.reject(err);
      throw err;
    } finally {
      try { delete window.__CAMP_injecting; } catch (e) {}
    }
  })();

})();
