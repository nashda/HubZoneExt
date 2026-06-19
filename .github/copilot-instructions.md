# Copilot Instructions for HubZoneExt

## Project Overview

Chrome extension (Manifest V3) that identifies HubZone properties on Redfin, LoopNet, and Zillow. It queries the SBA HubZone map API and injects visual indicators showing whether a property is in a Qualified or Redesignated HubZone.

## Architecture

### Extension Flow

1. **Content scripts** (`redfin.js`, `loopnet.js`, `zillow.js`) extract property addresses from site-specific DOM elements
2. Address sent to **background service worker** (`background.js`) via `chrome.runtime.sendMessage`
3. Background script queries SBA API at `https://maps.certify.sba.gov/hubzone/map/search`
4. Response parsed → status is "Qualified" or "Redesignated"
5. Background script injects the corresponding indicator script (`*-qualified.js` or `*-redesignated.js`) via `chrome.scripting.executeScript`

### File Naming Convention

Each supported site has three files:
- `{site}.js` — content script that extracts addresses
- `{site}-qualified.js` — injected when HubZone status is Qualified
- `{site}-redesignated.js` — injected when HubZone status is Redesignated

## Key Conventions

- **No build system** — vanilla JavaScript, no bundler, no package.json. Load directly into Chrome via Developer Mode.
- **Consolidated indicator injection** — `background.js` handles all indicator injection via `chrome.scripting.executeScript` with inline functions. Site-specific selectors are defined in the `SELECTORS` map within the injected function.
- **MutationObserver for DOM changes** — injected indicators use `MutationObserver` to re-inject if the site repaints. Always check for existing `#hubzone` element before injecting.
- **Response caching** — API results are cached in `chrome.storage.local` with a 30-day expiry keyed by address.
- **Dynamic session management** — CSRF token is fetched dynamically from the SBA site. On auth failure, the session is refreshed and the request retried once.
- **Image assets** — stored in `/images/`. Referenced via `chrome.runtime.getURL()` in injected scripts. Icons are 20×20px.

## Testing

No automated tests. Manual testing workflow:
1. Load unpacked extension in `chrome://extensions` with Developer Mode enabled
2. Navigate to a property listing on Redfin, LoopNet, or Zillow
3. Verify the HubZone indicator icon appears next to the address
4. Check the browser console for address extraction logs and API responses

## Adding a New Site

1. Create `{site}.js` — extract address from the site's DOM and send via `chrome.runtime.sendMessage`
2. Create `{site}-qualified.js` and `{site}-redesignated.js` — inject indicator icon into the site's address container
3. Register the content script in `manifest.json` under `content_scripts`
4. Add the site's URL pattern to `host_permissions` and `web_accessible_resources`
