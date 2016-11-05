'use strict';

(function () {
  var loadScripts = function loadScripts(urls, succesCB, failCB) {
    var count = urls.length;
    var errored = false;

    if (urls.length == 0) return succesCB();

    urls.forEach(function (url) {
      var script = document.createElement('script');
      script.onload = function () {
        if (errored) return;
        if (! --count) succesCB();
      };
      script.onerror = function () {
        if (errored) return;
        failCB();
        errored = true;
      };
      script.src = url;
      document.head.insertBefore(script, document.head.firstChild);
    });
  };

  // The base path of the polyfills
  var scriptSrc = document.querySelector('script[src*="polyfills/polyfills.js"]').src;
  var basePath = scriptSrc.match(/^(.*)polyfills\/polyfills\.js$/i);
  if (basePath) {
    basePath = basePath[1];
  }

  var polyfillsNeeded = [];
  var waitForWebcomponents = false;

  if (!('Promise' in window)) {
    polyfillsNeeded.push(basePath + 'polyfills/promise.js');
  }

  if (!'URL' in window) {
    polyfillsNeeded.push(basePath + 'polyfills/url.js');
  }

  if (!('fetch' in window)) {
    polyfillsNeeded.push(basePath + 'polyfills/fetch/fetch.js');
  }

  if (!('registerElement' in document)) {
    polyfillsNeeded.push(basePath + 'polyfills/webcomponentsjs/CustomElements.min.js');
    waitForWebcomponents = true;
  }

  // Shim for a Safari bug work around, safari sees HTMLElement
  // as an object not a function.
  if (typeof HTMLElement !== 'function') {
    var _HTMLElement = function _HTMLElement() {};
    _HTMLElement.prototype = HTMLElement.prototype;
    HTMLElement = _HTMLElement;
  }

  var polyFillsLoadedEvent = new CustomEvent('polyfillsLoaded', {
    bubbles: true
  });

  // Load the polyfills
  loadScripts(polyfillsNeeded, function () {
    if (waitForWebcomponents) {
      window.addEventListener('WebComponentsReady', function () {
        requestAnimationFrame(function () {
          document.dispatchEvent(polyFillsLoadedEvent);
        });
      });
    } else {
      requestAnimationFrame(function () {
        document.dispatchEvent(polyFillsLoadedEvent);
      });
    }
  }, function () {
    throw new Error('Failed to load required polyfills');
  });
})();
