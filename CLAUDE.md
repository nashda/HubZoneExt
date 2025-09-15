# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HubZoneExt is a Chrome extension that identifies HubZone properties on real estate websites (Redfin, LoopNet, and Zillow). It queries the SBA HubZone map API to determine if a property address is in a qualified or redesignated HubZone and displays visual indicators on the listing pages.

## Architecture

### Core Components

- **background.js**: Service worker that handles API communication with SBA HubZone map service
- **Content Scripts**: Site-specific address extraction and injection logic
  - `redfin.js`, `loopnet.js`, `zillow.js`: Extract addresses from each site's DOM
  - `*-qualified.js`, `*-redesignated.js`: Inject visual indicators based on HubZone status

### Extension Flow

1. Content scripts extract property addresses from real estate listing pages
2. Address is sent to background script via `chrome.runtime.sendMessage`
3. Background script queries SBA HubZone API at `https://maps.certify.sba.gov/hubzone/map/search`
4. Response is parsed to determine HubZone status (Qualified/Redesignated)
5. Appropriate visual indicator script is injected to display status on the page

### Site-Specific Implementations

- **Redfin**: Extracts from `.street-address` and `.bp-cityStateZip` elements
- **LoopNet**: Extracts from `.breadcrumbs__crumb-title` element
- **Zillow**: Extracts from `#ds-chip-property-address` element

### Visual Indicators

- Green checkmark (`check-line.png`) for qualified HubZones
- Orange checkbox (`checkbox-line.png`) for redesignated HubZones
- Images are injected as 20x20px icons next to property addresses

## Development Notes

### File Structure
- No package.json - this is a vanilla JavaScript Chrome extension
- All JavaScript files are in the root directory
- Images stored in `/images/` directory
- Uses Manifest V3 format

### Testing
- Load extension in Chrome via Developer Mode
- Test on actual Redfin, LoopNet, and Zillow listing pages
- Check browser console for address extraction and API response logs
- Visual indicators should appear within 1 second of page load

### API Dependencies
- Relies on SBA HubZone map API remaining stable
- Hardcoded CSRF token and session cookie may need updating if API authentication changes
- API queries use a fixed date parameter (2021-05-23) which may need updating

### DOM Injection Strategy
- Uses `setInterval` every 1000ms to re-inject indicators due to sites' dynamic content updates
- Checks for existing indicator (`#hubzone`) to prevent duplicates
- Targets site-specific address container classes for injection