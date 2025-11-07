// ==UserScript==
// @name         YouTube Hide Donation Comments
// @namespace    http://tampermonkey.net/
// @version      1.1
// @author       nSkade
// @description  Hide YouTube comments with donation chip that actually show a price
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isDonationChipWithAmount(chip) {
        // Find the price span inside the chip
        const priceSpan = chip.querySelector('span#comment-chip-price');
        if (!priceSpan) return false;
        // Check if the text contains any digit (number)
        return /\d/.test(priceSpan.textContent);
    }

    function hideDonationThreads() {
        // Loop through all comment thread containers
        document.querySelectorAll('ytd-comment-thread-renderer').forEach(thread => {
            // Find the main comment in this thread
            const comment = thread.querySelector('ytd-comment-view-model#comment');
            if (!comment) return;
            const chip = comment.querySelector('yt-pdg-comment-chip-renderer#paid-comment-chip');
            if (chip && isDonationChipWithAmount(chip)) {
                thread.style.display = 'none';
            }
        });
    }

    // Run on load and whenever comments might change
    setInterval(hideDonationThreads, 1000);
})();
