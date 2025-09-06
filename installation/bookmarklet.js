(function () {
  try {
    const s = document.createElement('script');
    s.src = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';
    document.head.appendChild(s);
    const s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js';
    document.head.appendChild(s2);
    setTimeout(() => { if (window.CAMPOverlay) { const c = new CAMPOverlay(location.hostname, '1.0.0'); c.show(); } }, 800);
  } catch (e) { console.error('CAMP bookmarklet failed', e); }
})();
