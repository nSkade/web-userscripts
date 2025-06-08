// ==UserScript==
// @name         Perplexity Remove Button Links (Persistent)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Continuously replaces Perplexity's inline button links with plain text for easier copying
// @author       nSkade
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function replaceButtons() {
        // Select all matching buttons
        const buttons = document.querySelectorAll('button.cursor-pointer.inline.underline');
        buttons.forEach(btn => {
            // Only replace if button is inside a <strong>
            if (btn.parentElement && btn.parentElement.tagName === 'STRONG') {
                // Avoid replacing if already replaced
                if (btn.getAttribute('data-replaced') === 'true') return;
                const span = document.createElement('span');
                span.textContent = btn.textContent;
                span.style.fontWeight = 'bold';
                btn.parentElement.replaceChild(span, btn);
            }
        });
    }

    // Run every 500ms to catch dynamic updates and re-renders
    setInterval(replaceButtons, 500);
})();
