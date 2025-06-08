// ==UserScript==
// @name         Shadertoy Tab Title Modifier
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       nSkade
// @description  Appends "shadertoy" to the title of Shadertoy pages, even after dynamic updates
// @match        https://www.shadertoy.com/*
// @grant        none
// ==/UserScript==

(function() {
    const target = document.querySelector('title');
    if (!target) return;

    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
                const currentTitle = document.title;
                if (!currentTitle.includes("shadertoy")) {
                    document.title = currentTitle + " (shadertoy)";
                }
            }
        }
    });

    observer.observe(target, { childList: true });

    // Initial set, if needed
    if (!document.title.includes("shadertoy")) {
        document.title = document.title + " (shadertoy)";
    }
})();
