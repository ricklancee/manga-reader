'use strict';

let polyfillsNeeded = [];
let waitForWebcomponents = false;

const loadScripts = (urls, yeyCallback, neyCallback) => {
  let count = urls.length;
  let errored = false;

  if (urls.length == 0) return yeyCallback();

  urls.forEach(function(url) {
    var script = document.createElement('script');
    script.onload = function() {
      if (errored) return;
      if (!--count) yeyCallback();
    };
    script.onerror = function() {
      if (errored) return;
      neyCallback();
      errored = true;
    };
    script.src = url;
    document.head.insertBefore(script, document.head.firstChild);
  });
};

if (!('Promise' in window)) {
  polyfillsNeeded.push('polyfills/promise.js');
}

if (!('fetch' in window)) {
  polyfillsNeeded.push('polyfills/fetch/fetch.js');
}

if (!('registerElement' in document)) {
  polyfillsNeeded.push('polyfills/webcomponentsjs/CustomElements.min.js');
  waitForWebcomponents = true;
}

// Safari bug workaround
if (typeof HTMLElement !== 'function') {
  var _HTMLElement = function() {};
  _HTMLElement.prototype = HTMLElement.prototype;
  HTMLElement = _HTMLElement;
}
