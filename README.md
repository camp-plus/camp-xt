# CAMP-XT (CAMP Extensions)

CAMP-XT is a private, team-focused repository of ViolentMonkey userscripts and a shared overlay system that unifies productivity tooling across supported sites (GitHub, Gmail, Jira). It provides an elegant, modern overlay — CAMPOverlay — that lets your team run individual utilities, run all tools at once, and manage preferences. Designed for small development/productivity teams with auto-updating scripts, analytics, and a unified UX.

Emoji: 🏕️ CAMP Extensions

```markdown
# CAMP-XT

Lightweight userscripts and a shared in-page overlay (CAMPOverlay) for team productivity on GitHub, Gmail and Jira.

Quick start
- Install the single-file installer (recommended for most teams):
  - https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/overlay-all.user.js
- Alternatively, install `scripts/overlay-installer.user.js` (defines the overlay) and then the per-site userscripts in `scripts/*`.

Usage
- Open the overlay via the configured hotkey (default: Ctrl+Shift+C) or call camp.show() from the console.
- The overlay groups small utilities (Run, Run All, categories). Tools are non-destructive by default.

Developer notes
- For maintainers: the loader `shared/camp-loader.js` provides an idempotent injection and the readiness primitive `window.__CAMP_ready`.
- For stable installs, pin CDN URLs to a tag or commit SHA (jsDelivr) instead of using `@main`.

See `docs/DEVELOPMENT.md` for contributor and build instructions.

```

