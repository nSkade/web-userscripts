// ==UserScript==
// @name         GitHub PDF Viewer Button
// @namespace    http://tampermonkey.net/
// @author       nSkade
// @version      0.7
// @description  Add a button to view full PDF using browser's PDF viewer (works with client-side routing)
// @match        https://github.com/*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addViewerButton() {
        if (!window.location.href.endsWith('.pdf')) return;
        if (document.querySelector('#full-pdf-viewer-button')) return;

        let currentURL = window.location.href;
        let rawURL = currentURL.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');

        let button = document.createElement('a');
        button.id = 'full-pdf-viewer-button';
        button.textContent = 'View Full PDF';
        button.href = rawURL;
        button.target = '_blank';
        button.style.cssText = 'display: inline-block; margin: 10px; padding: 10px 20px; background-color: #2ea44f; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;';

        let container = document.querySelector('main');
        if (container) {
            container.insertBefore(button, container.firstChild);
        }
    }

    function checkForPDFAndAddButton() {
        if (window.location.href.endsWith('.pdf')) {
            addViewerButton();
        } else {
            let button = document.querySelector('#full-pdf-viewer-button');
            if (button) button.remove();
        }
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                checkForPDFAndAddButton();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Also check immediately when the script runs
    checkForPDFAndAddButton();
})();
