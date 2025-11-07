// ==UserScript==
// @name         Runes over Latin
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Replaces Latin letters with runes on demand via a button.
// @author       nSkade
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const runeMap = {
        a: 'ᚪ', b: 'ᛒ', c: 'ᚳ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚻ', i: 'ᛁ',
        j: 'ᛄ', k: 'ᛣ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᚩ', p: 'ᛈ', q: 'ᛢ', r: 'ᚱ',
        s: 'ᛋ', t: 'ᛏ', u: 'ᚢ', v: 'ᚠ', w: 'ᚹ', x: 'ᛉ', y: 'ᚣ', z: 'ᛋ',
        ä: 'ᚫ', ö: 'ᛟ', ü: 'ᚢᛖ', ',': '᛫', '.': '᛫', ':': '᛬',
    };

    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/[a-zA-ZäöüÄÖÜ',''.'':']/g, (char) => {
                const lowerChar = char.toLowerCase();
                return runeMap[lowerChar] || char;
            });
        } else if (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes()) {
            const excludedTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'svg', 'canvas'];
            if (!excludedTags.includes(node.tagName)) {
                Array.from(node.childNodes).forEach(replaceTextInNode);
            }
        }
    }

    function transformPage() {
        replaceTextInNode(document.body);
    }

    // Create a button to trigger the transformation
    const transformButton = document.createElement('button');
    transformButton.textContent = 'Convert to Runes';
    transformButton.style.position = 'fixed';
    transformButton.style.top = '20px';
    transformButton.style.left = '20px';
    transformButton.style.zIndex = '1000'; // Ensure it's on top
    document.body.appendChild(transformButton);

    // Add event listener to the button
    transformButton.addEventListener('click', () => {
        const savedSelection = saveSelection();
        transformPage();
        restoreSelection(savedSelection);
    });

    function saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;
        const range = selection.getRangeAt(0);
        return {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
        };
    }

    function restoreSelection(savedSelection) {
        if (!savedSelection) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        try {
            range.setStart(savedSelection.startContainer, savedSelection.startOffset);
            range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
            selection.addRange(range);
        } catch (error) {
            console.warn("Failed to restore selection:", error);
        }
    }

    // Optionally, you could still run the transformation once on page load
    // transformPage();

})();

//// ==UserScript==
//// @name         Runes over Latin
//// @namespace    http://tampermonkey.net/
//// @version      1.1
//// @description  Replaces all visible Latin letters on any webpage with equivalent runes.
//// @author       skade
//// @match        *://*/*
//// @exclude      *://*.google.com/*
//// @grant        none
//// ==/UserScript==
//
//(function () {
//    'use strict';
//
//    // Mapping of Latin letters and umlauts to runes
//    const runeMap = {
//        a: 'ᚪ',
//        b: 'ᛒ',
//        c: 'ᚳ',
//        d: 'ᛞ',
//        e: 'ᛖ',
//        f: 'ᚠ',
//        g: 'ᚷ',
//        h: 'ᚻ',
//        i: 'ᛁ',
//        j: 'ᛄ',
//        k: 'ᛣ',
//        l: 'ᛚ',
//        m: 'ᛗ',
//        n: 'ᚾ',
//        o: 'ᚩ',
//        p: 'ᛈ',
//        q: 'ᛢ',
//        r: 'ᚱ',
//        s: 'ᛋ',
//        t: 'ᛏ',
//        u: 'ᚢ',
//        v: 'ᚠ',
//        w: 'ᚹ',
//        x: 'ᛉ',
//        y: 'ᚣ',
//        z: 'ᛋ',
//        ä: 'ᚫ', // Umlaut replacements
//        ö: 'ᛟ',
//        ü: 'ᚢᛖ',
//        ',': '᛫',
//        '.': '᛫',
//        ':': '᛬',
//    };
//
//    // Function to replace Latin letters with runes
//    function replaceTextWithRunes(node) {
//        if (node.nodeType === Node.TEXT_NODE) {
//            // Replace each letter in the text node
//            node.nodeValue = node.nodeValue.replace(/[a-zA-ZäöüÄÖÜ',''.'':']/g, (char) => {
//                const lowerChar = char.toLowerCase();
//                return runeMap[lowerChar] || char; // Replace if in map, otherwise keep original
//            });
//        } else if (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes()) {
//            // Recursively apply to child nodes
//            node.childNodes.forEach(replaceTextWithRunes);
//        }
//    }
//
//    // Apply the replacement to the entire document body
//    function replaceAllText() {
//        replaceTextWithRunes(document.body);
//    }
//
//    // Run the replacement on page load and when DOM changes (e.g., dynamic content)
//    replaceAllText();
//    const observer = new MutationObserver(replaceAllText);
//    observer.observe(document.body, { childList: true, subtree: true });
//})();
//
