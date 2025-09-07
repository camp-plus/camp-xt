# INSTALL - CAMP-XT (ViolentMonkey team setup)

This guide explains how to install CAMP-XT userscripts for your team using ViolentMonkey.

Prerequisites
- A modern browser (Chrome, Firefox, Edge) with ViolentMonkey installed.
- Access to the private `camp-plus/camp-xt` repository (main branch).

One-click install
- Open ViolentMonkey dashboard and choose "Create new script" then paste the contents from the raw URL below and save.

CDN URLs (jsDelivr, recommended):
- https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/github.com/github-tools.user.js
- https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/gmail.com/gmail-tools.user.js
- https://cdn.jsdelivr.net/gh/camp-plus/camp-xt@main/scripts/jira.atlassian.com/jira-tools.user.js

Note: For stability you can pin to a tag or commit SHA instead of `@main`, e.g. `@v1.0.0` or `@<commit-sha>`.

Manual install
1. In ViolentMonkey, click the + (Add) button.
2. Paste one of the raw script URLs into the editor or paste file contents.
3. Save the script and ensure it's enabled.

Team configuration
- Edit `config/team-settings.json` in the repository to change default behavior (analytics, timers, hotkeys).
- Update `config/sites.json` to add or modify supported sites.

Uninstall instructions
- Open ViolentMonkey dashboard, find the CAMP-XT scripts, and disable or delete them.
- Remove any injected scripts from the page by reloading.

<!-- Bookmarklet removed: no longer supported or used -->

Security
- Scripts run with access to page DOM. Keep repository private and limit access to trusted team members.
