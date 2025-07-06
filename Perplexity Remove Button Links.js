// ==UserScript==
// @name         Perplexity Remove Button Links
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  Continuously replaces Perplexity's inline button links with plain text for easier copying
// @author       nSkade
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function replaceButtons() {
        const buttons = document.querySelectorAll('button.cursor-pointer.inline.underline');
        buttons.forEach(btn => {
            if (( btn.parentElement.tagName === 'STRONG' &&
                 btn.parentElement.parentElement.className === "my-0" )
                || ( btn.parentElement.className.includes("mb-xs mt-5 text-base")
                    )
            ) {
                if (btn.getAttribute('data-replaced') === 'true') return;
                const span = document.createElement('span');
                span.textContent = btn.textContent;
                span.style.fontWeight = 'bold';
                btn.parentElement.replaceChild(span, btn);
            }
        });
    }

    // Run once on load
    replaceButtons();

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(replaceButtons);
    observer.observe(document.body, { childList: true, subtree: true });
})();
