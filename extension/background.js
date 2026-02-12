// Background Service Worker

const STORAGE_KEYS = {
  COOKIE: 'push115_cookie',
  AUTO_DETECT: 'push115_auto_detect',
};

const CONTENT_SCRIPT_ID = 'push115-content-script';

// ========== Dynamic Content Script Registration ==========

async function registerContentScripts() {
  try {
    // Unregister first to avoid duplicates
    await unregisterContentScripts();
    await chrome.scripting.registerContentScripts([{
      id: CONTENT_SCRIPT_ID,
      matches: ['<all_urls>'],
      js: ['path-utils.js', 'content.js'],
      runAt: 'document_idle',
    }]);
    console.log('[BG] Content scripts registered');
  } catch (e) {
    console.error('[BG] Failed to register content scripts:', e);
  }
}

// Inject content scripts into all existing open tabs (registerContentScripts only affects future loads)
async function injectIntoExistingTabs() {
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['path-utils.js', 'content.js'],
        });
      } catch (e) {
        // Ignore tabs we can't inject into (e.g., chrome:// pages)
      }
    }
    console.log(`[BG] Injected content scripts into ${tabs.length} existing tabs`);
  } catch (e) {
    console.error('[BG] Failed to inject into existing tabs:', e);
  }
}

async function unregisterContentScripts() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
    console.log('[BG] Content scripts unregistered');
  } catch (e) {
    // Ignore error if not registered
  }
}

async function syncContentScriptState() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.AUTO_DETECT);
  const autoDetect = data[STORAGE_KEYS.AUTO_DETECT] === true;
  if (autoDetect) {
    // Verify we still have the permission
    const hasPermission = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    if (hasPermission) {
      await registerContentScripts();
    } else {
      // Permission was revoked, disable auto-detect
      await chrome.storage.local.set({ [STORAGE_KEYS.AUTO_DETECT]: false });
      await unregisterContentScripts();
    }
  } else {
    await unregisterContentScripts();
  }
}

// On install or startup, sync state
chrome.runtime.onInstalled.addListener(() => {
  syncContentScriptState();
});

chrome.runtime.onStartup.addListener(() => {
  syncContentScriptState();
});

// Watch for auto-detect setting changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEYS.AUTO_DETECT]) {
    syncContentScriptState();
  }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'API_REQUEST') {
    handleApiRequest(request, sendResponse);
    return true; // Keep the message channel open for async response
  } else if (request.action === 'GET_COOKIE') {
    handleGetCookie(request, sendResponse);
    return true;
  } else if (request.action === 'SET_COOKIE') {
    handleSetCookie(request, sendResponse);
    return true;
  } else if (request.action === 'NOTIFY') {
    handleNotify(request);
  } else if (request.action === 'REGISTER_CONTENT_SCRIPTS') {
    registerContentScripts()
      .then(() => injectIntoExistingTabs())
      .then(() => sendResponse({ success: true }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  } else if (request.action === 'UNREGISTER_CONTENT_SCRIPTS') {
    unregisterContentScripts().then(() => sendResponse({ success: true })).catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});

function parseCookieString(rawCookie) {
  if (!rawCookie) return '';
  if (typeof rawCookie === 'string') return rawCookie.trim();
  if (typeof rawCookie === 'object') {
    const parts = [];
    if (rawCookie.UID) parts.push(`UID=${rawCookie.UID}`);
    if (rawCookie.CID) parts.push(`CID=${rawCookie.CID}`);
    if (rawCookie.SEID) parts.push(`SEID=${rawCookie.SEID}`);
    return parts.join('; ');
  }
  return '';
}

function is115Host(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === '115.com' || hostname.endsWith('.115.com');
  } catch (e) {
    return false;
  }
}

async function getPersistedCookie() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.COOKIE);
  return data[STORAGE_KEYS.COOKIE] || '';
}

async function has115AuthCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.115.com' });
  const names = new Set(cookies.map(c => c.name));
  return names.has('UID') && names.has('CID') && names.has('SEID');
}

async function syncCookieStringToJar(cookieString, options = {}) {
  const { overwrite = true } = options;
  const expiresAt = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;
  const pairs = cookieString
    .split(';')
    .map(item => item.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!name || !value) continue;

    try {
      if (!overwrite) {
        const existing = await chrome.cookies.get({
          url: 'https://115.com/',
          name,
        });
        if (existing && existing.value) {
          continue;
        }
      }
      await chrome.cookies.set({
        url: 'https://115.com/',
        name,
        value,
        domain: '.115.com',
        path: '/',
        secure: true,
        sameSite: 'no_restriction',
        expirationDate: expiresAt,
      });
    } catch (e) {
      console.warn('Set cookie failed:', name, e?.message || e);
    }
  }
}

async function restorePersistedCookieIfMissing() {
  const hasAuth = await has115AuthCookies();
  if (hasAuth) return false;
  const saved = await getPersistedCookie();
  if (!saved) return false;
  await syncCookieStringToJar(saved, { overwrite: false });
  return true;
}

async function persistCookieToStorageAndJar(rawCookie) {
  const cookieString = parseCookieString(rawCookie);
  if (!cookieString) return '';

  await chrome.storage.local.set({ [STORAGE_KEYS.COOKIE]: cookieString });
  await syncCookieStringToJar(cookieString);

  return cookieString;
}

// Handle generic API requests using fetch
async function handleApiRequest(request, sendResponse) {
  try {
    const { url, method = 'GET', data = null, headers = {} } = request.details;

    const requestHeaders = { ...headers };
    if (is115Host(url)) {
      // 只在认证 cookie 缺失时恢复，避免覆盖在线会话导致掉登录
      await restorePersistedCookieIfMissing();
    }

    // Convert data to URLSearchParams for POST
    let body = undefined;
    if (method === 'POST' && data) {
      if (typeof data === 'string') {
        body = data;
      } else {
        const params = new URLSearchParams();
        for (const key in data) {
          params.append(key, data[key]);
        }
        body = params;
      }
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
      body,
      credentials: 'include',
    };

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    // Try to parse JSON
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch (e) {
      // Not JSON
    }

    // Persist cookie from qrcode login response for long-term usage
    if (
      responseJson &&
      responseJson.state === 1 &&
      responseJson.data &&
      responseJson.data.cookie &&
      typeof url === 'string' &&
      url.includes('/login/qrcode/')
    ) {
      await persistCookieToStorageAndJar(responseJson.data.cookie);
    }

    sendResponse({
      success: true,
      data: responseJson || responseText,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('API Request Error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Get cookies for a specific domain
async function handleGetCookie(request, sendResponse) {
  try {
    const cookies = await chrome.cookies.getAll({ domain: '.115.com' });
    let cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    if (!cookieString) {
      cookieString = await getPersistedCookie();
      if (cookieString) {
        await syncCookieStringToJar(cookieString, { overwrite: false });
      }
    }
    sendResponse({ success: true, cookie: cookieString });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Persist cookie explicitly from popup/content
async function handleSetCookie(request, sendResponse) {
  try {
    const cookie = request?.details?.cookie;
    const persisted = await persistCookieToStorageAndJar(cookie);
    sendResponse({ success: true, cookie: persisted });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Show notifications
function handleNotify(request) {
  const { title, message } = request.details;
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png', // Ensure this exists or use a default
    title: title,
    message: message
  });
}
