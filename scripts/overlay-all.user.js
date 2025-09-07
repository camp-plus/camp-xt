// ==UserScript==
// @name         CAMP-XT: All-in-One Installer
// @namespace    camp-xt/installer-all
// @version      1.0.7
// @description  Single userscript that installs the CAMP overlay (page context) and registers GitHub, Gmail, and Jira handlers. Install this first.
// @author       CAMP Team
// @match        https://github.com/*
// @match        https://mail.google.com/*
// @match        https://jira.atlassian.com/*
// @run-at       document-start
// @grant        none
// @noframes
// Note: Don't force page-context injection; let the manager choose (avoids CSP issues on some sites)
// @require      https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-utils.js
// @require      https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/shared/camp-overlay.js
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-all.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-all.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Bridge required overlay/utils to the actual page window so other scripts can access them
  (function bridgeToPage(){
    const w = window;
    if (window.CAMPOverlay && !w.CAMPOverlay) w.CAMPOverlay = window.CAMPOverlay;
    if (window.CAMPUtils && !w.CAMPUtils) w.CAMPUtils = window.CAMPUtils;
    if (!w.__CAMP_ready && w.CAMPOverlay) {
      try { w.__CAMP_ready = Promise.resolve(w.CAMPOverlay); } catch (e) { /* ignore */ }
    }
  })();

  // Register site handlers once overlay is ready. Ensure single instance per page.
  (async function registerHandlers(){
    try{
  const w = window;
      if(!(w.__CAMP_ready && w.__CAMP_ready.then)) return; // overlay not provided
      await w.__CAMP_ready;
      // ensure single instance
      if(!w.__CAMP_instance){
        w.__CAMP_instance = new w.CAMPOverlay(location.hostname, '1.0.7');
      }
      const camp = w.__CAMP_instance;

      // Helper: idempotent add by id
      const addIfMissing = (id, fn) => { if(camp.scripts.find(s=>s.id===id)) return; return fn(); };

      // GitHub handlers
      if(location.hostname.includes('github.com')){
  addIfMissing('camp-pr-quick-actions', () => camp.addScript('PR Quick Actions', 'Approve or request changes for PRs', () => { try { const approve = document.querySelector('button[data-hovercard-type="user"][aria-label*="Approve"]') || document.querySelector('button.js-merge-branch-action'); if (approve) { approve.click(); return true; } camp._showToast('No approve button found'); } catch (e) { console.error('PR Quick Actions error', e); void e; } }, { category: 'reviews', icon: '\u2705', hotkey: 'Control+Shift+1' }));

  addIfMissing('camp-copy-branch', () => camp.addScript('Copy Branch Name', 'Copy current branch name to clipboard', async () => { try { const el = document.querySelector('span.css-truncate-target') || document.querySelector('strong.branch-name'); const branch = el ? el.textContent.trim() : location.pathname.split('/').pop(); const ok = window.CAMPUtils && window.CAMPUtils.copyToClipboard ? await window.CAMPUtils.copyToClipboard(branch) : false; if (ok) camp._showToast('Branch copied to clipboard'); else camp._showToast('Copy failed', { level: 'error' }); } catch (e) { console.error('Copy Branch error', e); void e; } }, { category: 'productivity', icon: '\ud83d\udccb', hotkey: 'Control+Shift+B' }));

  addIfMissing('camp-review-enhancer', () => camp.addScript('Review Enhancer', 'Expand diffs and show file list toggles', () => { try { document.querySelectorAll('button.js-diff-load').forEach(b => b.click()); camp._showToast('Expanded diffs'); } catch (e) { console.error('Review Enhancer error', e); void e; } }, { category: 'ui', icon: '\ud83d\udd0d' }));
      }

      // Gmail handlers
  if(location.hostname.includes('mail.google.com')){
  addIfMissing('camp-insert-template', () => camp.addScript('Insert Template', 'Insert a canned response into compose', async () => { try { const compose = document.querySelector('div[role="dialog"] div[aria-label*="Message Body"]') || document.querySelector('div[aria-label="Message Body"]'); if (!compose) { camp._showToast('Compose window not found'); return; } const template = 'Hi team,\n\nThanks for the update. I will review and respond soon.\n\nBest,\n[CAMP]'; compose.focus(); document.execCommand('insertText', false, template); camp._showToast('Template inserted'); } catch (e) { console.error('Insert Template error', e); camp._showToast('Insert failed', { level: 'error' }); void e; } }, { category: 'productivity', icon: '✉️', hotkey: 'Control+Shift+I' }));

  addIfMissing('camp-bulk-archive', () => camp.addScript('Bulk Archive', 'Archive visible conversations', () => { try { const checks = document.querySelectorAll('div[role=checkbox][aria-checked="false"]'); if (!checks.length) { camp._showToast('No conversations selected'); return; } checks.forEach(c => c.click()); const archive = document.querySelector('div[aria-label*="Archive"]'); if (archive) archive.click(); camp._showToast('Archived selected'); } catch (e) { console.error('Bulk Archive error', e); camp._showToast('Bulk archive failed', { level: 'error' }); void e; } }, { category: 'data', icon: '🗄️' }));

  addIfMissing('camp-enhance-compose', () => camp.addScript('Enhance Compose', 'Open compose in a wider dialog', () => { try { const comp = document.querySelector('div[role="dialog"]'); if (!comp) { camp._showToast('Compose not open'); return; } comp.style.maxWidth = '900px'; camp._showToast('Compose widened'); } catch (e) { console.error('Enhance Compose error', e); void e; } }, { category: 'ui', icon: '🖊️' }));
      }

      // Jira handlers
      if(location.hostname.includes('jira.atlassian.com')){
  addIfMissing('camp-quick-create', () => camp.addScript('Quick Create', 'Open quick ticket creation dialog', () => { try { const newBtn = document.querySelector('button[id^="create"]') || document.querySelector('a#create_link'); if (newBtn) { newBtn.click(); camp._showToast('Opened create dialog'); } else camp._showToast('Create button not found'); } catch (e) { console.error('Quick Create error', e); void e; } }, { category: 'productivity', icon: '📝', hotkey: 'Control+Shift+N' }));

  addIfMissing('camp-change-status', () => camp.addScript('Change Status', 'Transition issue to next status', () => { try { const button = document.querySelector('button[aria-label="More actions"]') || document.querySelector('button#action_id_5'); if (button) { button.click(); camp._showToast('Opened transition menu'); } else camp._showToast('Transition control not found'); } catch (e) { console.error('Change Status error', e); void e; } }, { category: 'reviews', icon: '🔁' }));

  addIfMissing('camp-time-tracker', () => camp.addScript('Time Tracker', 'Insert quick 15m time log', () => { try { const comment = document.querySelector('textarea[name="comment"]'); if (comment) { comment.value = comment.value + '\nLogged 15m'; camp._showToast('Logged 15m'); } else camp._showToast('No comment box found'); } catch (e) { console.error('Time Tracker error', e); void e; } }, { category: 'data', icon: '⏱️' }));
      }

      // Show overlay after registering handlers
  setTimeout(()=>camp.show(), 1200);

  }catch(err){ console.error('overlay-all registerHandlers error',err); void err; }
  })();

})();
