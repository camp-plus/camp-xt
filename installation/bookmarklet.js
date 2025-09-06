(function () {
  try {
    const loadScriptWithFallback = (list, cb) => {
    if (!list || list.length === 0) { cb(new Error('No sources')); return; }
    const src = list[0];
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => cb(null, src);
    s.onerror = () => { s.remove(); if (list.length > 1) loadScriptWithFallback(list.slice(1), cb); else cb(new Error('All sources failed')); };
    document.head.appendChild(s);
  };

  loadScriptWithFallback([
    'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js',
    'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js'
  ], (err) => {
    if (err) console.warn('Failed to load overlay from all sources', err);
    loadScriptWithFallback([
      'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js',
      'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js'
    ], (err2) => {
      if (err2) console.warn('Failed to load utils from all sources', err2);
      setTimeout(() => { if (window.CAMPOverlay) { const c = new CAMPOverlay(location.hostname, '1.0.0'); c.show(); } }, 800);
    });
  });
  } catch (e) { console.error('CAMP bookmarklet failed', e); }
})();
