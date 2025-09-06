// ==UserScript==
// @name         CAMP-XT: Gmail
// @namespace    camp-xt/gmail.com
// @version      1.0.0
// @description  CAMP tools for Gmail
// @author       CAMP Team
// @match        https://mail.google.com/*
// @updateURL    https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/gmail.com/gmail-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/gmail.com/gmail-tools.user.js
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
        s.src = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js';
        document.head.appendChild(s);
      }
      if (!window.CAMPUtils) {
        const s2 = document.createElement('script');
        s2.src = 'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js';
        document.head.appendChild(s2);
      }
      setTimeout(init, 800);
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
