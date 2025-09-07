// ==UserScript==
// @name         CAMP-XT: Overlay Installer
// @namespace    camp-xt/installer
// @version      1.0.9
// @description  Installs the CAMP overlay into the page context (run-at document-start) — install this first.
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
// @updateURL    https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-installer.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/overlay-installer.user.js
// ==/UserScript==

(function () {
  'use strict';
  const w = window;
  if (window.CAMPOverlay && !w.CAMPOverlay) w.CAMPOverlay = window.CAMPOverlay;
  if (window.CAMPUtils && !w.CAMPUtils) w.CAMPUtils = window.CAMPUtils;
  if (!w.__CAMP_ready && w.CAMPOverlay) {
    try { w.__CAMP_ready = Promise.resolve(w.CAMPOverlay); } catch (e) { /* ignore */ }
  }
})();
