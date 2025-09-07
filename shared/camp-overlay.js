/*
CAMPOverlay - Shared overlay system for CAMP-XT userscripts
Author: CAMP Team
Version: 1.0.0

Features implemented:
- Unified interface (top-right) with slide-in animation
- Categorized tools and run-all option
- Toast notifications
- Global hotkey (Ctrl+Shift+C) and per-tool hotkeys
- Auto-dismiss after 20s with 5s warning
- LocalStorage for preferences and dismissal tracking
- Basic analytics via console.log

This file is intended to be loaded by userscripts to provide the overlay UI.
*/

/* Guard and assign an anonymous class to window.CAMPOverlay.
  Using a class expression assigned to a property avoids creating a top-level
  lexical binding named `CAMPOverlay`, which can cause "redeclaration of let"
  SyntaxErrors when the same file is injected multiple times into the page.
*/
if (!window.CAMPOverlay || typeof window.CAMPOverlay !== 'function') {
  window.CAMPOverlay = class {
  constructor(siteName = 'Site', version = '1.0.0', options = {}) {
    this.siteName = siteName;
    this.version = version;
    this.scripts = [];
    this.categories = {};
    this.settings = Object.assign({
      enableAnalytics: true,
      autoDismissTimer: 20000,
      dismissWarning: 5000,
      overlayPosition: 'top-right',
      globalHotkey: 'Control+Shift+C',
      toastDuration: 3000
    }, options);
    this._init();
  }

  _init() {
    try {
      this._loadState();
      this._createContainer();
      this._registerGlobalHotkey();
      if (this.settings.enableAnalytics) console.log(`[CAMPOverlay] Initialized for ${this.siteName} v${this.version}`);
    } catch (e) {
      console.error('[CAMPOverlay] Init error', e);
    }
  }

  _loadState() {
    try {
      const key = `camp-overlay:${this.siteName}:settings`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.assign(this.settings, parsed);
      }
    } catch (e) {
      console.warn('[CAMPOverlay] Could not load settings', e);
    }
  }

  _saveState() {
    try {
      const key = `camp-overlay:${this.siteName}:settings`;
      localStorage.setItem(key, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[CAMPOverlay] Could not save settings', e);
    }
  }

  addScript(name, description, fn, opts = {}) {
    try {
      const entry = {
        id: `camp-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name,
        description,
        fn: fn,
        category: opts.category || 'uncategorized',
        icon: opts.icon || '🛠️',
        hotkey: opts.hotkey || null
      };
      this.scripts.push(entry);
      if (!this.categories[entry.category]) this.categories[entry.category] = [];
      this.categories[entry.category].push(entry);
      if (entry.hotkey) this._registerHotkey(entry.hotkey, entry);
      if (this.settings.enableAnalytics) console.log(`[CAMPOverlay] Registered script: ${name} (category: ${entry.category})`);
      return entry;
    } catch (e) {
      console.error('[CAMPOverlay] addScript error', e);
    }
  }

  _createContainer() {
    if (document.getElementById('camp-overlay-root')) return;
    const root = document.createElement('div');
    root.id = 'camp-overlay-root';
    root.innerHTML = this._getHTML();
    document.body.appendChild(root);
    this.root = root;
    this._attachEventHandlers();
    this._setupAutoDismiss();
  }

  _getHTML() {
    const palette = {
      primary: '#fa582d',
      teal: '#3d7068',
      light: '#ced3dc',
      bg: '#242038',
      surface: '#2f004f'
    };

    const styles = `
      #camp-overlay-root{position:fixed;z-index:999999;pointer-events:auto;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif}
      #camp-overlay-root .camp-overlay{width:360px;max-width:calc(100vw - 32px);background:${palette.surface};color:${palette.light};border-radius:12px;padding:12px;box-shadow:0 8px 30px rgba(0,0,0,0.6);transform:translate3d(20px,-20px,0) scale(0.98);opacity:0;transition:transform 350ms cubic-bezier(.2,.9,.3,1),opacity 250ms ease}
      #camp-overlay-root.top-right{top:16px;right:16px}
      #camp-overlay-root.top-left{top:16px;left:16px}
      #camp-overlay-root.show .camp-overlay{transform:translate3d(0,0,0) scale(1);opacity:1}
      .camp-header{display:flex;align-items:center;justify-content:space-between;padding:6px}
      .camp-title{font-weight:700;color:${palette.light};display:flex;align-items:center;gap:8px}
      .camp-actions button{background:${palette.primary};border:none;color:#fff;padding:6px 10px;border-radius:8px;cursor:pointer}
      .camp-categories{margin-top:8px;display:flex;flex-direction:column;gap:8px;max-height:400px;overflow:auto}
      .camp-category{border-top:1px solid rgba(255,255,255,0.04);padding-top:8px}
      .camp-category h4{margin:0 0 6px 0;color:${palette.teal};font-size:13px}
      .camp-tool{display:flex;align-items:center;justify-content:space-between;padding:8px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.04));border-radius:8px}
      .camp-tool .meta{display:flex;align-items:center;gap:8px}
      .camp-tool button{background:transparent;border:1px solid rgba(255,255,255,0.06);color:${palette.light};padding:6px 8px;border-radius:8px;cursor:pointer}
      .camp-footer{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,0.6)}
      .camp-toast{position:fixed;z-index:9999999;right:16px;bottom:16px;background:${palette.bg};color:${palette.light};padding:10px 14px;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.5);opacity:0;transform:translateY(12px);transition:all 300ms ease}
      .camp-toast.show{opacity:1;transform:translateY(0)}
    `;

    let html = `<style id="camp-overlay-styles">${styles}</style>`;
    html += `<div class="camp-overlay">
      <div class="camp-header">
        <div class="camp-title">🏕️ CAMP Extensions — ${this.siteName}</div>
        <div class="camp-actions">
          <button id="camp-run-all">Run All</button>
          <button id="camp-close">×</button>
        </div>
      </div>
      <div class="camp-categories">`;

    for (const cat of Object.keys(this.categories)) {
      const items = this.categories[cat];
      html += `<div class="camp-category"><h4>${cat}</h4>`;
      for (const t of items) {
        html += `<div class="camp-tool" id="${t.id}">
          <div class="meta"><div class="icon">${t.icon}</div><div class="info"><div class="name">${t.name}</div><div class="desc" style="font-size:12px;color:rgba(255,255,255,0.65)">${t.description}</div></div></div>
          <div class="controls"><button class="run">Run</button></div>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>
      <div class="camp-footer"><div>v${this.version}</div><div><a href="#" id="camp-settings" style="color:${palette.light};text-decoration:underline">Settings</a></div></div>
    </div>
    <div id="camp-toast" class="camp-toast" aria-live="polite"></div>`;

    const containerClass = `camp-overlay-container ${this.settings.overlayPosition}`;
    return `<div class="${containerClass}">${html}</div>`;
  }

  _attachEventHandlers() {
    try {
      const root = document.getElementById('camp-overlay-root');
      if (!root) return;
      root.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'camp-close') this.hide();
        if (e.target && e.target.id === 'camp-run-all') this.runAll();
        if (e.target && e.target.id === 'camp-settings') { e.preventDefault(); this.showSettings(); }
        if (e.target && e.target.classList && e.target.classList.contains('run')) {
          const toolEl = e.target.closest('.camp-tool');
          if (toolEl) this._runToolById(toolEl.id);
        }
      });

      document.addEventListener('keydown', (e) => {
        // Escape to close
        if (e.key === 'Escape') this.hide();
      });
    } catch (e) {
      console.error('[CAMPOverlay] Attach handlers error', e);
    }
  }

  _registerGlobalHotkey() {
    try {
      document.addEventListener('keydown', (e) => {
        const combo = [];
        if (e.ctrlKey) combo.push('Control');
        if (e.shiftKey) combo.push('Shift');
        if (e.altKey) combo.push('Alt');
        combo.push(e.key);
        const pressed = combo.join('+');
        if (pressed.toLowerCase() === this.settings.globalHotkey.toLowerCase()) {
          e.preventDefault();
          this.toggle();
        }
      });
    } catch (e) {
      console.error('[CAMPOverlay] Global hotkey registration failed', e);
    }
  }

  _registerHotkey(hotkey, entry) {
    try {
      document.addEventListener('keydown', (e) => {
        const combo = [];
        if (e.ctrlKey) combo.push('Control');
        if (e.shiftKey) combo.push('Shift');
        if (e.altKey) combo.push('Alt');
        combo.push(e.key);
        const pressed = combo.join('+');
        if (pressed.toLowerCase() === hotkey.toLowerCase()) {
          e.preventDefault();
          this._executeEntry(entry);
        }
      });
    } catch (e) {
      console.error('[CAMPOverlay] _registerHotkey error', e);
    }
  }

  _setupAutoDismiss() {
    try {
      clearTimeout(this._dismissTimer);
      this._dismissTimer = setTimeout(() => {
        this._showWarning();
        this._finalDismissTimer = setTimeout(() => this.hide(), this.settings.dismissWarning);
      }, this.settings.autoDismissTimer - this.settings.dismissWarning);
    } catch (e) {
      console.error('[CAMPOverlay] Auto-dismiss setup failed', e);
    }
  }

  _showWarning() {
    try {
      this._showToast('Overlay will auto-close in 5 seconds', { duration: this.settings.dismissWarning });
    } catch (e) {
      console.error('[CAMPOverlay] Show warning failed', e);
    }
  }

  _runToolById(id) {
    const entry = this.scripts.find(s => s.id === id);
    if (!entry) { this._showToast('Tool not found', { level: 'error' }); return; }
    this._executeEntry(entry);
  }

  _executeEntry(entry) {
    try {
      console.log(`[CAMPOverlay] Running ${entry.name}`);
      const start = Date.now();
      try {
        const res = entry.fn();
        if (res && res.then) {
          res.then(() => {
            this._showToast(`${entry.name} completed`);
            if (this.settings.enableAnalytics) console.log(`[CAMPOverlay] ${entry.name} async completed in ${Date.now() - start}ms`);
          }).catch(err => {
            this._showToast(`${entry.name} failed`, { level: 'error' });
            console.error('[CAMPOverlay] Script error', err);
          });
        } else {
          this._showToast(`${entry.name} completed`);
          if (this.settings.enableAnalytics) console.log(`[CAMPOverlay] ${entry.name} completed in ${Date.now() - start}ms`);
        }
      } catch (err) {
        this._showToast(`${entry.name} failed`, { level: 'error' });
        console.error('[CAMPOverlay] Script error', err);
      }
    } catch (e) {
      console.error('[CAMPOverlay] _executeEntry error', e);
    }
  }

  show() {
    try {
      const root = document.getElementById('camp-overlay-root');
      if (!root) this._createContainer();
      root.classList.add('show');
      this._setupAutoDismiss();
    } catch (e) {
      console.error('[CAMPOverlay] Show error', e);
    }
  }

  hide() {
    try {
      const root = document.getElementById('camp-overlay-root');
      if (root) root.classList.remove('show');
      clearTimeout(this._dismissTimer);
      clearTimeout(this._finalDismissTimer);
    } catch (e) {
      console.error('[CAMPOverlay] Hide error', e);
    }
  }

  toggle() { if (document.getElementById('camp-overlay-root') && document.getElementById('camp-overlay-root').classList.contains('show')) this.hide(); else this.show(); }

  runAll() {
    try {
      for (const s of this.scripts) this._executeEntry(s);
    } catch (e) {
      console.error('[CAMPOverlay] runAll error', e);
    }
  }

  _showToast(msg, opts = {}) {
    try {
      const toast = document.getElementById('camp-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      const dur = opts.duration || this.settings.toastDuration;
      if (this._toastTimer) clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => toast.classList.remove('show'), dur);
    } catch (e) {
      console.error('[CAMPOverlay] _showToast error', e);
    }
  }

  showSettings() {
    this._showToast('Settings not implemented in-overlay. Edit config/team-settings.json', { duration: 3000 });
  }
  };

  // Expose a simple version marker to help userscripts detect readiness/source
  try { window.CAMPOverlay.__CAMP_VERSION = '1.0.0'; } catch (e) { void e; }

  // Provide a readiness primitive so userscripts can `await window.__CAMP_ready` instead of polling.
  try { window.__CAMP_ready = Promise.resolve(window.CAMPOverlay); } catch (e) { void e; }
} else {
  try { console.info('[CAMPOverlay] already defined on window, skipping re-initialization'); } catch (e) { void e; }
}
