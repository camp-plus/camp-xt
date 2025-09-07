# CAMP-XT (CAMP Extensions)

CAMP-XT is a private, team-focused repository of ViolentMonkey userscripts and a shared in-page overlay (CAMPOverlay) that unifies productivity tooling across supported sites (GitHub, Gmail, Jira). The overlay provides a consistent UX for running small utilities, grouping tools into categories, and managing preferences.

🏕️ CAMP Extensions

## Quick start

- Install the single-file installer (recommended for most teams):

- [One-click install: overlay-all.user.js](https://raw.githubusercontent.com/camp-plus/camp-xt/main/scripts/overlay-all.user.js)

- Alternatively, install `scripts/overlay-installer.user.js` (defines the overlay) and then the per-site userscripts in `scripts/`.

## Usage

- Open the overlay via the configured hotkey (default: Ctrl+Shift+C) or call `camp.show()` from the console.
- The overlay groups utilities into categories and supports Run / Run All. Tools aim to be non-destructive by default.

## Developer notes

- The loader `shared/camp-loader.js` provides an idempotent injection and the readiness primitive `window.__CAMP_ready`.
- For stable installs, pin CDN URLs to a tag or commit SHA (jsDelivr) instead of using `@main`.

See `docs/DEVELOPMENT.md` for contributor and build instructions.

