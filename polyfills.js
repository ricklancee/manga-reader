'use strict';

(() => {
  window.polyfillsNeeded = [];
  window.waitForWebcomponents = false;

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

  // Safari bug work around, safari sees HTMLElement
  // as an object not a function.
  if (typeof HTMLElement !== 'function') {
    const _HTMLElement = function() {};
    _HTMLElement.prototype = HTMLElement.prototype;
    HTMLElement = _HTMLElement;
  }
})();
