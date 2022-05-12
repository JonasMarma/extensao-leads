'use strict';

const script = document.createElement('script');
script.setAttribute("type", "module");

if (typeof browser === "undefined") {
    var browser = chrome;
}

script.setAttribute("src", browser.runtime.getURL('src/main.js'));
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(script, head.lastChild);