// ==UserScript==
// @name         Discord Move avatar / add suffix
// @namespace    https://example.local/
// @version      1.0
// @author       nSkade
// @description  discord accessibility useless
// @match        https://discord.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  // Defaults
  const DEFAULTS = {
      moveAvatar: true, // when true, move avatar to immediately after username span
      appendSuffix: true, // when true, ensure ":::” is last inside the header (after username and avatar)
  };

  // Storage helpers: prefer GM_* if available (Tampermonkey), else localStorage
  async function getValue(key, def) {
    try {
      if (typeof GM_getValue === 'function') {
        const v = GM_getValue(key);
        return v === undefined ? def : v;
      }
    } catch (e) { /* ignore */ }
    const raw = localStorage.getItem('discord_script_' + key);
    return raw === null ? def : JSON.parse(raw);
  }
  async function setValue(key, val) {
    try {
      if (typeof GM_setValue === 'function') {
        await GM_setValue(key, val);
        return;
      }
    } catch (e) { /* ignore */ }
    localStorage.setItem('discord_script_' + key, JSON.stringify(val));
  }

  // Menu commands for toggling options (Tampermonkey menu support)
  try {
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Toggle moveAvatar', async () => {
        const cur = await getValue('moveAvatar', DEFAULTS.moveAvatar);
        await setValue('moveAvatar', !cur);
        alert('moveAvatar set to ' + (!cur));
      });
      GM_registerMenuCommand('Toggle appendSuffix', async () => {
        const cur = await getValue('appendSuffix', DEFAULTS.appendSuffix);
        await setValue('appendSuffix', !cur);
        alert('appendSuffix set to ' + (!cur));
      });
      GM_registerMenuCommand('Show current options', async () => {
        const a = await getValue('moveAvatar', DEFAULTS.moveAvatar);
        const b = await getValue('appendSuffix', DEFAULTS.appendSuffix);
        alert('moveAvatar: ' + a + '\nappendSuffix: ' + b);
      });
    }
  } catch (e) {
    // no-op
  }

  // Regex for username span id
  const usernameIdRe = /^message-username.*/;

  function isHeaderH3(el) {
    return el && el.tagName === 'H3' && /\bheader_/.test(el.className);
  }

  // Ensure suffix node exists and is last; create text node ":::" within a span.suffix_***
  function ensureSuffix(header) {
    if (!header) return;
    // Look for an existing suffix span we created
    const existing = header.querySelector('span.__tampermonkey_suffix');
    if (existing) {
      // move to last position
      header.appendChild(existing);
      return;
    }
    // create suffix span
    const span = document.createElement('span');
    span.className = '__tampermonkey_suffix';
    span.textContent = '::  ';
    // small style to avoid interfering with layout (optional)
    span.style.marginLeft = '4px';
    header.appendChild(span);
  }

  // Remove suffix if appendSuffix is false (keeps DOM clean)
  function removeSuffix(header) {
    if (!header) return;
    const existing = header.querySelector('span.__tampermonkey_suffix');
    if (existing) existing.remove();
  }

  // Move avatar to after usernameSpan (if found and is before username)
  function moveAvatarAfterUsername(header, usernameSpan) {
    if (!header || !usernameSpan) return;
    const imgs = header.getElementsByTagName('img');
    let targetImg = null;
    for (let i = 0; i < imgs.length; i++) {
      const im = imgs[i];
      if (/\bavatar/.test(im.className || '')) {
        if (im.compareDocumentPosition(usernameSpan) & Node.DOCUMENT_POSITION_FOLLOWING) {
          targetImg = im;
          break;
        }
      }
    }
    if (!targetImg) return;
    const afterNode = usernameSpan.nextSibling;
    if (afterNode) header.insertBefore(targetImg, afterNode);
    else header.appendChild(targetImg);
  }

  // Main fix for a header element: apply moveAvatar and/or appendSuffix according to options
  async function fixHeader(header) {
    if (!header) return;
    // find username span
    const spans = header.getElementsByTagName('span');
    let usernameSpan = null;
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      if (s.id && usernameIdRe.test(s.id)) {
        usernameSpan = s;
        break;
      }
    }
    if (!usernameSpan) {
      // if appendSuffix is false, remove any lingering suffix
      const appendSuffix = await getValue('appendSuffix', DEFAULTS.appendSuffix);
      if (!appendSuffix) removeSuffix(header);
      return;
    }

    const moveAvatar = await getValue('moveAvatar', DEFAULTS.moveAvatar);
    const appendSuffix = await getValue('appendSuffix', DEFAULTS.appendSuffix);

    if (moveAvatar) moveAvatarAfterUsername(header, usernameSpan);

    if (appendSuffix) {
      // Ensure suffix is last after any avatar/image elements and username
      ensureSuffix(header);
    } else {
      removeSuffix(header);
    }
  }

  // Process a node and its descendant headers
  function processNode(node) {
    if (!node) return;
    if (isHeaderH3(node)) fixHeader(node);
    const headers = node.querySelectorAll ? node.querySelectorAll('h3') : [];
    for (let i = 0; i < headers.length; i++) {
      if (/\bheader_/.test(headers[i].className)) fixHeader(headers[i]);
    }
  }

  // Initial pass
  processNode(document.body);

  // Observe DOM
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        processNode(node);
      }
      // attribute changes on existing nodes may also be relevant (e.g., classes)
      if (m.type === 'attributes' && isHeaderH3(m.target)) {
        fixHeader(m.target);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id'],
  });

  // Periodic retries for lazy content
  let retries = 1;
  const retryInterval = setInterval(() => {
    processNode(document.body);
    if (--retries <= 0) clearInterval(retryInterval);
  }, 2000);

  // Expose a simple API on window for quickly toggling options from console if desired
  window.__discordTamper = {
    set: async (k, v) => { await setValue(k, v); },
    get: async (k) => { return await getValue(k, DEFAULTS[k]); },
    defaults: DEFAULTS,
  };
})();
