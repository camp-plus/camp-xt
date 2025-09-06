// ==UserScript==
// @name         CAMP-XT: Gmail
// @namespace    camp-xt/gmail.com
// @version      1.0.0
// @description  CAMP tools for Gmail
// @author       CAMP Team
// @match        https://mail.google.com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/gmail.com/gmail-tools.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/gmail.com/gmail-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';
  const load = () => {
    try {
      // Robust loader: prefer CDN (jsDelivr), fall back to raw, and if the browser blocks execution due to
      // MIME / nosniff headers, fetch the raw text and inject it as a Blob (type: text/javascript).
      const loadScriptWithFallback = (list, cb) => {
        if (!list || list.length === 0) { cb(new Error('No sources')); return; }
        const src = list[0];
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => cb(null, src);
        s.onerror = () => { s.remove(); if (list.length > 1) loadScriptWithFallback(list.slice(1), cb); else cb(new Error('All sources failed')); };
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

      const overlayCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js';
      const overlayRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';
      const utilsCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js';
      const utilsRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js';

      loadScriptWithFallback([overlayCDN, overlayRaw], async (err) => {
        if (err) {
          console.warn('Overlay <script> load failed, attempting fetch+inject:', err);
          try { await fetchAndInject(overlayRaw); } catch (e) { console.warn('fetch+inject overlay failed', e); }
        }

        loadScriptWithFallback([utilsCDN, utilsRaw], async (err2) => {
          if (err2) {
            console.warn('Utils <script> load failed, attempting fetch+inject:', err2);
            try { await fetchAndInject(utilsRaw); } catch (e2) { console.warn('fetch+inject utils failed', e2); }
          }
          setTimeout(init, 800);
        });
      });

    } catch (e) { console.error('CAMP Gmail load error', e); }
  };

  const init = () => {
    try {
      const camp = new window.CAMPOverlay('Gmail', '1.0.0');

      camp.addScript('Insert Template', 'Insert a canned response into compose', async () => {
        try {
          const compose = document.querySelector('div[role="dialog"] div[aria-label*="Message Body"]') || document.querySelector('div[aria-label="Message Body"]');
          if (!compose) { camp._showToast('Compose window not found'); return; }
          const template = 'Hi team,\n\nThanks for the update. I will review and respond soon.\n\nBest,\n[CAMP]';
          // Insert at caret
          compose.focus();
          document.execCommand('insertText', false, template);
          camp._showToast('Template inserted');
        } catch (e) { console.error('Insert Template error', e); camp._showToast('Insert failed', { level: 'error' }); }
      }, { category: 'productivity', icon: '✉️', hotkey: 'Control+Shift+I' });

      camp.addScript('Bulk Archive', 'Archive visible conversations', () => {
        try {
          const checks = document.querySelectorAll('div[role=checkbox][aria-checked="false"]');
          if (!checks.length) { camp._showToast('No conversations selected'); return; }
          checks.forEach(c => c.click());
          const archive = document.querySelector('div[aria-label*="Archive"]');
          if (archive) archive.click();
          camp._showToast('Archived selected');
        } catch (e) { console.error('Bulk Archive error', e); camp._showToast('Bulk archive failed', { level: 'error' }); }
      }, { category: 'data', icon: '🗄️' });

      camp.addScript('Enhance Compose', 'Open compose in a wider dialog', () => {
        try {
          const comp = document.querySelector('div[role="dialog"]');
          if (!comp) { camp._showToast('Compose not open'); return; }
          comp.style.maxWidth = '900px';
          camp._showToast('Compose widened');
        } catch (e) { console.error('Enhance Compose error', e); }
      }, { category: 'ui', icon: '🖊️' });

      setTimeout(() => camp.show(), 1200);
    } catch (e) { console.error('CAMP Gmail init error', e); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
