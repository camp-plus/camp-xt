const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const overlaySrc = fs.readFileSync(path.join(__dirname, '..', 'shared', 'camp-overlay.js'), 'utf8');
    const utilsSrc = fs.readFileSync(path.join(__dirname, '..', 'shared', 'camp-utils.js'), 'utf8');

    const dom = new JSDOM(`<!doctype html><html><head></head><body></body></html>`, { runScripts: 'dangerously', resources: 'usable' });
    const { window } = dom;

    // Provide a tiny localStorage shim for JSDOM so overlay load/save logic runs without noisy ReferenceErrors.
    if (!window.localStorage) {
      const store = {};
      window.localStorage = {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
      };
    }

    // inject utils and overlay into the JSDOM window
    const elUtils = dom.window.document.createElement('script');
    elUtils.textContent = utilsSrc;
    dom.window.document.head.appendChild(elUtils);

    const elOverlay = dom.window.document.createElement('script');
    elOverlay.textContent = overlaySrc;
    dom.window.document.head.appendChild(elOverlay);

    // allow execution
    await new Promise(r => setTimeout(r, 200));

    if (!dom.window.CAMPOverlay) throw new Error('CAMPOverlay not defined');
    if (!dom.window.CAMPUtils) throw new Error('CAMPUtils not defined');

    const c = new dom.window.CAMPOverlay('smoke', '0.0.0');
    c.addScript('test', 'no-op', () => true);
    c.show();

    console.log('smoke: overlay instantiated and basic API works');
    process.exit(0);
  } catch (e) {
    console.error('smoke test failed', e);
    process.exit(2);
  }
})();
