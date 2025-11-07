// ==UserScript==
// @name         Duck.ai — max-width chat
// @description  users and FOSS FTW
// @namespace    https://duckduckgo.com/
// @version      1.5
// @author       nSkade
// @match        https://duckduckgo.com/*
// @match        https://*.duck.ai/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // --- Config: choose which mode(s) to run ---
  // modeA: strict — apply only when computed has BOTH min-height:100% AND flex-shrink:0
  // modeB: fingerprint — apply when element has a small set of stable layout properties
  const ENABLE_MODE_A = true;
  const ENABLE_MODE_B = true;

  // helper to set inline important styles
  function setMaxWidth(el) {
    try {
      el.style.setProperty('max-width', '100%', 'important');
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
    } catch (e) { /* ignore */ }
  }

  // Mode A: strict match: min-height ≈ 100% and flex-shrink == 0
  function matchesModeA(el) {
    try {
      const cs = getComputedStyle(el);
      if (!cs) return false;
      const minH = (cs.getPropertyValue('min-height') || '').trim().toLowerCase();
      const flexShrink = (cs.getPropertyValue('flex-shrink') || '').trim();
      const wFlex = (cs.getPropertyValue('-webkit-flex-shrink') || '').trim();

      const minHMatch = minH === '100%' || minH === '100vh' || minH === '100dvh' || /100\s*(%|vh|dvh)/.test(minH);
      const flexMatch = flexShrink === '0' || wFlex === '0';
      return minHMatch && flexMatch;
    } catch (e) { return false; }
  }

  // Mode B: fingerprint match — check a small set of stable layout props.
  // We'll check 3 of these (display:flex, flex-direction:column, margin centered,
  // has max-width set (often var(--theme-dc-chat-max-width)), padding left/right or width:100%).
  function matchesModeB(el) {
    try {
      const cs = getComputedStyle(el);
      if (!cs) return false;

      const display = (cs.getPropertyValue('display') || '').trim();
      const flexDir = (cs.getPropertyValue('flex-direction') || '').trim();
      const justify = (cs.getPropertyValue('justify-content') || '').trim();
      const margin = (cs.getPropertyValue('margin') || '').replace(/\s+/g, '');
      const maxW = (cs.getPropertyValue('max-width') || '').trim();
      const padL = (cs.getPropertyValue('padding-left') || '').trim();
      const padR = (cs.getPropertyValue('padding-right') || '').trim();
      const width = (cs.getPropertyValue('width') || '').trim();

      const isFlex = display === 'flex' || display.indexOf('flex') !== -1;
      const isCol = flexDir === 'column' || /column/.test(flexDir);
      const justifiedStart = justify === 'flex-start' || /flex-start/.test(justify);
      const centered = /0\s*auto/.test(cs.getPropertyValue('margin'));
      const hasMaxWidthVar = /var$--theme-dc-chat-max-width$/.test(maxW) || maxW && maxW !== 'none';
      const hasPadding = !!(padL || padR);
      const fullWidth = width === '100%' || width === '100vw';

      // require display:flex + at least two of the supporting signals to reduce false positives
      let signals = 0;
      if (isFlex) signals++;
      if (isCol) signals++;
      if (centered) signals++;
      if (hasMaxWidthVar) signals++;
      if (hasPadding) signals++;
      if (fullWidth) signals++;

      return signals >= 3;
    } catch (e) { return false; }
  }

  // Apply logic to an element and optionally its subtree
  function tryApplyTo(el) {
    if (!(el && el.nodeType === 1)) return;
    try {
      if (ENABLE_MODE_A && matchesModeA(el)) setMaxWidth(el);
      else if (ENABLE_MODE_B && matchesModeB(el)) setMaxWidth(el);
    } catch (e) {}
  }

  // Scan whole document (used initially)
  function scanDocument() {
    try {
      const all = document.querySelectorAll('body *');
      for (const el of all) tryApplyTo(el);
    } catch (e) {}
  }

  // React to mutations: check added nodes and attribute changes
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          tryApplyTo(n);
          // quick subtree pass
          try {
            const subs = n.querySelectorAll ? n.querySelectorAll('*') : [];
            for (const s of subs) tryApplyTo(s);
          } catch (e) {}
        }
      } else if (m.type === 'attributes' && m.target && m.target.nodeType === 1) {
        tryApplyTo(m.target);
      }
    }
  });

  // Start
  setTimeout(scanDocument, 150);
  setTimeout(scanDocument, 700);
  setTimeout(scanDocument, 1800);

  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

})();
