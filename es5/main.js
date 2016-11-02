'use strict';

// Util
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

window.addEventListener('load', function (_) {
  loadScripts(window.polyfillsNeeded, function (_) {
    if (window.waitForWebcomponents) {
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