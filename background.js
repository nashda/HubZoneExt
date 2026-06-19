// --- Cache Configuration ---
const CACHE_KEY_PREFIX = "hubzone_cache_";
const CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// --- Session Management ---
let sessionToken = null;
let sessionCookie = null;

async function fetchSession() {
  try {
    const response = await fetch("https://maps.certify.sba.gov/hubzone/map", {
      method: "GET",
      credentials: "include"
    });
    const text = await response.text();

    // Extract CSRF token from meta tag
    const tokenMatch = text.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    if (tokenMatch) {
      sessionToken = tokenMatch[1];
    }

    // Extract session cookie from response headers
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const cookieMatch = setCookie.match(/_hubzone_map_session=([^;]+)/);
      if (cookieMatch) {
        sessionCookie = cookieMatch[1];
      }
    }

    console.log("Session refreshed, token:", sessionToken ? "obtained" : "missing");
    return !!sessionToken;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return false;
  }
}

// --- Cache Functions ---
async function getCachedResult(address) {
  const key = CACHE_KEY_PREFIX + address.toLowerCase().trim();
  const result = await chrome.storage.local.get(key);
  if (result[key]) {
    const cached = result[key];
    if (Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
      console.log("Cache hit for:", address);
      return cached.status;
    }
    // Expired - remove it
    await chrome.storage.local.remove(key);
  }
  return null;
}

async function setCachedResult(address, status) {
  const key = CACHE_KEY_PREFIX + address.toLowerCase().trim();
  await chrome.storage.local.set({
    [key]: { status: status, timestamp: Date.now() }
  });
}

// --- Response Parsing ---
function parseResponse(text) {
  const begin = "var response = JSON.parse('";
  const end = "');";

  const indexOfFirst = text.indexOf(begin);
  if (indexOfFirst === -1) {
    throw new Error("Could not find response data in API response");
  }

  const cutRight = text.substring(indexOfFirst + begin.length);
  const indexOfFirstEnd = cutRight.indexOf(end);
  if (indexOfFirstEnd === -1) {
    throw new Error("Could not parse response boundaries");
  }

  const jsonStr = cutRight.substring(0, indexOfFirstEnd);
  const json = JSON.parse(jsonStr);

  if (json.hubzone && json.hubzone.length > 0) {
    return json.hubzone[0].current_status || "Unknown";
  }
  return null; // Not in a HubZone
}

// --- Indicator Injection ---
function injectIndicator(tabId, site, status) {
  const isQualified = status === "Qualified";
  const isRedesignated = status === "Redesignated";

  let icon, label;
  if (isQualified) {
    icon = "images/checkbox-line.png";
    label = "Qualified HubZone";
  } else if (isRedesignated) {
    icon = "images/check-line.png";
    label = "Redesignated HubZone";
  } else {
    icon = "images/close.png";
    label = "Not in a HubZone";
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    func: (site, icon, label) => {
      // Site-specific container selectors
      const SELECTORS = {
        redfin: ".full-address",
        loopnet: ".profile-hero-title",
        zillow: "#ds-chip-property-address"
      };

      const selector = SELECTORS[site];

      function injectHubzone() {
        if (document.getElementById("hubzone")) return;

        const container = selector.startsWith("#")
          ? document.getElementById(selector.slice(1))
          : document.getElementsByClassName(selector.slice(1))[0];

        if (!container) return;

        const div = document.createElement("div");
        div.id = "hubzone";
        div.style.display = "inline-flex";
        div.style.alignItems = "center";
        div.title = label;

        const img = document.createElement("img");
        img.src = chrome.runtime.getURL(icon);
        img.alt = label;
        img.style.height = "20px";
        img.style.width = "20px";
        img.style.marginLeft = "8px";

        div.appendChild(img);
        container.appendChild(div);
      }

      // Initial injection
      injectHubzone();

      // Use MutationObserver instead of setInterval
      const observer = new MutationObserver(() => {
        if (!document.getElementById("hubzone")) {
          injectHubzone();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    },
    args: [site, icon, label]
  });
}

// --- Error Indicator ---
function injectError(tabId, site, errorMsg) {
  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    func: (errorMsg) => {
      if (document.getElementById("hubzone-error")) return;
      console.warn("HubZoneExt error:", errorMsg);
    },
    args: [errorMsg]
  });
}

// --- Main Lookup ---
async function lookupAddress(address, tabId, site, _retried = false) {
  // Check cache first
  const cached = await getCachedResult(address);
  if (cached) {
    injectIndicator(tabId, site, cached);
    return cached;
  }

  // Ensure we have a valid session
  if (!sessionToken) {
    const success = await fetchSession();
    if (!success) {
      injectError(tabId, site, "Could not authenticate with HubZone API");
      return { error: "Authentication failed" };
    }
  }

  const queryDate = new Date().toISOString().slice(0, 10);
  const url = "https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=" +
    queryDate + "&search=" + encodeURIComponent(address);

  const headers = new Headers();
  headers.append("X-CSRF-Token", sessionToken);
  headers.append("X-Requested-With", "XMLHttpRequest");
  if (sessionCookie) {
    headers.append("Cookie", "_hubzone_map_session=" + sessionCookie);
  }

  try {
    const response = await fetch(url, { method: "GET", headers: headers, redirect: "follow" });

    if (!response.ok) {
      // Token may have expired - retry once with fresh session
      if (!_retried) {
        const refreshed = await fetchSession();
        if (refreshed) {
          return lookupAddress(address, tabId, site, true);
        }
      }
      throw new Error("API returned " + response.status);
    }

    const text = await response.text();
    const status = parseResponse(text);

    if (status) {
      await setCachedResult(address, status);
      injectIndicator(tabId, site, status);
      console.log("HubZone status for", address, ":", status);
      return status;
    }

    // Not in a HubZone — show close icon
    await setCachedResult(address, "None");
    injectIndicator(tabId, site, "None");
    return null;
  } catch (error) {
    console.error("HubZone lookup failed:", error.message);
    injectError(tabId, site, error.message);
    return { error: error.message };
  }
}

// --- Event Listeners ---
chrome.runtime.onInstalled.addListener(() => {
  console.log("HubZoneExt loaded");
  fetchSession(); // Pre-fetch session on install
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === "lookup") {
    lookupAddress(request.search, sender.tab.id, request.site)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

