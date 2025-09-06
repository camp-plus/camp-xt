// ==UserScript==
// @name         CAMP-XT: GitHub
// @namespace    camp-xt/github.com
// @version      1.0.0
// @description  CAMP tools for GitHub
// @author       CAMP Team
// @match        https://github.com/*
// @updateURL    https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/github.com/github-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/github.com/github-tools.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';
  // Load shared overlay and utils with fallback sources
  const load = () => {
    try {
      const loadScriptWithFallback = (list, cb) => {
        if (!list || list.length === 0) { cb(new Error('No sources')); return; }
        const src = list[0];
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => cb(null, src);
        s.onerror = () => {
          // Remove the failed script element
          s.remove();
          if (list.length > 1) loadScriptWithFallback(list.slice(1), cb); else cb(new Error('All sources failed'));
        };
        document.head.appendChild(s);
      };

      // overlay first
      if (!window.CAMPOverlay) {
        loadScriptWithFallback([
          'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-overlay.js',
          'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js'
        ], (err) => {
          if (err) console.warn('Failed to load camp-overlay:', err);
          // then utils
          if (!window.CAMPUtils) {
            loadScriptWithFallback([
              'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js',
              'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js'
            ], (err2) => {
              if (err2) console.warn('Failed to load camp-utils:', err2);
              setTimeout(init, 500);
            });
          } else setTimeout(init, 500);
        });
      } else if (!window.CAMPUtils) {
        loadScriptWithFallback([
          'https://raw.githubusercontent.com/camp-plus/camp-xt/main/shared/camp-utils.js',
          'https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js'
        ], (err2) => {
          if (err2) console.warn('Failed to load camp-utils:', err2);
          setTimeout(init, 500);
        });
      } else setTimeout(init, 500);

    } catch (e) { console.error('CAMP GitHub load error', e); }
  };

  const init = () => {
    try {
      const camp = new window.CAMPOverlay('GitHub', '1.0.0');

      camp.addScript('PR Quick Actions', 'Approve or request changes for PRs', () => {
        try {
          // Basic action: click first approve button if present
          const approve = document.querySelector('button[data-hovercard-type="user"][aria-label*="Approve"]') || document.querySelector('button.js-merge-branch-action');
          if (approve) { approve.click(); return true; }
          camp._showToast('No approve button found');
        } catch (e) { console.error('PR Quick Actions error', e); }
      }, { category: 'reviews', icon: '✅', hotkey: 'Control+Shift+1' });

      camp.addScript('Copy Branch Name', 'Copy current branch name to clipboard', async () => {
        try {
          const el = document.querySelector('span.css-truncate-target') || document.querySelector('strong.branch-name');
          const branch = el ? el.textContent.trim() : window.location.pathname.split('/').pop();
          const ok = await window.CAMPUtils.copyToClipboard(branch);
          if (ok) camp._showToast('Branch copied to clipboard');
          else camp._showToast('Copy failed', { level: 'error' });
        } catch (e) { console.error('Copy Branch error', e); }
      }, { category: 'productivity', icon: '📋', hotkey: 'Control+Shift+B' });

      camp.addScript('Review Enhancer', 'Expand diffs and show file list toggles', () => {
        try {
          document.querySelectorAll('button.js-diff-load').forEach(b => b.click());
          camp._showToast('Expanded diffs');
        } catch (e) { console.error('Review Enhancer error', e); }
      }, { category: 'ui', icon: '🔍' });

      // Show overlay shortly after load
      setTimeout(() => camp.show(), 1000);
    } catch (e) {
      console.error('CAMP GitHub init error', e);
    }
  };

  // Smart timing: wait until DOM is interactive
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
