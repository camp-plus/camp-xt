(function () {
  // Loaders: prefer CDN (jsDelivr) which serves correct JS MIME types. If all <script src> attempts fail
  // (for example because raw.githubusercontent serves text/plain and the browser blocks execution),
  // fallback to fetching the raw content and injecting it via a Blob with the correct MIME.
  const loadScriptWithFallback = (list, cb) => {
      if (!list || list.length === 0) { cb(new Error('No sources')); return; }
      const src = list[0];
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => cb(null, src);
      s.onerror = () => {
        s.remove();
        if (list.length > 1) loadScriptWithFallback(list.slice(1), cb);
        else cb(new Error('All sources failed'));
      };
      document.head.appendChild(s);
    };

    const fetchAndInject = async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = blobUrl;
        s.onload = () => { URL.revokeObjectURL(blobUrl); resolve(blobUrl); };
        s.onerror = (e) => { URL.revokeObjectURL(blobUrl); reject(e); };
        document.head.appendChild(s);
      });
    };

    // Prefer CDN first to avoid MIME issues with raw.githubusercontent
    const overlayCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js';
    const overlayRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';
    const utilsCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js';
    const utilsRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js';

    loadScriptWithFallback([overlayCDN, overlayRaw], async (err, src) => {
      if (err) {
        console.warn('Initial <script> load failed for overlay, trying fetch+inject raw:', err);
        try { await fetchAndInject(overlayRaw); } catch (e) { console.warn('fetch+inject overlay failed', e); }
      }

      // Now load utils similarly
      loadScriptWithFallback([utilsCDN, utilsRaw], async (err2) => {
        if (err2) {
          console.warn('Initial <script> load failed for utils, trying fetch+inject raw:', err2);
          try { await fetchAndInject(utilsRaw); } catch (e2) { console.warn('fetch+inject utils failed', e2); }
        }

  setTimeout(() => { if (window.CAMPOverlay) { const c = new window.CAMPOverlay(location.hostname, '1.0.0'); c.show(); } }, 800);
      });
    });
})();
