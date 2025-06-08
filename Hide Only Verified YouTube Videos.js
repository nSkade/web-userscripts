// ==UserScript==
// @name         Hide Only Verified YouTube Videos (Final)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Hide only YouTube videos from verified channels in search results
// @author       nSkade
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hideVerifiedVideos() {
        const videos = document.querySelectorAll('ytd-video-renderer');
        videos.forEach((video, index) => {
            // Look for the specific verified badge inside the channel name
            const badge = video.querySelector(
                'ytd-channel-name ytd-badge-supported-renderer .badge.badge-style-type-verified[aria-label="Verified"]'
            );
            if (badge) {
                video.style.display = 'none';
                console.log('Hiding verified video #' + index, badge);
            }
        });
    }

    // Observe for DOM changes
    const observer = new MutationObserver(hideVerifiedVideos);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also run on initial load
    hideVerifiedVideos();

    // Listen for YouTube navigation events (SPA)
    window.addEventListener('yt-navigate-finish', hideVerifiedVideos);
})();
