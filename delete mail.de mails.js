// ==UserScript==
// @name         delete mail.de mails
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       nSkade
// @match        https://my.mail.de/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mail.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
     var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {

            var elements = document.getElementsByClassName("td from");
            console.log(elements);
            console.log(elements);
            for (var i = 0; i < elements.length; i++) {
                if (elements.item(i).innerHTML.includes("mail.de")) {
                    //match has been made
                    //if (elements.item(i).parentElement.querySelector(".actions") != null) {
                    //    if (elements.item(i).parentElement.querySelector(".actions").querySelector(".delete") != null) {
                    //        console.log("found element");
                    //        elements.item(i).parentElement.querySelector(".actions").querySelector(".delete").click();
                    //    }
                    //}
                    //if (elements.item(i).parentElement) { // Check if parentElement exists
                    //    const actionsDiv = elements.item(i).parentElement.querySelector(".actions");
                    //    if (actionsDiv && actionsDiv.querySelector(".delete")) { // Check for both actions and delete divs
                    //        actionsDiv.querySelector(".delete").click();
                    //    }
                    //}
                    if (elements.item(i).parentElement) {
                        const actionsDiv = elements.item(i).parentElement.querySelector(".actions");
                        if (actionsDiv && actionsDiv.querySelector(".delete")) {
                            const deleteDiv = actionsDiv.querySelector(".delete");
                            const clickEvent = new MouseEvent('click', {
                                bubbles: true, // Allow event to bubble up
                                cancelable: true // Allow default behavior to be canceled
                            });
                            deleteDiv.dispatchEvent(clickEvent);
                        }
                    }
                }
            }
        });
    });
    observer.observe(document, { childList: true, subtree: true });
    // Your code here...
    // var elements = document.getElementsByClassName("td from");
    // fire(elements);
})();