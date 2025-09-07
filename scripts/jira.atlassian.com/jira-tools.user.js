// ==UserScript==
// @name         CAMP-XT: Jira
// @namespace    camp-xt/jira.atlassian.com
// @version      1.0.0
// @description  CAMP tools for Jira
// @author       CAMP Team
// @match        https://jira.atlassian.com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/scripts/jira.atlassian.com/jira-tools.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/scripts/jira.atlassian.com/jira-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';

/* global unsafeWindow */
  const load = async () => {
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

  const loaderCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-loader.js';
  const loaderRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-loader.js';
  const utilsCDN = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-utils.js';
  const utilsRaw = 'https://raw.githubusercontent.com/camp-plus/camp-xt/157c87e9f39d2721dd50084e1841eb7b7ac61107/shared/camp-utils.js';

      try {
        await new Promise((resolve, reject) => { loadScriptWithFallback([loaderCDN, loaderRaw], (err) => err ? reject(err) : resolve()); });
      } catch (e) {
        console.warn('Jira: camp-loader failed, attempting fetch+inject loader raw', e);
        try { await fetchAndInject(loaderRaw); } catch (e2) { console.warn('Jira: fetch+inject loader failed', e2); }
      }

      try {
        await new Promise((resolve, reject) => { loadScriptWithFallback([utilsCDN, utilsRaw], (err) => err ? reject(err) : resolve()); });
      } catch (e) {
        console.warn('Jira: utils failed, attempting fetch+inject', e);
        try { await fetchAndInject(utilsRaw); } catch (e2) { console.warn('Jira: fetch+inject utils failed', e2); }
      }

      setTimeout(init, 700);

    } catch (e) { console.error('CAMP Jira load error', e); }
  };

  const init = async () => {
    try {
      const pageWindow = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
      try {
        if (pageWindow.__CAMP_ready && pageWindow.__CAMP_ready.then) await pageWindow.__CAMP_ready;
      } catch (e) { console.warn('waiting for pageWindow.__CAMP_ready failed', e); }

      const CampOverlayCtor = pageWindow && pageWindow.CAMPOverlay;
      if (!CampOverlayCtor || typeof CampOverlayCtor !== 'function') {
        console.warn('CAMPOverlay not available on pageWindow after readiness wait; will retry shortly');
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
