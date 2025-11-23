// ==UserScript==
// @name         Discord Move avatar / add suffix / style username
// @namespace    https://example.local/
// @version      1.1
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
      // --- NEW DEFAULTS ---
      usernameColor: '#880000', // CSS color value (e.g., '#ff0000' or 'blue'). Set to '' or 'inherit' to disable coloring.
      usernameMaxLength: 10, // Maximum length of the display name. Set to 0 or a negative number to disable limiting.
      // --------------------
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
      // --- NEW MENU COMMANDS ---
      GM_registerMenuCommand('Set usernameColor', async () => {
        const cur = await getValue('usernameColor', DEFAULTS.usernameColor);
        const newColor = prompt('Enter new username color (e.g., #ff0000 or blue). Leave blank or enter "inherit" to disable:', cur);
        if (newColor !== null) {
          await setValue('usernameColor', newColor.trim() || 'inherit');
          alert('usernameColor set to ' + (newColor.trim() || 'inherit'));
        }
      });
      GM_registerMenuCommand('Set usernameMaxLength', async () => {
        const cur = await getValue('usernameMaxLength', DEFAULTS.usernameMaxLength);
        const maxLength = prompt('Enter max username length (0 or negative to disable limit):', cur);
        if (maxLength !== null) {
          const num = parseInt(maxLength.trim(), 10);
          await setValue('usernameMaxLength', isNaN(num) ? 0 : num);
          alert('usernameMaxLength set to ' + (isNaN(num) ? 0 : num));
        }
      });
      // -------------------------
      GM_registerMenuCommand('Show current options', async () => {
        const a = await getValue('moveAvatar', DEFAULTS.moveAvatar);
        const b = await getValue('appendSuffix', DEFAULTS.appendSuffix);
        const c = await getValue('usernameColor', DEFAULTS.usernameColor);
        const d = await getValue('usernameMaxLength', DEFAULTS.usernameMaxLength);
        alert('moveAvatar: ' + a + '\nappendSuffix: ' + b + '\nusernameColor: ' + c + '\nusernameMaxLength: ' + d);
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

  // --- NEW FUNCTION: Apply styling and length limit to the inner username span ---
  function styleUsername(innerUsernameSpan, color, maxLength) {
    if (!innerUsernameSpan) return;

    // 1. Color the username
    // Reset/Set color
    innerUsernameSpan.style.color = color;

    // 2. Limit the length
    // Get the original, full username text
    const originalText = innerUsernameSpan.getAttribute('data-text');

    if (maxLength > 0 && originalText && originalText.length > maxLength) {
        // Truncate the displayed text content, add ellipsis
        const truncatedText = originalText.substring(0, maxLength) + '...';
        innerUsernameSpan.textContent = truncatedText;
        // Store the original text to allow for re-application if settings change
        innerUsernameSpan.setAttribute('data-original-text', originalText);
    } else {
        // If limit is disabled or text is short enough, ensure full text is displayed
        // Check if we previously truncated it (using data-original-text)
        const storedOriginalText = innerUsernameSpan.getAttribute('data-original-text');
        if (storedOriginalText) {
            innerUsernameSpan.textContent = storedOriginalText;
            innerUsernameSpan.removeAttribute('data-original-text');
        }
        // If we didn't store it, textContent is already the original, full text
    }
  }
  // -----------------------------------------------------------------------------

  // Main fix for a header element: apply moveAvatar and/or appendSuffix according to options
  async function fixHeader(header) {
    if (!header) return;
    // find username span (the wrapper span with the generated ID)
    const spans = header.getElementsByTagName('span');
    let usernameSpanWrapper = null;
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      if (s.id && usernameIdRe.test(s.id)) {
        usernameSpanWrapper = s;
        break;
      }
    }
    if (!usernameSpanWrapper) {
      // if appendSuffix is false, remove any lingering suffix
      const appendSuffix = await getValue('appendSuffix', DEFAULTS.appendSuffix);
      if (!appendSuffix) removeSuffix(header);
      return;
    }

    // The actual username span is the first child (the one with the username_c19a55 class)
    const innerUsernameSpan = usernameSpanWrapper.querySelector('span[role="button"]');

    const moveAvatar = await getValue('moveAvatar', DEFAULTS.moveAvatar);
    const appendSuffix = await getValue('appendSuffix', DEFAULTS.appendSuffix);
    const usernameColor = await getValue('usernameColor', DEFAULTS.usernameColor); // NEW
    const usernameMaxLength = await getValue('usernameMaxLength', DEFAULTS.usernameMaxLength); // NEW

    // NEW: Style and truncate the username
    if (innerUsernameSpan) {
        styleUsername(innerUsernameSpan, usernameColor, usernameMaxLength);
    }

    if (moveAvatar) moveAvatarAfterUsername(header, usernameSpanWrapper);

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
      // NEW: Also check for mutations on the username wrapper itself,
      // as Discord can update its contents or attributes (like data-text).
      if (m.type === 'attributes' && m.target.id && usernameIdRe.test(m.target.id)) {
        fixHeader(m.target.closest('h3'));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'data-text'], // Added data-text to attributeFilter
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