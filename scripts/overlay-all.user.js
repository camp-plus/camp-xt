// ==UserScript==
// @name         CAMP-XT: All-in-One Installer
// @namespace    camp-xt/installer-all
// @version      1.0.2
// @description  Single userscript that installs the CAMP overlay (page context) and registers GitHub, Gmail, and Jira handlers. Install this first.
// @author       CAMP Team
// @match        https://github.com/*
// @match        https://mail.google.com/*
// @match        https://jira.atlassian.com/*
// @run-at       document-start
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-all.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-all.user.js
// ==/UserScript==

(function () {
  'use strict';

  // If overlay already exists, skip redeclaring the class
  if (!window.CAMPOverlay || typeof window.CAMPOverlay !== 'function') {
    // Minimal inline overlay class (trimmed version of shared overlay)
    window.CAMPOverlay = class {
  constructor(siteName = 'Site', version = '1.0.2', options = {}) {
        this.siteName = siteName; this.version = version; this.scripts = []; this.categories = {};
        this.settings = Object.assign({enableAnalytics:true,autoDismissTimer:20000,dismissWarning:5000,overlayPosition:'top-right',globalHotkey:'Control+Shift+C',toastDuration:3000}, options);
        this._init();
      }
      _init(){ try{ this._createContainer(); if(this.settings.enableAnalytics) console.log(`[CAMPOverlay] Initialized for ${this.siteName} v${this.version}`);}catch(e){console.error('[CAMPOverlay] Init error',e);} }
      addScript(name,description,fn,opts={}){ try{ const entry={ id:`camp-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, name, description, fn, category:opts.category||'uncategorized', icon:opts.icon||'🛠️', hotkey:opts.hotkey||null }; this.scripts.push(entry); if(!this.categories[entry.category]) this.categories[entry.category]=[]; this.categories[entry.category].push(entry); if(entry.hotkey) this._registerHotkey(entry.hotkey,entry); if(this.settings.enableAnalytics) console.log(`[CAMPOverlay] Registered script: ${name} (category: ${entry.category})`); return entry;}catch(e){console.error('[CAMPOverlay] addScript error',e);} }
      _getHTML(){ const styles = `#camp-overlay-root{position:fixed;z-index:999999;pointer-events:auto;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif} #camp-overlay-root .camp-overlay{width:360px;max-width:calc(100vw - 32px);background:#2f004f;color:#ced3dc;border-radius:12px;padding:12px;box-shadow:0 8px 30px rgba(0,0,0,0.6);transform:translate3d(20px,-20px,0) scale(0.98);opacity:0;transition:transform .35s,opacity .25s;} #camp-overlay-root.top-right{top:16px;right:16px} #camp-overlay-root.show .camp-overlay{transform:translate3d(0,0,0) scale(1);opacity:1} .camp-header{display:flex;align-items:center;justify-content:space-between;padding:6px} .camp-title{font-weight:700;color:#ced3dc} .camp-actions button{background:#fa582d;border:none;color:#fff;padding:6px 10px;border-radius:8px;cursor:pointer} .camp-categories{margin-top:8px;display:flex;flex-direction:column;gap:8px;max-height:400px;overflow:auto} .camp-tool{display:flex;align-items:center;justify-content:space-between;padding:8px;border-radius:8px}`;
        let html=`<style id="camp-overlay-styles">${styles}</style>`;
        html+=`<div class="camp-overlay"><div class="camp-header"><div class="camp-title">🏕️ CAMP Extensions — ${this.siteName}</div><div class="camp-actions"><button id="camp-run-all">Run All</button><button id="camp-close">×</button></div></div><div class="camp-categories">`;
        for (const cat of Object.keys(this.categories)) {
          const items = this.categories[cat];
          html += `<div class="camp-category"><h4>${cat}</h4>`;
          for (const t of items) {
            html += `<div class="camp-tool" id="${t.id}"><div class="meta"><div class="icon">${t.icon}</div><div class="info"><div class="name">${t.name}</div><div class="desc" style="font-size:12px;color:rgba(255,255,255,0.65)">${t.description}</div></div></div><div class="controls"><button class="run">Run</button></div></div>`;
          }
          html += `</div>`;
        }
        html+=`</div><div class="camp-footer"><div>v${this.version}</div><div><a href="#" id="camp-settings" style="color:#ced3dc;text-decoration:underline">Settings</a></div></div></div><div id="camp-toast" class="camp-toast" aria-live="polite"></div>`;
        const containerClass=`camp-overlay-container ${this.settings.overlayPosition}`; return `<div class="${containerClass}">${html}</div>`;
      }
      _createContainer(){ if(document.getElementById('camp-overlay-root')) return; const root=document.createElement('div'); root.id='camp-overlay-root'; root.innerHTML=this._getHTML(); document.body.appendChild(root); this.root=root; this._attachEventHandlers(); }
      _attachEventHandlers(){ try{ const root=document.getElementById('camp-overlay-root'); if(!root) return; root.addEventListener('click',(e)=>{ if(e.target&&e.target.id==='camp-close')this.hide(); if(e.target&&e.target.id==='camp-run-all')this.runAll(); if(e.target&&e.target.id==='camp-settings'){ e.preventDefault(); this.showSettings(); } if(e.target&&e.target.classList&&e.target.classList.contains('run')){ const toolEl=e.target.closest('.camp-tool'); if(toolEl) this._runToolById(toolEl.id); } }); document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') this.hide(); }); }catch(e){console.error('[CAMPOverlay] Attach handlers error',e);} }
      _registerHotkey(hotkey,entry){ try{ document.addEventListener('keydown',(e)=>{ const combo=[]; if(e.ctrlKey) combo.push('Control'); if(e.shiftKey) combo.push('Shift'); if(e.altKey) combo.push('Alt'); combo.push(e.key); const pressed=combo.join('+'); if(pressed.toLowerCase()===hotkey.toLowerCase()){ e.preventDefault(); this._executeEntry(entry); } }); }catch(e){console.error('[CAMPOverlay] _registerHotkey error',e);} }
      _showToast(msg,opts={}){ try{ const toast=document.getElementById('camp-toast'); if(!toast) return; toast.textContent=msg; toast.classList.add('show'); const dur=opts.duration||this.settings.toastDuration; if(this._toastTimer) clearTimeout(this._toastTimer); this._toastTimer=setTimeout(()=>toast.classList.remove('show'),dur);}catch(e){console.error('[CAMPOverlay] _showToast error',e);} }
      _runToolById(id){ const entry=this.scripts.find(s=>s.id===id); if(!entry){ this._showToast('Tool not found',{level:'error'}); return; } this._executeEntry(entry); }
      _executeEntry(entry){ try{ if(this.settings.enableAnalytics) console.log(`[CAMPOverlay] Running ${entry.name}`); const start=Date.now(); try{ const res=entry.fn(); if(res&&res.then){ res.then(()=>{ this._showToast(`${entry.name} completed`); if(this.settings.enableAnalytics) console.log(`[CAMPOverlay] ${entry.name} async completed in ${Date.now()-start}ms`); }).catch(err=>{ this._showToast(`${entry.name} failed`,{level:'error'}); console.error('[CAMPOverlay] Script error',err); }); } else { this._showToast(`${entry.name} completed`); if(this.settings.enableAnalytics) console.log(`[CAMPOverlay] ${entry.name} completed in ${Date.now()-start}ms`); } }catch(err){ this._showToast(`${entry.name} failed`,{level:'error'}); console.error('[CAMPOverlay] Script error',err);} }catch(e){console.error('[CAMPOverlay] _executeEntry error',e);} }
      show(){ try{ const root=document.getElementById('camp-overlay-root'); if(!root) this._createContainer(); root.classList.add('show'); this._setupAutoDismiss(); }catch(e){console.error('[CAMPOverlay] Show error',e);} }
      hide(){ try{ const root=document.getElementById('camp-overlay-root'); if(root) root.classList.remove('show'); clearTimeout(this._dismissTimer); clearTimeout(this._finalDismissTimer); }catch(e){console.error('[CAMPOverlay] Hide error',e);} }
      toggle(){ if(document.getElementById('camp-overlay-root')&&document.getElementById('camp-overlay-root').classList.contains('show')) this.hide(); else this.show(); }
      runAll(){ try{ for(const s of this.scripts) this._executeEntry(s);}catch(e){console.error('[CAMPOverlay] runAll error',e);} }
      showSettings(){ this._showToast('Settings not implemented in-overlay. Edit config/team-settings.json',{duration:3000}); }
    };

  try { window.CAMPOverlay.__CAMP_VERSION = '1.0.2'; } catch (e) { void e; }
  try { window.__CAMP_ready = Promise.resolve(window.CAMPOverlay); } catch (e) { void e; }
  }

  // Register site handlers once overlay is ready. Ensure single instance per page.
  (async function registerHandlers(){
    try{
      if(!(window.__CAMP_ready && window.__CAMP_ready.then)) return; // overlay not provided
      await window.__CAMP_ready;
      // ensure single instance
      if(!window.__CAMP_instance){
  window.__CAMP_instance = new window.CAMPOverlay(location.hostname, '1.0.2');
      }
      const camp = window.__CAMP_instance;

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
      setTimeout(()=>camp.show(),1200);

  }catch(err){ console.error('overlay-all registerHandlers error',err); void err; }
  })();

})();
