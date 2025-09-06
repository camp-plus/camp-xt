# API - CAMPOverlay

This document describes the public API for the CAMPOverlay class used by CAMP-XT userscripts.

Constructor
- `new CAMPOverlay(siteName, version, options)`
  - siteName: string — friendly name for the site (e.g. 'GitHub')
  - version: string — semantic version (e.g. '1.0.0')
  - options: object — optional settings to override defaults

Default options
- enableAnalytics: true
- autoDismissTimer: 20000
- dismissWarning: 5000
- overlayPosition: 'top-right'
- globalHotkey: 'Control+Shift+C'
- toastDuration: 3000

Methods
- `addScript(name, description, fn, opts)`
  - Registers a tool for display in the overlay.
  - name: string
  - description: string
  - fn: function — executed when user clicks Run
  - opts: object — {category, icon, hotkey}
  - Returns the registered entry object.

- `show()` — Display the overlay.
- `hide()` — Hide the overlay.
- `toggle()` — Toggle visibility.
- `runAll()` — Executes all registered tools in sequence (fire-and-forget).

Events & Hotkeys
- Global hotkey is registered via the `globalHotkey` option (defaults to Ctrl+Shift+C).
- Tool hotkeys can be set via the `hotkey` option when calling `addScript`.

Storage
- User preferences stored in localStorage under key `camp-overlay:<siteName>:settings`.

Toasts
- Use `camp._showToast(message, opts)` for quick feedback. opts: {duration, level}

Notes
- The overlay injects CSS inline and uses a top-right fixed position by default.
- Analytics are basic console logs; teams can extend this to remote tracking if desired.

Example
```js
const camp = new CAMPOverlay('GitHub', '1.0.0');
camp.addScript('Copy Branch', 'Copy current branch', async ()=>{ /*...*/ }, {category:'productivity', icon:'📋', hotkey:'Control+Shift+B'});
camp.show();
```
