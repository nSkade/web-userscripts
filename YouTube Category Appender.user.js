// ==UserScript==
// @name         YouTube Category Appender
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Append YouTube video category to URL, excluding specified categories and removing listeners when excluded
// @author       nSkade
// @match        https://www.youtube.com/watch?v=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration: Add categories you want to exclude
    const excludedCategories = ['Music','Education'];
    // Example: const excludedCategories = ['Music', 'Entertainment', 'Sports'];

    let intervalId;

    function getCategoryFromMetadata() {
        const metaTag = document.querySelector('meta[itemprop="genre"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    }

    function shouldAppendCategory(category) {
        return category && !excludedCategories.includes(category);
    }

    function appendCategoryToUrl(category) {
        if (shouldAppendCategory(category)) {
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.has('category')) {
                currentUrl.searchParams.set('category', category);
                window.history.pushState({}, '', currentUrl.toString());
                console.log('Category appended:', category);
            }
            return true;
        } else if (category) {
            console.log('Category excluded:', category);
            return false;
        }
        return true; // Continue checking if category is null
    }

    function removeListeners() {
        clearInterval(intervalId);
        document.removeEventListener('yt-navigate-finish', onNavigateFinish);
        console.log('Listeners removed due to excluded category');
    }

    function checkAndUpdateUrl() {
        const category = getCategoryFromMetadata();
        if (category) {
            const shouldContinue = appendCategoryToUrl(category);
            if (!shouldContinue) {
                removeListeners();
            }
        } else {
            console.log('Category not found in metadata');
        }
    }

    function onNavigateFinish() {
        setTimeout(checkAndUpdateUrl, 1000);
    }

    // Run after a short delay to allow for dynamic content to load
    setTimeout(() => {
        checkAndUpdateUrl();
        // Set up interval and store its ID
        intervalId = setInterval(checkAndUpdateUrl, 1000);
        // Add navigation event listener
        document.addEventListener('yt-navigate-finish', onNavigateFinish);
    }, 1000);
})();
