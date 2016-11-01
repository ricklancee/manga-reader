window.addEventListener('load', _ => {
  loadScripts(polyfillsNeeded, _ => {
    if (waitForWebcomponents) {
      window.addEventListener('WebComponentsReady', function() {
        document.registerElement('manga-reader', MangaReader);
      });
      return;
    }

    document.registerElement('manga-reader', MangaReader);
  }, _ => {
    throw new Error('Failed to load polyfills');
  });
});
