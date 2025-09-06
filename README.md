# CAMP-XT (CAMP Extensions)

CAMP-XT is a private, team-focused repository of ViolentMonkey userscripts and a shared overlay system that unifies productivity tooling across supported sites (GitHub, Gmail, Jira). It provides an elegant, modern overlay — CAMPOverlay — that lets your team run individual utilities, run all tools at once, and manage preferences. Designed for small development/productivity teams with auto-updating scripts, analytics, and a unified UX.

Emoji: 🏕️ CAMP Extensions

## One-click install (raw URLs)
> Install via ViolentMonkey using the raw file URLs below (camp-plus organization, main branch).

- GitHub userscript
  - https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/github.com/github-tools.user.js
- Gmail userscript
  - https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/gmail.com/gmail-tools.user.js
- Jira userscript
  - https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/jira.atlassian.com/jira-tools.user.js

## Discovery bookmarklet
Copy-paste the following into a bookmark's URL field. Clicking it will open the CAMP Overlay Loader for the current site (if supported):

javascript:(function(){var s=document.createElement('script');s.src='https://raw.githubusercontent.com/camp-plus/camp-xt/main/installation/bookmarklet.js';document.body.appendChild(s);})();

## Feature highlights
- Unified CAMP overlay that appears on supported sites with a smooth slide-in animation
- Categorized tool organization (productivity, ui, data, reviews, etc.)
- Individual tool execution or "Run All" option
- Toast notifications, keyboard shortcuts, and analytics
- Auto-updating userscripts (via `@updateURL` / `@downloadURL`) and semantic versioning
- ViolentMonkey-first compatibility and clear team installation instructions

## Files created in this repository
The following files and folders were generated as part of the CAMP-XT initial setup and are present in this repository (all ready for use):

- README.md (this file)
- shared/
  - camp-overlay.js (main overlay system)
  - camp-utils.js (common utilities)
- scripts/
  - github.com/github-tools.user.js
  - gmail.com/gmail-tools.user.js
  - jira.atlassian.com/jira-tools.user.js
- config/
  - team-settings.json
  - sites.json
- installation/
  - INSTALL.md
  - bookmarklet.js
- docs/
  - DEVELOPMENT.md
  - API.md

## Installation (Team / ViolentMonkey)
1. Install ViolentMonkey in your browser (Chrome/Firefox/Edge supported).
2. Click one of the one-click install links above or create a new script and paste the contents from the raw URLs.
3. Allow the script to run on the matching host. The overlay will auto-initialize on supported pages.

Advanced team setup
- Host the repository privately under the `camp-plus` organization and share access with your team.
- Team leads can modify `config/team-settings.json` and `config/sites.json` to tune defaults.

## Quick usage
- Global overlay hotkey: Ctrl+Shift+C (configurable)
- Tool-level hotkeys supported (e.g. Ctrl+Shift+T)
- Tools auto-log usage to console (analytics) and persist preferences in localStorage / GM_* if available

## Development guidelines
- Follow the templates in `docs/DEVELOPMENT.md` when creating new scripts
- Use semantic versioning (MAJOR.MINOR.PATCH) in `@version` header
- Provide `@updateURL` and `@downloadURL` headers pointing to camp-plus/camp-xt/main
- Keep logic robust: handle missing DOM elements, catch errors, and provide toasts/console logs

## Configuration options
Key settings are available in `config/team-settings.json` and `config/sites.json`:
- enableAnalytics (bool)
- autoDismissTimer (ms)
- overlayPosition (string: top-right, top-left)
- globalHotkey (string)
- defaultUpdateCheck (hours)
- toastDuration (ms)

## Status
All initial repository generation tasks have been completed and the project files listed above are present. Completion: 100%.

<!-- No license and no contact information in accordance with project policy -->
