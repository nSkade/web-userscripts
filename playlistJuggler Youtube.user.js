// ==UserScript==
// @name         playlistJuggler Youtube
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Send current YouTube video link to playlistJuggler
// @author       nSkade
// @match        https://www.youtube.com/watch*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function addButton() {
        // Stop if the button already exists
        if (document.getElementById('sendToPythonBtn')) return;

        // Find the stable target element: the container holding the Like, Dislike, Share buttons, etc.
        const actionContainer = document.querySelector('#actions.style-scope.ytd-watch-metadata');

        if (!actionContainer) {
            // The container hasn't loaded yet. Retry in a moment.
            setTimeout(addButton, 500);
            return;
        }

        let button = document.createElement('button');
        button.id = 'sendToPythonBtn';
        button.textContent = 'Juggle';

        // Styles to integrate with YouTube's interface
        button.style.marginLeft = '8px';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#FF0000';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '20px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = '500';
        button.style.textTransform = 'uppercase';
        button.style.fontSize = '14px';

        button.onclick = function() {
            let videoUrl = window.location.href;

            GM_xmlhttpRequest({
                method: 'POST',
                // FIX: Use 127.0.0.1 to avoid connection refusal errors
                url: 'http://127.0.0.1:5000/receive_url',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({ url: videoUrl }),

                // FIX: Remove the success alert for silent operation
                //onload: function(response) {
                //    // Logs a message to the browser console for confirmation
                //    console.log('URL successfully sent to Python:', response.responseText);
                //},
                //onerror: function(err) {
                //    // Keeps the error alert/log to help with debugging connection failures
                //    let errMsg = typeof err === 'object' ? JSON.stringify(err) : err;
                //    alert('Error sending URL to Python server. Check console for details. Error: ' + errMsg);
                //    console.error('GM_xmlhttpRequest error:', err);
                //}
            });
        };

        // Insert the button into the container
        actionContainer.prepend(button);
    }

    // Initial check and run
    addButton();

    // Set up observer to handle YouTube's Single-Page Application (SPA) navigation
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            // Re-add button after navigating to a new video
            setTimeout(addButton, 500);
        }
    });

    // Observe the document body for changes in the entire subtree
    observer.observe(document, { subtree: true, childList: true });

})();
