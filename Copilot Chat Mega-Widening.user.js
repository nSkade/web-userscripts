// ==UserScript==
// @name         Copilot Chat Mega-Widening
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Make the entire chat UI wider without breaking layout or scrolling on copilot.microsoft.com
// @author       nSkade
// @match        https://copilot.microsoft.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const css = `
        body, html {
            overflow-x: hidden !important;
        }

        main, main > div, main > div > div {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding-left: 2vw !important;
            padding-right: 2vw !important;
        }

        /* Expand inner conversation container */
        div[class*="conversation"] {
            width: 100% !important;
            max-width: 100% !important;
        }

        /* Optional: adjust wrapper if there's a flex or grid layout involved */
        [class*="layout"], [class*="container"], [class*="wrapper"] {
            max-width: 100% !important;
            width: 100% !important;
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
        if (!document.head.contains(style)) {
            document.head.appendChild(style);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
