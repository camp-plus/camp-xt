(function () {
  // Idempotent loader for CAMP overlay. Exposes window.__CAMP_injecting while running
  // and resolves window.__CAMP_ready once the overlay constructor is available.
  if (window.__CAMP_ready && window.__CAMP_ready.then) return;
  if (window.__CAMP_injecting && window.__CAMP_injecting.then) return;

  const overlayCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-overlay.js';
  const overlayRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-overlay.js';

  const appendScript = (src) => new Promise((resolve, reject) => {
    try {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute('data-camp-loaded') === '1') return resolve(src);
        existing.addEventListener('load', () => { existing.setAttribute('data-camp-loaded', '1'); resolve(src); });
        existing.addEventListener('error', (e) => { reject(e); void e; });
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => { s.setAttribute('data-camp-loaded', '1'); resolve(src); };
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
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) { void e; } }, 1500);
    }
  };

  // Start injection and publish a promise on window so others can await it.
  window.__CAMP_injecting = (async () => {
    // Prefer fetching the raw file with a cache-busting query param to avoid CDN caches
    const rawWithBust = overlayRaw + '?_=' + Date.now();
    try {
      await fetchAndInject(rawWithBust);
    } catch (e) {
      // If raw fetch+inject fails, try CDN script tag (fast, cached)
      try {
        await appendScript(overlayCDN);
      } catch (e2) {
        // If CDN tag fails, try raw script tag without cache-bust
        try {
          await appendScript(overlayRaw);
        } catch (e3) {
          // Last resort: straight fetch+inject without cache-bust
          await fetchAndInject(overlayRaw);
        }
      }
    }

    if (window.CAMPOverlay && typeof window.CAMPOverlay === 'function') {
      window.__CAMP_ready = Promise.resolve(window.CAMPOverlay);
      try { return window.CAMPOverlay; } finally { try { delete window.__CAMP_injecting; } catch (e) { void e; } }
    }

    const err = new Error('CAMPOverlay not defined after injection');
    window.__CAMP_ready = Promise.reject(err);
    try { throw err; } finally { try { delete window.__CAMP_injecting; } catch (e) { void e; } }
  })();

})();
