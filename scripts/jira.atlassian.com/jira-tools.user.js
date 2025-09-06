// ==UserScript==
// @name         CAMP-XT: Jira
// @namespace    camp-xt/jira.atlassian.com
// @version      1.0.0
// @description  CAMP tools for Jira
// @author       CAMP Team
// @match        https://jira.atlassian.com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/jira.atlassian.com/jira-tools.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/jira.atlassian.com/jira-tools.user.js
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
          setTimeout(init, 700);
        });
      });

    } catch (e) { console.error('CAMP Jira load error', e); }
  };

  const init = () => {
    try {
      const pageWindow = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
      const CampOverlayCtor = pageWindow && pageWindow.CAMPOverlay;

      if (!CampOverlayCtor) {
        console.warn('CAMPOverlay not found on pageWindow, retrying...');
        setTimeout(init, 500);
        return;
      }

      const camp = new CampOverlayCtor('Jira', '1.0.0');

      camp.addScript('Quick Create', 'Open quick ticket creation dialog', () => {
        try {
          const newBtn = document.querySelector('button[id^="create"]') || document.querySelector('a#create_link');
          if (newBtn) { newBtn.click(); camp._showToast('Opened create dialog'); }
          else camp._showToast('Create button not found');
        } catch (e) { console.error('Quick Create error', e); }
      }, { category: 'productivity', icon: '📝', hotkey: 'Control+Shift+N' });

      camp.addScript('Change Status', 'Transition issue to next status', () => {
        try {
          const button = document.querySelector('button[aria-label="More actions"]') || document.querySelector('button#action_id_5');
          if (button) { button.click(); camp._showToast('Opened transition menu'); } else camp._showToast('Transition control not found');
        } catch (e) { console.error('Change Status error', e); }
      }, { category: 'reviews', icon: '🔁' });

      camp.addScript('Time Tracker', 'Insert quick 15m time log', () => {
        try {
          const comment = document.querySelector('textarea[name="comment"]');
          if (comment) { comment.value = comment.value + '\nLogged 15m'; camp._showToast('Logged 15m'); }
          else camp._showToast('No comment box found');
        } catch (e) { console.error('Time Tracker error', e); }
      }, { category: 'data', icon: '⏱️' });

      setTimeout(() => camp.show(), 900);
    } catch (e) { console.error('CAMP Jira init error', e); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
