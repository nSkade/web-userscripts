// ==UserScript==
// @name         Perplexity Remove Button Links
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Continuously replaces Perplexity's inline button links with plain text for easier copying
// @author       nSkade
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let debounceTimer = null;

    function hideButtonAndShowText() {
        document.querySelectorAll('.prose.text-pretty').forEach(container => {
            // Entferne alle alten Spans
            container.querySelectorAll('.button-text-copy').forEach(span => span.remove());

            const buttons = container.querySelectorAll('button.cursor-pointer.inline.underline');
            buttons.forEach(btn => {
                // Button verstecken
                btn.style.width = '0';
                btn.style.height = '0';
                btn.style.overflow = 'hidden';
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
                btn.setAttribute('aria-hidden', 'true');

                // Neuen Span direkt nach dem Button einfügen
                const span = document.createElement('span');
                span.className = 'button-text-copy';
                span.style.fontWeight = 'bold';
                span.textContent = btn.textContent;
                btn.parentElement.insertBefore(span, btn.nextSibling);
            });
        });
    }

    // Debounce-Funktion: nur einmal pro 500 ms ausführen
    function debouncedHideButtonAndShowText() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(hideButtonAndShowText, 500);
    }

    // MutationObserver für dynamische Inhalte
    const observer = new MutationObserver(debouncedHideButtonAndShowText);
    observer.observe(document.body, { childList: true, subtree: true });

    // Einmal initial ausführen
    hideButtonAndShowText();
})();
