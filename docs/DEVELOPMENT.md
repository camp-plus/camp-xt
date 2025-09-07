# DEVELOPMENT - CAMP-XT

Coding standards and contribution guide for CAMP-XT userscripts.

Overview
- Use modern ES6+ syntax. Keep modules self-contained and resilient to DOM changes.
- All userscripts must include `@updateURL` and `@downloadURL` pointing to jsDelivr: `https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@<tag-or-commit>/...`.
- Use semantic versioning in the `@version` header.

File structure
- Place site scripts under `scripts/<site>/`.
- Shared code goes under `shared/`.
- Config files live in `config/`.

Script template
- Use this header and basic structure:

```js
// ==UserScript==
// @name         CAMP-XT: [Site Name]
// @namespace    camp-xt/[site]
// @version      1.0.7
// @description  CAMP tools for [Site Name]
// @author       CAMP Team
// @match        https://[site].com/*
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/[site]/script.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/[site]/script.user.js

// NOTE: For predictable auto-updates, pin the CDN path to a tag or commit SHA instead of `@main`, e.g. `@v1.0.0` or `@<commit-sha>`.
// Recommended pattern for releases:
// 1) Create a lightweight tag: git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0
// 2) Update the @updateURL/@downloadURL to point to @v1.0.0 on jsDelivr for stable auto-updates.
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
```

Overlay integration
- Load `shared/camp-overlay.js` and `shared/camp-utils.js` dynamically if not present.
- Instantiate `const camp = new CAMPOverlay('Site Name', '1.0.0');` and register tools via `camp.addScript(...);`.

Error handling
- Wrap DOM interaction in try/catch blocks.
- Provide feedback via `camp._showToast()` and console logging.

Analytics
- Use `config/team-settings.json` to determine whether to enable console analytics.

Testing
- Test scripts on representative pages for each supported site.
- Pay attention to dynamic content (single-page apps) and use mutation observers or waitFor utilities.

Pull requests
- Include changelog entry and bump `@version`.
- Ensure `@updateURL`/`@downloadURL` unchanged and point to main branch raw URL.
