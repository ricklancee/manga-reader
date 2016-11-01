'use strict';

window.addEventListener('load', function (_) {
  var polyfillsNeeded = [];
  var waitForWebcomponents = false;

  var loadScripts = function loadScripts(urls, yeyCallback, neyCallback) {
    var count = urls.length;
    var errored = false;

    if (urls.length == 0) return yeyCallback();

    urls.forEach(function (url) {
      var script = document.createElement('script');
      script.onload = function () {
        if (errored) return;
        if (! --count) yeyCallback();
      };
      script.onerror = function () {
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

  if (!window.fetch) {
    polyfillsNeeded.push('polyfills/fetch/fetch.js');
  }

  if (!('registerElement' in document)) {
    polyfillsNeeded.push('polyfills/webcomponentsjs/CustomElements.min.js');
    waitForWebcomponents = true;
  }

  // Initialize
  loadScripts(polyfillsNeeded, function (_) {
    if (waitForWebcomponents) {
      window.addEventListener('WebComponentsReady', function () {
        document.registerElement('manga-reader', MangaReader);
      });
      return;
    }

    document.registerElement('manga-reader', MangaReader);
  }, function (_) {
    throw new Error('Failed to load polyfills');
  });
});