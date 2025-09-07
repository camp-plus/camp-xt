// ==UserScript==
// @name         CAMP-XT: GitHub
// @namespace    camp-xt/github.com
// @version      1.0.2
// @description  CAMP tools for GitHub
// @author       CAMP Team
// @match        https://github.com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/scripts/github.com/github-tools.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/scripts/github.com/github-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* global unsafeWindow */

(function () {
  'use strict';

  const loaderCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-loader.js';
  const loaderRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-loader.js';
  const utilsCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-utils.js';
  const utilsRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-utils.js';

  const appendScript = (src) => new Promise((resolve, reject) => {
    try {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = (e) => { s.remove(); reject(e); };
      (document.head || document.documentElement).appendChild(s);
    } catch (e) { reject(e); }
  });

  const loadScriptWithFallback = async (sources = []) => {
    if (!sources || sources.length === 0) throw new Error('No script sources');
    let lastErr = null;
    for (const src of sources) {
      try {
        await appendScript(src);
        return src;
      } catch (e) {
        lastErr = e; void e;
      }
    }
    throw lastErr || new Error('All sources failed');
  };

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
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) { void e; } }, 1000);
    }
  };

  const pageWindow = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  const ensureScripts = async () => {
    try {
      // Try fresh fetch+inject of loader first (cache-busted). If that fails, fall back to CDN/script tag, then try raw fallback.
      try {
        await fetchAndInject(loaderRaw + '?_=' + Date.now());
      } catch (e) {
        try {
          await loadScriptWithFallback([loaderCDN, loaderRaw]);
        } catch (e2) {
          console.warn('[CAMP GitHub] camp-loader CDN/script failed, attempting fetch+inject loader raw', e2); void e2;
          try { await fetchAndInject(loaderRaw); } catch (e3) { console.warn('[CAMP GitHub] fetch+inject loader failed', e3); void e3; }
        }
      }

      // Then ensure utils: prefer fresh fetch+inject, fall back to CDN/script tag and raw fetch fallback.
      try {
        await fetchAndInject(utilsRaw + '?_=' + Date.now());
      } catch (e) {
        try {
          await loadScriptWithFallback([utilsCDN, utilsRaw]);
        } catch (e2) {
          console.warn('[CAMP GitHub] utils CDN/script failed, attempting fetch+inject utils raw', e2); void e2;
          try { await fetchAndInject(utilsRaw); } catch (e3) { console.warn('[CAMP GitHub] fetch+inject utils failed', e3); void e3; }
        }
      }
    } catch (e) {
      console.error('[CAMP GitHub] ensureScripts error', e); void e;
    }
  };

  const waitFor = async (predicate, timeoutMs = 3000, intervalMs = 200) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try { if (predicate()) return true; } catch (e) { void e; }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  };

  const init = async () => {
    try {
      await ensureScripts();

      try {
        if (pageWindow.__CAMP_ready && pageWindow.__CAMP_ready.then) {
          await pageWindow.__CAMP_ready;
        } else {
          const ok = await waitFor(() => pageWindow.CAMPOverlay && typeof pageWindow.CAMPOverlay === 'function', 4000, 200);
          if (!ok) {
            console.warn('[CAMP GitHub] CAMPOverlay not ready, attempting fetch+inject loader raw');
            try { await fetchAndInject(loaderRaw); } catch (e) { console.warn('[CAMP GitHub] fetch+inject loader failed', e); void e; }
            await new Promise(r => setTimeout(r, 250));
          }
        }
      } catch (e) { console.warn('[CAMP GitHub] waiting for __CAMP_ready failed', e); void e; }

      if (!pageWindow.CAMPOverlay || typeof pageWindow.CAMPOverlay !== 'function') {
        console.error('[CAMP GitHub] CAMPOverlay not available or invalid after readiness check; aborting init');
        return;
      }

  const camp = new pageWindow.CAMPOverlay('GitHub', '1.0.2');

      camp.addScript('PR Quick Actions', 'Approve or request changes for PRs', () => {
        try {
          const approve = document.querySelector('button[data-hovercard-type="user"][aria-label*="Approve"]') || document.querySelector('button.js-merge-branch-action');
          if (approve) { approve.click(); return true; }
          camp._showToast('No approve button found');
        } catch (e) { console.error('PR Quick Actions error', e); void e; }
      }, { category: 'reviews', icon: '\u2705', hotkey: 'Control+Shift+1' });

      camp.addScript('Copy Branch Name', 'Copy current branch name to clipboard', async () => {
        try {
          const el = document.querySelector('span.css-truncate-target') || document.querySelector('strong.branch-name');
          const branch = el ? el.textContent.trim() : pageWindow.location.pathname.split('/').pop();
          const ok2 = pageWindow.CAMPUtils && pageWindow.CAMPUtils.copyToClipboard ? await pageWindow.CAMPUtils.copyToClipboard(branch) : false;
          if (ok2) camp._showToast('Branch copied to clipboard');
          else camp._showToast('Copy failed', { level: 'error' });
        } catch (e) { console.error('Copy Branch error', e); void e; }
      }, { category: 'productivity', icon: '\ud83d\udccb', hotkey: 'Control+Shift+B' });

      camp.addScript('Review Enhancer', 'Expand diffs and show file list toggles', () => {
        try {
          document.querySelectorAll('button.js-diff-load').forEach(b => b.click());
          camp._showToast('Expanded diffs');
        } catch (e) { console.error('Review Enhancer error', e); void e; }
      }, { category: 'ui', icon: '\ud83d\udd0d' });

      setTimeout(() => camp.show(), 1000);
    } catch (e) {
      console.error('CAMP GitHub init error', e); void e;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
