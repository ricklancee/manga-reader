'use strict';

window.addEventListener('load', function (_) {
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