// ==UserScript==
// @name         Deepseek Wide Chat (remove ds-scroll-area padding)
// @namespace    https://example.com/
// @version      1.1
// @description  Remove horizontal padding set by ds-scroll-area to make Deepseek chat use full width
// @match        https://chat.deepseek.com/*
// @grant        none
// @author       nSkade
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // CSS override: set padding-left/right to 0 for any element whose class name contains "ds-scroll-area"
  const css = `
    [class*="ds-scroll-area"] {
      padding-left: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
      max-width: none !important;
    }
  `;

  // Inject stylesheet early
  const style = document.createElement('style');
  style.setAttribute('data-userscript', 'deepseek-wide');
  style.textContent = css;
  document.documentElement.appendChild(style);

  // Also observe DOM for elements that may reapply inline styles or classes later,
  // and force inline removal of the specific computed padding rule.
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' || m.type === 'attributes') {
        const els = document.querySelectorAll('[class*="ds-scroll-area"]');
        els.forEach(el => {
          // remove inline padding if present
          if (el.style.paddingLeft && el.style.paddingLeft !== '0px') el.style.paddingLeft = '0';
          if (el.style.paddingRight && el.style.paddingRight !== '0px') el.style.paddingRight = '0';
          // remove shorthand padding
          if (el.style.padding && el.style.padding !== '0px') el.style.padding = '0';
        });
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

  // Safety: after load, ensure persisted override
  window.addEventListener('load', () => {
    const els = document.querySelectorAll('[class*="ds-scroll-area"]');
    els.forEach(el => {
      el.style.paddingLeft = '0';
      el.style.paddingRight = '0';
      el.style.padding = '0';
    });
  });
})();
