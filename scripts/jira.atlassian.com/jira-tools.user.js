// ==UserScript==
// @name         CAMP-XT: Jira
// @namespace    camp-xt/jira.atlassian.com
// @version      1.0.0
// @description  CAMP tools for Jira
// @author       CAMP Team
// @match        https://jira.atlassian.com/*
// @updateURL    https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/jira.atlassian.com/jira-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/jira.atlassian.com/jira-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';
  const load = () => {
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

      if (!window.CAMPOverlay) {
        loadScriptWithFallback([
          'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js',
          'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js'
        ], (err) => {
          if (err) console.warn('Failed to load camp-overlay:', err);
          if (!window.CAMPUtils) {
            loadScriptWithFallback([
              'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js',
              'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js'
            ], (err2) => {
              if (err2) console.warn('Failed to load camp-utils:', err2);
              setTimeout(init, 700);
            });
          } else setTimeout(init, 700);
        });
      } else if (!window.CAMPUtils) {
        loadScriptWithFallback([
          'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js',
          'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js'
        ], (err2) => {
          if (err2) console.warn('Failed to load camp-utils:', err2);
          setTimeout(init, 700);
        });
      } else setTimeout(init, 700);

    } catch (e) { console.error('CAMP Jira load error', e); }
  };

  const init = () => {
    try {
      const camp = new window.CAMPOverlay('Jira', '1.0.0');

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
