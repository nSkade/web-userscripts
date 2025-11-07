// ==UserScript==
// @name         YouTube Channel Home/Featured to Videos Redirect
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Redirects YouTube channel home and featured pages to their videos section
// @author       nSkade
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const channelRegex = /^https:\/\/www\.youtube\.com\/(@[\w-]+|channel\/[\w-]+|c\/[\w-]+)(\/featured)?\/?$/;

    function redirectToVideos() {
        if (channelRegex.test(window.location.href)) {
            let newUrl = window.location.href.replace(/\/?$/, '/videos');
            newUrl = newUrl.replace('/featured', '/videos');
            if (window.location.href !== newUrl) {
                window.history.pushState(null, '', newUrl);
                window.dispatchEvent(new Event('popstate'));
            }
        }
    }

    // Initial check
    redirectToVideos();

    // Listen for YouTube spa navigation events
    document.addEventListener('yt-navigate-finish', redirectToVideos);
})();
