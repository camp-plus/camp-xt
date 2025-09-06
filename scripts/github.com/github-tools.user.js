// ==UserScript==
// @name         CAMP-XT: GitHub
// @namespace    camp-xt/github.com
// @version      1.0.0
// @description  CAMP tools for GitHub
// @author       CAMP Team
// @match        https://github.com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/github.com/github-tools.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/github.com/github-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';

  const overlayCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js';
  const overlayRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';
  const utilsCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js';
  const utilsRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js';

  // appendScript will inject into page so the loaded script executes in page context (not the userscript sandbox)
  const appendScript = (src) => new Promise((resolve, reject) => {
    try {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = (e) => { s.remove(); reject(e); };
      // Use documentElement/head from the page
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
        lastErr = e;
        // try next
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
      // give browser a moment to execute then revoke
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 1000);
    }
  };

  const pageWindow = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  const ensureScripts = async () => {
    try {
      await loadScriptWithFallback([overlayCDN, overlayRaw]);
    } catch (e) {
      console.warn('[CAMP GitHub] overlay <script> failed, trying fetch+inject:', e);
      try { await fetchAndInject(overlayRaw); } catch (e2) { console.warn('[CAMP GitHub] fetch+inject overlay failed', e2); }
    }

    try {
      await loadScriptWithFallback([utilsCDN, utilsRaw]);
    } catch (e) {
      console.warn('[CAMP GitHub] utils <script> failed, trying fetch+inject:', e);
      try { await fetchAndInject(utilsRaw); } catch (e2) { console.warn('[CAMP GitHub] fetch+inject utils failed', e2); }
    }
  };

  const waitFor = async (predicate, timeoutMs = 3000, intervalMs = 200) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try { if (predicate()) return true; } catch (e) {}
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  };

  const init = async () => {
    try {
      await ensureScripts();

  const ok = await waitFor(() => pageWindow.CAMPOverlay && typeof pageWindow.CAMPOverlay === 'function', 4000, 200);
      if (!ok) {
        console.warn('[CAMP GitHub] CAMPOverlay not ready, attempting fetch+inject overlay raw');
        try { await fetchAndInject(overlayRaw); } catch (e) { console.warn('[CAMP GitHub] fetch+inject overlay failed', e); }
        await new Promise(r => setTimeout(r, 250));
      }

      if (!pageWindow.CAMPOverlay || typeof pageWindow.CAMPOverlay !== 'function') {
        console.error('[CAMP GitHub] CAMPOverlay not available; aborting init');
        return;
      }

      // CAMPUtils may be loaded alongside overlay; it's okay if it's not immediately available for some utilities
      const camp = new pageWindow.CAMPOverlay('GitHub', '1.0.0');

      camp.addScript('PR Quick Actions', 'Approve or request changes for PRs', () => {
        try {
          const approve = document.querySelector('button[data-hovercard-type="user"][aria-label*="Approve"]') || document.querySelector('button.js-merge-branch-action');
          if (approve) { approve.click(); return true; }
          camp._showToast('No approve button found');
        } catch (e) { console.error('PR Quick Actions error', e); }
      }, { category: 'reviews', icon: '\u2705', hotkey: 'Control+Shift+1' });

      camp.addScript('Copy Branch Name', 'Copy current branch name to clipboard', async () => {
        try {
          const el = document.querySelector('span.css-truncate-target') || document.querySelector('strong.branch-name');
          const branch = el ? el.textContent.trim() : pageWindow.location.pathname.split('/').pop();
          const ok2 = pageWindow.CAMPUtils && pageWindow.CAMPUtils.copyToClipboard ? await pageWindow.CAMPUtils.copyToClipboard(branch) : false;
          if (ok2) camp._showToast('Branch copied to clipboard');
          else camp._showToast('Copy failed', { level: 'error' });
        } catch (e) { console.error('Copy Branch error', e); }
      }, { category: 'productivity', icon: '\ud83d\udccb', hotkey: 'Control+Shift+B' });

      camp.addScript('Review Enhancer', 'Expand diffs and show file list toggles', () => {
        try {
          document.querySelectorAll('button.js-diff-load').forEach(b => b.click());
          camp._showToast('Expanded diffs');
        } catch (e) { console.error('Review Enhancer error', e); }
      }, { category: 'ui', icon: '\ud83d\udd0d' });

      setTimeout(() => camp.show(), 1000);
    } catch (e) {
      console.error('CAMP GitHub init error', e);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
