// ==UserScript==
// @name         YouTube Universal Video Reload
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Forces page reload on thumbnail or title click, avoiding extension conflicts.
// @author       nSkade
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isSearchPage() {
        return window.location.href.includes('/results?');
    }

    function handleClick(event) {
        let videoContainers;

        if (isSearchPage()) {
            videoContainers = ['ytd-video-renderer']; // Search results
        } else {
            videoContainers = ['ytd-rich-item-renderer']; // Subscriptions/Channel videos
        }

        const target = event.target.closest(videoContainers.join(','));
        const thumbnail = event.target.closest('a#thumbnail');
        let title = null;

        if (target) {
            title = event.target.closest('a#video-title');
            if (!title) {
                const possibleTitle = event.target.closest('yt-formatted-string#video-title');
                if (possibleTitle) {
                    title = possibleTitle.closest('a');
                }
            }
        }

        const videoLink = target?.querySelector('a#video-title, a#thumbnail');

        if (target && (thumbnail || title) && videoLink && videoLink.href.includes('/watch?v=')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.href = videoLink.href;
        }
    }

    document.addEventListener('click', handleClick, true);
})();

// doesnt work on search box
//// ==UserScript==
//// @name         YouTube Universal Video Reload (Title & Thumbnail v10)
//// @namespace    http://tampermonkey.net/
//// @version      2.2
//// @description  Forces page reload on thumbnail or title click, avoiding extension conflicts.
//// @author       You
//// @match        https://www.youtube.com/*
//// @grant        none
//// ==/UserScript==
//
//(function() {
//    'use strict';
//
//    function handleClick(event) {
//        const videoContainers = ['ytd-rich-item-renderer'];
//        const target = event.target.closest(videoContainers.join(','));
//        const thumbnail = event.target.closest('a#thumbnail');
//        let title = null;
//
//        if (target) {
//            title = event.target.closest('a#video-title');
//            if (!title) {
//                const possibleTitle = event.target.closest('yt-formatted-string#video-title');
//                if (possibleTitle) {
//                    title = possibleTitle.closest('a');
//                }
//            }
//        }
//
//        const videoLink = target?.querySelector('a#video-title, a#thumbnail');
//
//        if (target && (thumbnail || title) && videoLink && videoLink.href.includes('/watch?v=')) {
//            event.preventDefault();
//            event.stopImmediatePropagation();
//            window.location.href = videoLink.href;
//        }
//    }
//
//    document.addEventListener('click', handleClick, true);
//})();

// has problems with better youtube subbox
//// ==UserScript==
//// @name         YouTube Universal Video Reload
//// @namespace    http://tampermonkey.net/
//// @version      0.3
//// @description  Forces page reload when navigating YouTube videos from any page
//// @author       You
//// @match        https://www.youtube.com/*
//// @grant        none
//// ==/UserScript==
//
//(function() {
//    'use strict';
//
//    function handleClick(event) {
//        const videoContainers = [
//            'ytd-video-renderer',// Search results
//            'ytd-grid-video-renderer', // Subscriptions/Channel videos
//            'ytd-rich-item-renderer' // Homepage recommendations
//        ];
//
//        const target = event.target.closest(videoContainers.join(','));
//        const videoLink = target?.querySelector('a#video-title, a#thumbnail');
//
//        if (videoLink && videoLink.href.includes('/watch?v=')) {
//            event.preventDefault();
//            event.stopImmediatePropagation();
//
//            console.log('Reloading video:', videoLink.href);
//            window.location.href = videoLink.href;
//        }
//    }
//
//    document.addEventListener('click', handleClick, true);
//})();


//// ==UserScript==
//// @name         YouTube Search Video Reload
//// @namespace    http://tampermonkey.net/
//// @version      0.2
//// @description  Reloads the page when a video is clicked from YouTube search results.
//// @author       You
//// @match        https://www.youtube.com/results*
//// @grant        none
//// ==/UserScript==
//
//(function() {
//    'use strict';
//
//    function handleClick(event) {
//        let target = event.target;
//
//        // Find the closest video link (<a> tag inside ytd-video-renderer)
//        const videoLink = target.closest('ytd-video-renderer a#video-title');
//
//        if (videoLink) {
//            event.preventDefault(); // Prevent default navigation
//            const videoUrl = videoLink.href;
//            console.log("Reloading:", videoUrl); // Debugging
//            window.location.href = videoUrl; // Force reload
//        }
//    }
//
//    // Attach click listener to the main content area
//    const contentArea = document.querySelector('ytd-page-manager'); // More reliable selector
//    if (contentArea) {
//        contentArea.addEventListener('click', handleClick);
//    } else {
//        console.error("YouTube Search Video Reload: Content area not found."); // Debugging
//    }
//
//})();
