// ==UserScript==
// @name         Perplexity AI Max Chat Output Width
// @version      2024.05.13
// @description  Set Perplexity chat output container to max width without breaking input
// @author       nSkade
// @match        https://www.perplexity.ai/*
// @match        https://www.perplexity.ai*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add CSS to set the chat output container to full width
    GM_addStyle(`
        .max-w-threadContentWidth {
            max-width: 90vw !important;
            width: 90vw !important;
        }
    `);

    // If Perplexity is a single-page app, re-apply on navigation
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            GM_addStyle(`
                .max-w-threadContentWidth {
                    max-width: 90vw !important;
                    width: 90vw !important;
                }
            `);
        }
    }, 800);
})();
