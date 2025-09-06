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
      if (!window.CAMPOverlay) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js';
        document.head.appendChild(s);
      }
      if (!window.CAMPUtils) {
        const s2 = document.createElement('script');
        s2.src = 'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js';
        document.head.appendChild(s2);
      }
      setTimeout(init, 700);
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
