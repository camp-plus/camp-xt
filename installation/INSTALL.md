# INSTALL - CAMP-XT (ViolentMonkey team setup)

This guide explains how to install CAMP-XT userscripts for your team using ViolentMonkey.

Prerequisites
- A modern browser (Chrome, Firefox, Edge) with ViolentMonkey installed.
- Access to the private `camp-plus/camp-xt` repository (main branch).

One-click install
- Open ViolentMonkey dashboard and choose "Create new script" then paste the contents from the raw URL below and save.

Raw URLs (team repository, main branch):
- https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/github.com/github-tools.user.js
- https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/gmail.com/gmail-tools.user.js
- https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/jira.atlassian.com/jira-tools.user.js

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

Bookmarklet
- Use the bookmarklet in the README to load CAMP overlay quickly on supported pages.

Security
- Scripts run with access to page DOM. Keep repository private and limit access to trusted team members.
