/*
Common utilities for CAMP-XT userscripts
Author: CAMP Team
*/

const CAMPUtils = {
  log: function (...args) {
    if (window.console) console.log('[CAMP]', ...args);
  },
  error: function (...args) {
    if (window.console) console.error('[CAMP]', ...args);
  },
  saveSetting: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { this.error('saveSetting error', e); }
  },
  loadSetting: function (key, defaultValue) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultValue; } catch (e) { this.error('loadSetting error', e); return defaultValue; }
  },
  copyToClipboard: async function (text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); return true;
    } catch (e) { this.error('copyToClipboard failed', e); return false; }
  },
  waitFor: function (selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const i = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) { clearInterval(i); resolve(el); }
        if (Date.now() - start > timeout) { clearInterval(i); reject(new Error('timeout')); }
      }, 250);
    });
  }
};

window.CAMPUtils = CAMPUtils;
